using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

namespace SharpJS.TypeScript {
   public static class Helpers {
      public static void Deconstruct<K, V>(this KeyValuePair<K, V> kvp, out K key, out V value) {
         key = kvp.Key;
         value = kvp.Value;
      }

      public static bool Add<K, V>(this Dictionary<K, HashSet<V>> dict, K key, V value) {
         if (!dict.TryGetValue(key, out var set)) {
            set = dict[key] = new HashSet<V>();
         }
         return set.Add(value);
      }
   }

   public class TypeScriptProjectTranspiler {
      public static void Transpile(Project project, MSBuildWorkspace workspace, Compilation compilation, string defaultNamespace) {
         var (classes, structs, enums) = SolutionSearcher.FindTypes(project).Result;
         var types = new IReadOnlyList<BaseTypeDeclarationSyntax>[] { classes, structs, enums }.SelectMany(x => x).ToList();
         var typeByFQTN = types.ToDictionary(c => c.SJSGetFullEmittedIdentifier());
         var typeToFilePath = types.ToDictionary(c => c, c => c.GetLocation().GetMappedLineSpan().Path);
         var fqtnToFilePath = typeByFQTN.ToDictionary(kvp => kvp.Key, kvp => typeToFilePath[kvp.Value]);
         var typesByFilePath = types.ToLookup(c => c.GetLocation().GetMappedLineSpan().Path);
         
         foreach (var (filePath, fileTypes) in typesByFilePath.Select(g => (g.Key, g.ToList()))) {
            var emittedTypeSources = new List<string>();
            var dependentTypeNamesByPath = new Dictionary<string, HashSet<string>>();
            string entryPointFqid = null;

            foreach (var type in fileTypes) {
               var model = compilation.GetSemanticModel(type.SyntaxTree);
               var transpiler = new TypeScriptClassTranspiler(compilation, model, filePath, defaultNamespace, fqtnToFilePath);
               var result = transpiler.Emit(type);
               emittedTypeSources.Add(result.Source);
               foreach (var (path, classNames) in result.ImportedClassesByPath) {
                  dependentTypeNamesByPath.Add(path, classNames);
               }
               if (result.MainFullIdentifier != null) {
                  if (entryPointFqid != null) {
                     Console.WriteLine($"Warning: Multiple entry points detected; {entryPointFqid} => {result.MainFullIdentifier}");
                  }
                  entryPointFqid = result.MainFullIdentifier;
               }
            }

            var finalOutput = new StringBuilder();

            foreach (var (path, classNames) in dependentTypeNamesByPath) {
               var relativePath = new Uri(filePath).MakeRelativeUri(new Uri(path)).ToString();
               var extensionlessRelativePath = relativePath.Substring(0, relativePath.LastIndexOf('.'));
               finalOutput.AppendLine($"import {{ {string.Join(", ", classNames)} }} from './{extensionlessRelativePath}';");
            }
            if (dependentTypeNamesByPath.Any()) finalOutput.AppendLine();

            finalOutput.AppendLine(
$@"/* SharpJS - Emitted on {DateTime.Now} */
class SharpJsHelpers {{ 
   static conditionalAccess(val, next) {{ 
      return val ? next(val) : val;
   }}
   static valueClone(val) {{ 
      if (val.zzz__sharpjs_clone) return val.zzz__sharpjs_clone();
      return val;
   }}
   static arrayClear(arr) {{ 
      while(arr.length) arr.pop();
   }}
}}
");
            finalOutput.AppendLine();

            emittedTypeSources.ForEach(s => finalOutput.AppendLine(s));
            if (entryPointFqid != null) {
               finalOutput.AppendLine("eval(\"if (!module.parent) Program.Main(process.argv.slice(1))\");");
            }

            var outputFilePath = filePath.Substring(0, filePath.LastIndexOf('.')) + ".ts";
            File.WriteAllText(outputFilePath, finalOutput.ToString());
         }
      }
   }

   public static class RoslynExtensions {
      public static string SJSGetFullEmittedIdentifier(this SyntaxNode node) {
         return node.GetFullIdentifierText();
      }

      public static string SJSGetFullEmittedIdentifier(this ISymbol node) {
         var path = node.GetPath();
         Trace.Assert(path[0].Kind == SymbolKind.Assembly);
         Trace.Assert(path[1].Kind == SymbolKind.NetModule);
         Trace.Assert(path[2].Kind == SymbolKind.Namespace); // global
         var sb = new StringBuilder();
         for (var i = 3; i < path.Count; i++) {
            if (i != 3) sb.Append(".");
            sb.Append(path[i].Name);
         }
         return sb.ToString();
      }

      public static string SJSGetNamespaceLessFullEmittedIdentifier(this SyntaxNode node) {
         return node.GetFullIdentifierText(false);
      }

      public static string SJSGetNamespaceLessFullEmittedIdentifier(this ISymbol node) {
         var path = node.GetPath();
         Trace.Assert(path[0].Kind == SymbolKind.Assembly);
         Trace.Assert(path[1].Kind == SymbolKind.NetModule);
         Trace.Assert(path[2].Kind == SymbolKind.Namespace); // global
         var sb = new StringBuilder();
         for (var i = 3; i < path.Count; i++) {
            if (i != 3) sb.Append(".");
            if (path[i].Kind == SymbolKind.Namespace) continue;
            sb.Append(path[i].Name);
         }
         return sb.ToString();
      }
   }

   public class TypeScriptClassTranspilationResult {
      public string Source { get; set; }
      public Dictionary<string, HashSet<string>> ImportedClassesByPath { get; set; }
      public string MainFullIdentifier { get; set; }
   }

   public class TypeScriptClassTranspiler {
      private readonly Compilation compilation;
      private readonly SemanticModel model;
      private readonly string filePath;
      private readonly string defaultNamespace;
      private readonly Dictionary<string, string> fqtnToFilePath;

      private StringBuilder output;
      private Dictionary<string, HashSet<string>> importedClassesByPath;
      private string mainFullIdentifier;
      // private string mainFullIdentifier;

      public TypeScriptClassTranspiler(Compilation compilation, SemanticModel model, string filePath, string defaultNamespace, Dictionary<string, string> fqtnToFilePath) {
         this.compilation = compilation;
         this.model = model;
         this.filePath = filePath;
         this.defaultNamespace = defaultNamespace;
         this.fqtnToFilePath = fqtnToFilePath;
      }

      public TypeScriptClassTranspilationResult Emit(BaseTypeDeclarationSyntax node) {
         output = new StringBuilder();
         importedClassesByPath = new Dictionary<string, HashSet<string>>();
         mainFullIdentifier = null;

         var namespaceNode = (NamespaceDeclarationSyntax)node.Parent;
         var ns = namespaceNode.SJSGetFullEmittedIdentifier();
         if (ns != defaultNamespace) {
            throw new NotImplementedException($"Namespace mismatch: '{ns}' != '{defaultNamespace}'");
         }

         if (node is ClassDeclarationSyntax cds)
            HandleClassDeclaration(cds);

         if (node is StructDeclarationSyntax sds)
            HandleStructDeclaration(sds);

         if (node is EnumDeclarationSyntax eds)
            HandleEnumDeclaration(eds);

         return new TypeScriptClassTranspilationResult {
            Source = output.ToString(),
            ImportedClassesByPath = importedClassesByPath,
            MainFullIdentifier = mainFullIdentifier,
         };
      }

      // private void HandleNamespaceDeclaration(string fullIdentifier) {
      //    var parts = fullIdentifier.Split('.');
      //    for (var i = 2; i <= parts.Length; i++) {
      //       var subIdentifier = string.Join(".", parts.Take(i));
      //       if (!emittedNamespaces.Contains(subIdentifier)) {
      //          EmitLine($"{subIdentifier} = {subIdentifier} || {{}};");
      //          emittedNamespaces.Add(subIdentifier);
      //       }
      //    }
      // }

      private void HandleClassDeclaration(ClassDeclarationSyntax node) {
         var className = node.Identifier.Text;
         Emit("export class ");
         Emit(className + " ");
         if (node.BaseList != null) {
            Emit("extends ");
            for (var i = 0; i < node.BaseList.Types.Count; i++) {
               if (i != 0) Emit(", ");
               HandleEmitTypeIdentifier(node.BaseList.Types[i].Type);
            }
            Emit(" ");
         }
         EmitLine("{");
         Indent();
         foreach (var field in node.Members<FieldDeclarationSyntax>()) {
            HandleFieldDeclaration(field);
         }
         foreach (var method in node.Members<MethodDeclarationSyntax>()) {
            HandleMethodDeclaration(method);
         }
         Unindent();
         EmitLine("}");
      }

      private void HandleStructDeclaration(StructDeclarationSyntax node) {
         EmitLine("export class " + node.Identifier.Text + " {");
         Indent();
         foreach (var field in node.Members.OfType<FieldDeclarationSyntax>()) {
            HandleFieldDeclaration(field);
         }
         foreach (var method in node.Members.OfType<MethodDeclarationSyntax>()) {
            HandleMethodDeclaration(method);
         }
         EmitLine("public zzz__sharpjs_clone() : " + node.Identifier.Text + " {");
         Indent();
         EmitLine("let res = new " + node.Identifier.Text + "();");
         foreach (var fieldName in node.Members.OfType<FieldDeclarationSyntax>().SelectMany(fds => fds.Declaration.Variables).Select(v => v.Identifier)) {
            // TODO: don't try to copy statics/consts lol.
            EmitLine("res." + fieldName + " = SharpJsHelpers.valueClone(this." + fieldName + ");");
         }
         EmitLine("return res;");
         Unindent();
         EmitLine("}");
         Unindent();
         EmitLine("}");
      }

      private void HandleEnumDeclaration(EnumDeclarationSyntax node) {
         EmitLine("export enum " + node.Identifier.Text + " {");
         Indent();
         for (var i = 0; i < node.Members.Count; i++) {
            if (i != 0) EmitLine(", ");

            var m = node.Members[i];
            Emit(m.Identifier.Text);
            if (m.EqualsValue != null) {
               Emit(" = ");
               HandleExpressionDescent(m.EqualsValue.Value);
            }
         }
         EmitLine();
         Unindent();
         EmitLine("}");
      }

      private void HandleFieldDeclaration(FieldDeclarationSyntax field) {
         HandleModifierList(field.Modifiers);
         HandleVariableDeclarationStatement(field.Declaration, true);
      }

      private void HandleModifierList(SyntaxTokenList modifiers) {
         bool HasModifier(SyntaxKind sk) => modifiers.Any(m => m.Kind() == sk);

         if (HasModifier(SyntaxKind.PublicKeyword)) Emit("public ");
         if (HasModifier(SyntaxKind.InternalKeyword)) Emit("public ");
         if (HasModifier(SyntaxKind.PrivateKeyword)) Emit("private ");
         if (HasModifier(SyntaxKind.StaticKeyword) ||
             HasModifier(SyntaxKind.ConstKeyword)) Emit("static ");
         if (HasModifier(SyntaxKind.ConstKeyword)) Emit("readonly ");
         if (HasModifier(SyntaxKind.AbstractKeyword)) Emit("abstract ");

         // BUG: No TS Equivalent
         if (HasModifier(SyntaxKind.VirtualKeyword)) { }
      }

      private void HandleMethodDeclaration(MethodDeclarationSyntax method) {
         HandleModifierList(method.Modifiers);
         Emit(method.Identifier.Text);
         HandleParenthesizedParameterList(method.ParameterList);
         Emit(" : ");
         HandleEmitTypeIdentifier(method.ReturnType);
         Emit(" ");
         HandleBlock(method.Body, true);
         EmitLine();
         if (method.Identifier.Text == "Main") {
            mainFullIdentifier = method.SJSGetNamespaceLessFullEmittedIdentifier();
         }
      }

      private string GetMethodFullIdentifier(MethodDeclarationSyntax method) {
         var classFullIdentifier = method.Parent.GetFullIdentifierText();
         var methodName = method.Identifier.Text;
         if (method.Modifiers.Any(x => x.Kind() == SyntaxKind.StaticKeyword)) return $"{classFullIdentifier}.{methodName}";
         else return $"{classFullIdentifier}.prototype.{methodName}";
      }

      private void HandleAnonymousMethod(MethodDeclarationSyntax method) {
         // var isAsync = method.Modifiers.Any(x => x.Kind() == SyntaxKind.AsyncKeyword);
         // if (isAsync) Emit("async ");
         Emit("function ");
         HandleParenthesizedParameterList(method.ParameterList);
         Emit(" ");
         HandleBlock(method.Body, false);
      }

      private void HandleParenthesizedParameterList(ParameterListSyntax node) {
         Emit("(");
         for (var i = 0; i < node.Parameters.Count; i++) {
            if (i != 0) Emit(", ");
            var p = node.Parameters[i];
            HandleEmitTypedVariable(p.Identifier.Text, p.Type);
         }
         Emit(")");
      }

      private void HandleBlock(BlockSyntax body, bool trailingNewline) {
         EmitLine("{");
         Indent();
         foreach (var statement in body.Statements) HandleStatement(statement);
         Unindent();
         Emit("}");
         if (trailingNewline) EmitLine();
      }

      private void HandleStatement(StatementSyntax statement) {
         switch (statement) {
            case ExpressionStatementSyntax n:
               HandleExpressionDescent(n.Expression);
               EmitLine(";");
               break;
            case LocalDeclarationStatementSyntax n:
               HandleLocalDeclarationStatement(n);
               break;
            case ReturnStatementSyntax n:
               Emit("return");
               if (n.Expression != null) {
                  Emit(" ");
                  HandleExpressionDescent(n.Expression);
               }
               EmitLine(";");
               break;
            case IfStatementSyntax n:
               Emit("if (");
               HandleExpressionDescent(n.Condition);
               Emit(") ");
               HandleStatement(n.Statement);
               break;
            case WhileStatementSyntax n:
               Emit("while (");
               HandleExpressionDescent(n.Condition);
               Emit(") ");
               HandleStatement(n.Statement);
               break;
            case DoStatementSyntax n:
               Emit("do {");
               HandleStatement(n.Statement);
               Emit("} while(");
               HandleExpressionDescent(n.Condition);
               Emit(");");
               break;
            case ForStatementSyntax n:
               Emit("for (");
               if (n.Declaration == null) {
                  for (var i = 0; i < n.Initializers.Count; i++) {
                     if (i != 0) Emit(", ");
                     HandleExpressionDescent(n.Initializers[i]);
                  }
               } else {
                  Emit("let ");
                  HandleVariableDeclarationStatement(n.Declaration, false);
               }
               Emit("; ");
               if (n.Condition != null) HandleExpressionDescent(n.Condition);
               Emit("; ");
               for (var i = 0; i < n.Incrementors.Count; i++) {
                  if (i != 0) Emit(", ");
                  HandleExpressionDescent(n.Incrementors[i]);
               }
               Emit(") ");
               HandleStatement(n.Statement);
               break;
            case BlockSyntax n:
               HandleBlock(n, true);
               break;
            case BreakStatementSyntax n:
               EmitLine("break;");
               break;
            case ContinueStatementSyntax n:
               EmitLine("continue;");
               break;
            case ThrowStatementSyntax n:
               Emit("throw ");
               HandleExpressionDescent(n.Expression);
               EmitLine(";");
               break;
            case TryStatementSyntax n:
               Emit("try ");
               HandleStatement(n.Block);
               if (n.Catches.Any()) {
                  Emit(" catch(e) {");
                  Indent();
                  foreach (var c in n.Catches) {
                     EmitLine("// SJSTODO: Catch not implemented!");
                  }
                  Unindent();
                  Emit("}");
               }
               if (n.Finally != null) {
                  Emit(" finally ");
                  HandleStatement(n.Finally.Block);
               }
               EmitLine();
               break;
            case ForEachStatementSyntax n:
               HandleExpressionDescent(n.Expression);
               Emit(".forEach((");
               HandleEmitTypedVariable(n.Identifier.Text, n.Type);
               EmitLine(") => {");
               Indent();
               HandleStatement(n.Statement);
               Unindent();
               EmitLine("});");
               break;
            case SwitchStatementSyntax n:
               EmitLine("// SJSTODO: Switches not implemented");
               break;
            case EmptyStatementSyntax n:
               Emit("{}");
               break;
            case CheckedStatementSyntax n:
               // BUG: can't really support checked vs unchecked easily...
               HandleStatement(n.Block);
               break;
            default:
               throw new NotSupportedException(statement.Kind().ToString());
         }
      }

      private void HandleExpressionDescent(SyntaxNode node) {
         switch (node) {
            case AwaitExpressionSyntax n:
               Emit("(");
               Emit("await (");
               HandleExpressionDescent(n.Expression);
               Emit("))");
               break;
            case LiteralExpressionSyntax n:
               Emit(n.Token.Text);
               break;
            case IdentifierNameSyntax n:
               bool CheckEmitImplicitThis() {
                  var si = model.GetSymbolInfo(n);

                  // If on RHS of . e.g. b of a.b, no need for this.
                  if (node.Parent is MemberAccessExpressionSyntax maes && maes.Expression != n) {
                     return false;
                  }

                  var declaringSyntax = si.Symbol.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax();
                  if (declaringSyntax is MethodDeclarationSyntax mds) {
                     var isStatic = mds.Modifiers.Contains(SyntaxFactory.Token(SyntaxKind.ConstKeyword)) ||
                                    mds.Modifiers.Contains(SyntaxFactory.Token(SyntaxKind.StaticKeyword));
                     return !isStatic;
                  }

                  var isField = declaringSyntax?.Parent?.Parent is FieldDeclarationSyntax;
                  return isField;
               }
               if (CheckEmitImplicitThis()) {
                  Emit("this.");
               }
               Emit(n.Identifier.Text);
               break;
            case InterpolatedStringExpressionSyntax n:
               HandleInterpolatedStringExpression(n);
               break;
            case InvocationExpressionSyntax n:
               HandleInvocationExpression(n);
               break;
            case ObjectCreationExpressionSyntax n:
               HandleObjectCreationExpression(n);
               break;
            case AssignmentExpressionSyntax n:
               HandleSimpleAssignmentExpression(n);
               break;
            case MemberAccessExpressionSyntax n:
               HandleMemberAccessExpression(n);
               break;
            case PrefixUnaryExpressionSyntax n:
               Emit(n.OperatorToken.Text);
               HandleExpressionDescent(n.Operand);
               break;
            case PostfixUnaryExpressionSyntax n:
               HandleExpressionDescent(n.Operand);
               Emit(n.OperatorToken.Text);
               break;
            case BinaryExpressionSyntax n:
               HandleExpressionDescent(n.Left);
               Emit(" ");
               if (n.OperatorToken.Text == "is") Emit("instanceof");
               else Emit(n.OperatorToken.Text);
               Emit(" ");
               HandleExpressionDescent(n.Right);
               break;
            case ConditionalAccessExpressionSyntax n:
               // this is probably broken.
               Emit("SharpJsHelpers.conditionalAccess(");
               HandleExpressionDescent(n.Expression);
               Emit(", sharpJsTemp => sharpJsTemp.");
               var mbe = (MemberBindingExpressionSyntax)n.WhenNotNull;
               Emit(mbe.Name.Identifier.Text);
               Emit(")");
               break;
            case GenericNameSyntax n:
               HandleEmitTypeIdentifier(n);
               break;
            case ElementAccessExpressionSyntax n:
               HandleExpressionDescent(n.Expression);
               Emit("[");
               HandleArgumentListExpression(n.ArgumentList);
               Emit("]");
               break;
            case ThisExpressionSyntax n:
               Emit("this");
               break;
            case ParenthesizedExpressionSyntax n:
               Emit("(");
               HandleExpressionDescent(n.Expression);
               Emit(")");
               break;
            case CastExpressionSyntax n:
               Emit("<");
               HandleEmitTypeIdentifier(n.Type);
               Emit(">");
               HandleExpressionDescent(n.Expression);
               break;
            case ConditionalExpressionSyntax n:
               HandleExpressionDescent(n.Condition);
               Emit(" ? ");
               HandleExpressionDescent(n.WhenTrue);
               Emit(" : ");
               HandleExpressionDescent(n.WhenFalse);
               break;
            case ArrayCreationExpressionSyntax n:
               // TODO: this gona be broken
               var ats = n.Type;
               if (ats.RankSpecifiers.Count != 1) throw new NotSupportedException("Unsupported rank count: " + ats.RankSpecifiers.Count);
               Emit("new Array<");
               HandleEmitTypeIdentifier(ats.ElementType);
               Emit(">(");
               HandleExpressionDescent(ats.RankSpecifiers.First().Sizes.First());
               Emit(")");
               break;
            case BaseExpressionSyntax n:
               // TODO: this gonna be broken if access, say, object.gethashcode
               Emit("super");
               break;
            default:
               throw new NotSupportedException(node.Kind().ToString());
         }
      }

      private void HandleObjectCreationExpression(ObjectCreationExpressionSyntax node) {
         Emit("new ");
         HandleExpressionDescent(node.Type);
         Emit("(");
         HandleArgumentListExpression(node.ArgumentList);
         Emit(")");
      }

      private void HandleSimpleAssignmentExpression(AssignmentExpressionSyntax node) {
         HandleExpressionDescent(node.Left);
         Emit(" ");
         Emit(node.OperatorToken.Text);
         Emit(" ");
         var rhsTi = model.GetTypeInfo(node.Right);
         var rhsType = rhsTi.Type ?? rhsTi.ConvertedType;
         if (rhsType.IsValueType) {
            Emit("SharpJsHelpers.valueClone(");
            HandleExpressionDescent(node.Right);
            Emit(")");
         } else {
            HandleExpressionDescent(node.Right);
         }
      }

      private void HandleMemberAccessExpression(MemberAccessExpressionSyntax node) {
         HandleExpressionDescent(node.Expression);
         Emit(".");
         Emit(node.Name.Identifier.Text);
      }

      private void HandleArgumentExpression(ArgumentSyntax node) {
         HandleExpressionDescent(node.Expression);
      }

      private void HandleArgumentListExpression(BaseArgumentListSyntax node) {
         for (var i = 0; i < node.Arguments.Count; i++) {
            if (i != 0) Emit(", ");
            HandleArgumentExpression(node.Arguments[i]);
         }
      }

      private void HandleInterpolatedStringExpression(InterpolatedStringExpressionSyntax node) {
         for (var i = 0; i < node.Contents.Count; i++) {
            if (i != 0) Emit(" + ");
            HandleInterpolatedStringBody(node.Contents[i]);
         }
      }

      private void HandleInterpolatedStringBody(SyntaxNode node) {
         switch (node.Kind()) {
            case SyntaxKind.InterpolatedStringText:
               Emit($"\"{((InterpolatedStringTextSyntax)node).TextToken.Text}\"");
               break;
            case SyntaxKind.Interpolation:
               HandleExpressionDescent(((InterpolationSyntax)node).Expression);
               break;
            default:
               throw new NotSupportedException(node.Kind().ToString());
         }
      }

      private bool TryEmitterLanguageApiOverrides(IReadOnlyList<ISymbol> symbols, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;
         switch (symbols[3].Name) {
            case nameof(System):
               return TrySystemOverrides(symbols, 4, node, argumentList);
            default:
               return false;
         }
      }

      private bool TrySystemOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case nameof(System.Collections):
               return TrySystemCollectionOverrides(symbols, i + 1, node, argumentList);
            case nameof(Console):
               return TrySystemConsoleOverrides(symbols, i + 1, node, argumentList);
            case nameof(Int32):
               return TryInt32ConsoleOverrides(symbols, i + 1, node, argumentList);
            default:
               return false;
         }
      }

      private bool TrySystemCollectionOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case nameof(System.Collections.Generic):
               return TrySystemCollectionGenericOverrides(symbols, i + 1, node, argumentList);
            default:
               return false;
         }
      }

      private bool TrySystemCollectionGenericOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case "List":
               return TrySystemCollectionGenericListOverrides(symbols, i + 1, node, argumentList);
            default:
               return false;
         }
      }
      private bool TrySystemCollectionGenericListOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         var maes = (MemberAccessExpressionSyntax)node.Expression;
         switch (symbols[i].Name) {
            case nameof(List<object>.Clear):
               Emit("SharpJsHelpers.arrayClear(");
               HandleExpressionDescent(maes.Expression);
               Emit(")");
               return true;
            case nameof(List<object>.Add):
               HandleExpressionDescent(maes.Expression);
               Emit(".push(");
               HandleArgumentListExpression(argumentList);
               Emit(")");
               return true;
            default:
               return false;
         }
      }

      private bool TrySystemConsoleOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case nameof(Console.WriteLine):
               Emit("console.log(");
               HandleArgumentListExpression(argumentList);
               Emit(")");
               return true;
            case nameof(Console.ReadLine):
               Emit("prompt(\"Enter String Input:\")");
               return true;
            default:
               return false;
         }
      }

      private bool TryInt32ConsoleOverrides(IReadOnlyList<ISymbol> symbols, int i, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case nameof(int.Parse):
               Emit("parseInt(");
               HandleArgumentListExpression(argumentList);
               Emit(")");
               return true;
            default:
               return false;
         }
      }

      private bool TryEmitterClassInvocationOverrides(IReadOnlyList<ISymbol> symbols) {
         var lastSymbol = symbols.Last();
         if (lastSymbol.Kind == SymbolKind.Method) {
            var methodSymbol = (IMethodSymbol)lastSymbol;
            if (methodSymbol.IsStatic) {
               var methodClass = methodSymbol.ContainingType;
               var methodClassFQTN = methodClass.SJSGetFullEmittedIdentifier();
               if (fqtnToFilePath.TryGetValue(methodClassFQTN, out string dependencyFilePath)) {
                  HandlePotentialCrossFileClassDependency(methodClass.Name, dependencyFilePath);
                  Emit(methodClass.Name);
                  Emit(".");
                  Emit(methodSymbol.Name);
                  return true;
               }
            }
         }
         return false;
      }

      private void HandleEmitTypeIdentifier(TypeSyntax node) {
         var typeInfo = model.GetTypeInfo(node);
         var type = typeInfo.Type;

         if (type != null) {
            HandleEmitTypeIdentifier(type);
         } else {
            var si = model.GetSymbolInfo(node);
            var nts = (ITypeSymbol)si.Symbol;
            HandleEmitTypeIdentifier(nts);
         }
      }

      private void HandleEmitTypeIdentifier(ITypeSymbol type) {
         if (type.TypeKind == TypeKind.Array) {
            var arrayType = (IArrayTypeSymbol)type;
            HandleEmitTypeIdentifier(arrayType.ElementType);
            Emit("[]");
            return;
         }

         var nts = type as INamedTypeSymbol;
         if (nts != null) {
            switch (nts.SJSGetFullEmittedIdentifier()) {
               case "System.Collections.Generic.List":
                  Emit("Array<");
                  HandleEmitTypeIdentifier(nts.TypeArguments[0]);
                  Emit(">");
                  return;
            }
         }

         HandlePotentialCrossFileClassDependency(type);
         switch (type.Name) {
            case nameof(SByte):
            case nameof(Int16):
            case nameof(Int32):
            case nameof(Int64):
            case nameof(Byte):
            case nameof(UInt16):
            case nameof(UInt32):
            case nameof(UInt64):
            case nameof(Single):
            case nameof(Double):
               Emit("number");
               break;
            case nameof(String):
               Emit("string");
               break;
            case nameof(Boolean):
               Emit("boolean");
               break;
            case "Void":
               Emit("void");
               break;
            default:
               Emit(type.Name);
               break;
         }
      }

      private void HandlePotentialCrossFileClassDependency(ITypeSymbol type) {
         if (type.Locations.Length > 1) {
            throw new NotSupportedException("Partial classes not supported");
         }
         var loc = type.Locations.First().GetMappedLineSpan();
         if (loc.Path == null) {
            // not our code
            return;
         }
         HandlePotentialCrossFileClassDependency(type.Name, loc.Path);
      }

      private void HandlePotentialCrossFileClassDependency(string className, string dependencyFilePath) {
         if (dependencyFilePath == this.filePath) return;
         importedClassesByPath.Add(dependencyFilePath, className);
      }

      private void HandleInvocationExpression(InvocationExpressionSyntax node) {
         var symbolPath = ResolveInvocationExpressionInvokedSymbolPath(node);
         if (TryEmitterLanguageApiOverrides(symbolPath, node, node.ArgumentList)) {
            // emitter handles expression emit
         } else if (TryEmitterClassInvocationOverrides(symbolPath)) {
            Emit("(");
            HandleArgumentListExpression(node.ArgumentList);
            Emit(")");
         } else {
            HandleExpressionDescent(node.Expression);
            Emit("(");
            HandleArgumentListExpression(node.ArgumentList);
            Emit(")");
         }
      }

      private IReadOnlyList<ISymbol> ResolveInvocationExpressionInvokedSymbolPath(InvocationExpressionSyntax node) {
         var diags = model.Compilation.GetDiagnostics();
         var expression = node.Expression;
         var symbolInfo = model.GetSymbolInfo(expression);
         var symbol = symbolInfo.Symbol;
         return symbol.GetPath();
      }

      private void HandleSimpleMemberAccessExpression(MemberAccessExpressionSyntax node) {
         HandleExpressionDescent(node.Expression);
         Emit(node.OperatorToken.Text);
         Emit(node.Name.Identifier.Text);
      }


      private void HandleLocalDeclarationStatement(LocalDeclarationStatementSyntax node) {
         Emit("let ");
         HandleVariableDeclarationStatement(node.Declaration, true);
      }

      private void HandleVariableDeclarationStatement(VariableDeclarationSyntax node, bool trailingSemicolonNewline) {
         for (var i = 0; i < node.Variables.Count; i++) {
            if (i != 0) Emit(", ");
            var variable = node.Variables[i];
            HandleEmitTypedVariable(variable.Identifier.Text, node.Type);
            if (variable.Initializer != null) {
               Emit(" = ");
               HandleExpressionDescent(variable.Initializer.Value);
            }
         }
         if (trailingSemicolonNewline) EmitLine(";");
      }

      private void HandleEmitTypedVariable(string variableName, TypeSyntax nodeType) {
         Emit(variableName);
         Emit(" : ");
         HandleEmitTypeIdentifier(nodeType);
      }

      #region Emit
      private readonly string indentationHelper = new string(' ', 1024);
      private int indentCount;
      private bool isStartOfLine = true;

      private void Indent() {
         indentCount++;
      }

      private void Unindent() {
         indentCount--;
      }

      private void Emit(string s) {
         ConditionallyEmitIndent();
         output.Append(s);
         isStartOfLine = false;
      }

      private void EmitLine(string s = "") {
         ConditionallyEmitIndent();
         output.AppendLine(s);
         isStartOfLine = true;
      }

      private void ConditionallyEmitIndent() {
         if (isStartOfLine) {
            output.Append(indentationHelper, 0, indentCount * 3);
            isStartOfLine = false;
         }
      }
      #endregion
   }
}

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
         var classes = SolutionSearcher.FindClasses(project).Result;
         var classByFQTN = classes.ToDictionary(c => c.SJSGetFullEmittedIdentifier());
         var classToFilePath = classes.ToDictionary(c => c, c => c.GetLocation().GetMappedLineSpan().Path);
         var fqtnToFilePath = classByFQTN.ToDictionary(kvp => kvp.Key, kvp => classToFilePath[kvp.Value]);
         var classesByFilePath = classes.ToLookup(c => c.GetLocation().GetMappedLineSpan().Path);
         
         foreach (var (filePath, fileClasses) in classesByFilePath.Select(g => (g.Key, g.ToList()))) {
            var emittedClassSources = new List<string>();
            var dependentClassNamesByPath = new Dictionary<string, HashSet<string>>();
            string entryPointFqid = null;

            foreach (var clazz in fileClasses) {
               var model = compilation.GetSemanticModel(clazz.SyntaxTree);
               var transpiler = new TypeScriptClassTranspiler(compilation, model, filePath, defaultNamespace, fqtnToFilePath);
               var result = transpiler.Emit(clazz);
               emittedClassSources.Add(result.Source);
               foreach (var (path, classNames) in result.ImportedClassesByPath) {
                  dependentClassNamesByPath.Add(path, classNames);
               }
               if (result.MainFullIdentifier != null) {
                  if (entryPointFqid != null) {
                     Console.WriteLine($"Warning: Multiple entry points detected; {entryPointFqid} => {result.MainFullIdentifier}");
                  }
                  entryPointFqid = result.MainFullIdentifier;
               }
            }

            var finalOutput = new StringBuilder();

            foreach (var (path, classNames) in dependentClassNamesByPath) {
               var relativePath = new Uri(filePath).MakeRelativeUri(new Uri(path)).ToString();
               var extensionlessRelativePath = relativePath.Substring(0, relativePath.LastIndexOf('.'));
               finalOutput.AppendLine($"import {{ {string.Join(", ", classNames)} }} from './{extensionlessRelativePath}';");
            }
            if (dependentClassNamesByPath.Any()) finalOutput.AppendLine();

            finalOutput.AppendLine("class SharpJsHelpers { static conditionalAccess(val, next) { return val ? next(val) : val; } }");
            finalOutput.AppendLine();

            emittedClassSources.ForEach(s => finalOutput.AppendLine(s));
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

      public TypeScriptClassTranspilationResult Emit(ClassDeclarationSyntax node) {
         output = new StringBuilder();
         importedClassesByPath = new Dictionary<string, HashSet<string>>();
         mainFullIdentifier = null;

         var namespaceNode = (NamespaceDeclarationSyntax)node.Parent;
         var ns = namespaceNode.SJSGetFullEmittedIdentifier();
         if (ns != defaultNamespace) {
            throw new NotImplementedException($"Namespace mismatch: '{ns}' != '{defaultNamespace}'");
         }
         HandleClassDeclaration(node);

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
         EmitLine("export class " + className + " {");
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

      private void HandleFieldDeclaration(FieldDeclarationSyntax field) {
         foreach (var modifier in field.Modifiers) HandleModifier(modifier);
         HandleVariableDeclarationStatement(field.Declaration, true);
      }

      private void HandleModifier(SyntaxToken token) {
         var kind = token.Kind();
         if (kind == SyntaxKind.PublicKeyword) {
            Emit("public ");
         } else if (kind == SyntaxKind.PrivateKeyword) {
            Emit("private ");
         } else if (kind == SyntaxKind.StaticKeyword) {
            Emit("static ");
         } else if (kind == SyntaxKind.InternalKeyword) {
            Emit("public "); // BUG: no TS equivalent
         } else if (kind == SyntaxKind.ConstKeyword) {
            Emit(""); // BUG: no TS equivalent
         } else {
            throw new NotImplementedException("Unhandled modifier " + kind);
         }
      }

      private void HandleMethodDeclaration(MethodDeclarationSyntax method) {
         foreach (var modifier in method.Modifiers) HandleModifier(modifier);
         Emit(method.Identifier.Text);
         HandleParenthesizedParameterList(method.ParameterList);
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
               HandleExpressionDescent(n.Condition);
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
               var si = model.GetSymbolInfo(n);
               var declaringSyntax = si.Symbol.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax();
               var isField = declaringSyntax?.Parent?.Parent is FieldDeclarationSyntax;
               var foregoImplicitThis = node.Parent is MemberAccessExpressionSyntax maes && maes.Expression != n;
               if (isField && !foregoImplicitThis) {
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
               Emit(n.OperatorToken.Text);
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
         HandleExpressionDescent(node.Right);
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

      private bool TryEmitterLanguageApiOverrides(IReadOnlyList<ISymbol> symbols, ArgumentListSyntax argumentList) {
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;
         switch (symbols[3].Name) {
            case nameof(System):
               return TrySystemOverrides(symbols, 4, argumentList);
            default:
               return false;
         }
      }

      private bool TrySystemOverrides(IReadOnlyList<ISymbol> symbols, int i, ArgumentListSyntax argumentList) {
         switch (symbols[i].Name) {
            case nameof(Console):
               return TrySystemConsoleOverrides(symbols, i + 1, argumentList);
            case nameof(Int32):
               return TryInt32ConsoleOverrides(symbols, i + 1, argumentList);
            default:
               return false;
         }
      }

      private bool TrySystemConsoleOverrides(IReadOnlyList<ISymbol> symbols, int i, ArgumentListSyntax argumentList) {
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

      private bool TryInt32ConsoleOverrides(IReadOnlyList<ISymbol> symbols, int i, ArgumentListSyntax argumentList) {
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
            case nameof(Byte):
            case nameof(UInt16):
            case nameof(UInt32):
            case nameof(Single):
            case nameof(Double):
               Emit("number");
               break;
            case nameof(String):
               Emit("string");
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
         if (TryEmitterLanguageApiOverrides(symbolPath, node.ArgumentList)) {
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

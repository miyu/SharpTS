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
            var emittedTypeNameAndSources = new List<(string, string)>();
            var dependentTypeNamesByPath = new Dictionary<string, HashSet<string>>();
            string entryPointFqid = null;

            foreach (var type in fileTypes) {
               var model = compilation.GetSemanticModel(type.SyntaxTree);
               var transpiler = new TypeScriptClassTranspiler(compilation, model, filePath, defaultNamespace, fqtnToFilePath);
               var result = transpiler.Emit(type);
               emittedTypeNameAndSources.Add((type.Identifier.Text, result.Source));
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

            // HACK: order polynode below polytree lol
            if (emittedTypeNameAndSources.Any(t => t.Item1 == "PolyNode")) {
               var pn = emittedTypeNameAndSources.First(t => t.Item1 == "PolyNode");
               emittedTypeNameAndSources.Remove(pn);
               var pt = emittedTypeNameAndSources.First(t => t.Item1 == "PolyTree");
               var pti = emittedTypeNameAndSources.IndexOf(pt);
               emittedTypeNameAndSources.Insert(pti, pn);
            }

            var finalOutput = new StringBuilder();

            foreach (var (path, classNames) in dependentTypeNamesByPath) {
               var relativePath = new Uri(filePath).MakeRelativeUri(new Uri(path)).ToString();
               var extensionlessRelativePath = relativePath.Substring(0, relativePath.LastIndexOf('.'));
               finalOutput.AppendLine($"import {{ {string.Join(", ", new SortedSet<string>(classNames))} }} from './{extensionlessRelativePath}';");
            }
            if (dependentTypeNamesByPath.Any()) finalOutput.AppendLine();

            finalOutput.AppendLine(
$@"/* SharpJS - Emitted on {DateTime.Now} */
export class OutRefParam<T> {{ 
   constructor (public read: () => T, public write: (val: T) => T) {{ }}
}}
export function createOutRefParam<T>(read: () => T, write: (val: T) => T): OutRefParam<T> {{ return new OutRefParam<T>(read, write); }}

interface IComparer<T> {{ Compare(a : T, b : T): number; }}
class SharpJsHelpers {{ 
   static conditionalAccess<T, R>(val: T, next : (x: T) => R) : R | null {{ 
      return val ? next(val) : null;
   }}
   static valueClone<T>(val: T): T {{ 
      if (!val || typeof val !== 'object') return val;
      if ((<any>val).zzz__sharpjs_clone) return (<any>val).zzz__sharpjs_clone();
      return val;
   }}
   static arrayClear<T>(arr: Array<T>): void {{ 
      while(arr.length) arr.pop();
   }}
   static TestTypeCheck<T>(x: T, type: string | Function) {{
      if (type === 'object') return typeof(x) == 'object' || <any>x instanceof Object || <any>x == null;
      if (type === 'string') return typeof(x) == 'string' || <any>x instanceof String;
      if (typeof(type) === 'string') return typeof(x) == type;
      if (typeof(type) === 'function') return <any>x instanceof type;
      return false;
   }}
   static readThenExec<T>(read: () => T, exec: (val: T) => void ): T {{
      const res : T = read();
      exec(res);
      return res;
   }}
   static booleanXor(x: boolean, y: boolean): boolean {{
      return x != y && (x || y);
   }}
   static setCapacity<T>(arr: Array<T>, capacity: number): number {{
      if (arr.length > capacity) arr.length = capacity; // don't resize upward.
      return capacity;
   }}
   static tryBinaryOperator<T, R>(a: T, b: T, op: string, fallback: (a: T, b: T) => R) {{
      return (op in <any>a) ? (<any>a)[op](b) : fallback(a, b);
   }}
}}
");
            finalOutput.AppendLine();

            emittedTypeNameAndSources.ForEach(t => finalOutput.AppendLine(t.Item2));
            if (entryPointFqid != null) {
               finalOutput.AppendLine("eval(\"if (!module.parent && typeof(process) !== 'undefined' && typeof(process.argv) !== 'undefined') Program.Main(process.argv.slice(1))\");");
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
      private const string kImplicitStructDefaultCtorInternalName = "__SJS_ImplicitDefaultCtor";

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
         foreach (var nestedEnum in node.Members.OfType<EnumDeclarationSyntax>()) {
            HandleEnumDeclaration(nestedEnum);
         }

         var className = node.Identifier.Text;
         Emit("export class ");
         Emit(className + " ");
         bool hasBaseClass = false;
         if (node.BaseList != null) {
            var basesByIsInterface = node.BaseList.Types.GroupBy(t => {
               var ti = model.GetTypeInfo(t.Type);
               return ti.Type.TypeKind == TypeKind.Interface;
            });
            foreach (var (isInterface, types) in basesByIsInterface.Select(g => (g.Key, g.ToList()))) {
               hasBaseClass |= !isInterface;
               Emit(isInterface ? "implements " : "extends ");
               for (var i = 0; i < types.Count; i++) {
                  if (i != 0) Emit(", ");
                  HandleEmitTypeIdentifier(types[i].Type);
               }
               Emit(" ");
            }
         }
         EmitLine("{");
         Indent();

         var fields = node.Members.OfType<FieldDeclarationSyntax>().ToList();
         foreach (var field in fields) {
            HandleFieldDeclaration(field);
         }
         if (fields.Any()) EmitLine();

         HandleOverloadedBaseMethodGroupEmit(node.Identifier.Text, "constructor", node.Members.OfType<ConstructorDeclarationSyntax>().ToList(), true, hasBaseClass);

         foreach (var property in node.Members.OfType<PropertyDeclarationSyntax>().ToList()) {
            HandlePropertyDeclaration(node.Identifier.Text, property);
         }

         HandleMethodDeclarations(node.Identifier.Text, node.Members.OfType<MethodDeclarationSyntax>().ToList());

         foreach (var op in node.Members.OfType<OperatorDeclarationSyntax>()) {
            HandleOperatorDeclaration(node.Identifier.Text, op);
         }

         Unindent();
         EmitLine("}");
      }

      private void HandleStructDeclaration(StructDeclarationSyntax node) {
         EmitLine("export class " + node.Identifier.Text + " {");
         Indent();

         var fields = node.Members.OfType<FieldDeclarationSyntax>().ToList();
         foreach (var field in fields) {
            HandleFieldDeclaration(field);
         }
         if (fields.Any()) EmitLine();

         var ctors = node.Members.OfType<ConstructorDeclarationSyntax>().ToList();
         if (ctors.All(c => c.ParameterList.Parameters.Count != 0)) {
            var implicitDefaultCtor = SyntaxFactory.ConstructorDeclaration(kImplicitStructDefaultCtorInternalName)
               .WithModifiers(FindCommonModifiers(ctors.Select(c => c.Modifiers)))
               .WithParameterList(SyntaxFactory.ParameterList())
               .WithBody(SyntaxFactory.Block());
            ctors.Insert(0, implicitDefaultCtor);
         }
         HandleOverloadedBaseMethodGroupEmit(node.Identifier.Text, "constructor", ctors, true, false);
         foreach (var property in node.Members.OfType<PropertyDeclarationSyntax>().ToList()) {
            HandlePropertyDeclaration(node.Identifier.Text, property);
         }
         HandleMethodDeclarations(node.Identifier.Text, node.Members.OfType<MethodDeclarationSyntax>().ToList());
         foreach (var op in node.Members.OfType<OperatorDeclarationSyntax>()) {
            HandleOperatorDeclaration(node.Identifier.Text, op);
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

         EmitLine("public static default() : " + node.Identifier.Text + " {");
         Indent();
         EmitLine("return new " + node.Identifier.Text + "();");
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
         // TS doesn't support e.g. private a : int, b : int. Need to split to multiple lines.
         foreach (var v in field.Declaration.Variables) {
            HandleModifierList(field.Modifiers);
            HandleVariableDeclarator(field.Declaration, v);
            EmitLine(";");
         }
      }

      private bool HasModifier(SyntaxTokenList modifiers, SyntaxKind sk) => modifiers.Any(m => m.Kind() == sk);

      private void HandleModifierList(SyntaxTokenList modifiers) {
         bool Has(SyntaxKind sk) => HasModifier(modifiers, sk);

         if (Has(SyntaxKind.PublicKeyword)) Emit("public ");
         if (Has(SyntaxKind.InternalKeyword)) Emit("public ");
         if (Has(SyntaxKind.PrivateKeyword)) Emit("private ");
         if (Has(SyntaxKind.StaticKeyword) ||
             Has(SyntaxKind.ConstKeyword)) Emit("static ");
         if (Has(SyntaxKind.ConstKeyword)) Emit("readonly ");
         if (Has(SyntaxKind.AbstractKeyword)) Emit("abstract ");

         // BUG: No TS Equivalent
         if (Has(SyntaxKind.VirtualKeyword)) { }
      }

      private void HandleMethodDeclarations(string containingTypeName, IReadOnlyList<BaseMethodDeclarationSyntax> methods) {
         var methodGroups = methods.GroupBy(m => m is MethodDeclarationSyntax mds ? mds.Identifier.Text : "constructor");
         foreach (var (methodName, matches) in methodGroups.Select(g => (g.Key, g.ToArray()))) {
            // HACK: Don't emit GetHashCode.
            if (methodName == nameof(Object.GetHashCode)) continue;

            if (matches.Length == 1) {
               HandleMethodDeclaration(matches[0], methodName);
            } else {
               // Emit groups of static vs instance separately
               foreach (var g in matches.GroupBy(m => HasModifier(m.Modifiers, SyntaxKind.StaticKeyword))) {
                  HandleOverloadedBaseMethodGroupEmit(containingTypeName, methodName, g.ToArray(), false, false);
               }
            }
         }
      }

      private SyntaxTokenList FindCommonModifiers(IEnumerable<SyntaxTokenList> modifierGroups) {
         SyntaxKind? accessibilityModifier = null;
         bool? isStatic = null;
         foreach (var g in modifierGroups) {
            bool groupStatic = false;
            foreach (var m in g) {
               switch (m.Kind()) {
                  case SyntaxKind.PublicKeyword: // 8343
                  case SyntaxKind.PrivateKeyword:
                  case SyntaxKind.InternalKeyword:
                  case SyntaxKind.ProtectedKeyword: // 8346
                     accessibilityModifier = (SyntaxKind)Math.Min((int)(accessibilityModifier ?? m.Kind()), (int)m.Kind());
                     break;
                  case SyntaxKind.StaticKeyword:
                     groupStatic = true;
                     break;
               }
            }
            if (isStatic.HasValue && isStatic != groupStatic) {
               throw new Exception("Cannot find common modifiers between static vs non-static members.");
            }
            isStatic = groupStatic;
         }
         var stl = new SyntaxTokenList();
         if (accessibilityModifier != null) stl = stl.Add(SyntaxFactory.Token(accessibilityModifier.Value));
         if (isStatic != null && isStatic == true) stl = stl.Add(SyntaxFactory.Token(SyntaxKind.StaticKeyword));
         return stl;
      }

      private void HandleOverloadedBaseMethodGroupEmit(string containingTypeName, string methodName, IReadOnlyList<BaseMethodDeclarationSyntax> matches, bool isCtor, bool emitSuperCall) {
         string BuildName(int i) => methodName + "_SharpJs_Overload_" + i;

         for (var i = 0; i < matches.Count; i++) {
            Console.WriteLine("Overloaded Method: " + matches[i]);
            HandleMethodDeclaration(matches[i], BuildName(i));
         }

         // Emit declarations for ctor overloads
         var commonModifiers = FindCommonModifiers(matches.Select(m => m.Modifiers));
         for (var i = 0; i < matches.Count; i++) {
            var method = matches[i];
            var totalParameters = method.ParameterList.Parameters.Count;
            var requiredParameters = totalParameters - method.ParameterList.Parameters.Count(p => p.Default != null);
            for (var j = requiredParameters; j <= totalParameters; j++) {
               HandleMethodDeclaration(matches[i], methodName, j, commonModifiers);
            }
         }

         HandleModifierList(commonModifiers);
         Emit(methodName);
         Emit("(...args: any[])");
         if (!isCtor) {
            Emit(": ");
            for (var i = 0; i < matches.Count; i++) {
               if (i != 0) Emit(" | ");
               HandleEmitTypeIdentifier(((MethodDeclarationSyntax)matches[i]).ReturnType);
            }
         }

         EmitLine(" {");
         Indent();

         if (isCtor && emitSuperCall) EmitLine("super();");

         var isFirstMatch = true;
         for (var i = 0; i < matches.Count; i++) {
            var method = matches[i];
            var cds = method as ConstructorDeclarationSyntax;
            var isImplicitlyDefinedDefaultStructCtor = cds?.Identifier.Text == kImplicitStructDefaultCtorInternalName;
            var si = isImplicitlyDefinedDefaultStructCtor ? null : model.GetDeclaredSymbol(method);

            if (isImplicitlyDefinedDefaultStructCtor) {
               Trace.Assert(method.ParameterList.Parameters.Count == 0);
            }

            if (cds?.Initializer != null) {
               Console.Error.WriteLine("Warning: SharpJS only supports implicit Constructor Initializer supercalls (can't use : this() or :base()).");
            }

            var totalParameters = method.ParameterList.Parameters.Count;
            var requiredParameters = totalParameters - method.ParameterList.Parameters.Count(p => p.Default != null);
            for (var overloadParameterCount = requiredParameters; overloadParameterCount <= totalParameters; overloadParameterCount++) {
               if (!isFirstMatch) Emit("else ");
               isFirstMatch = false;

               Emit("if (");
               Emit("args.length == " + overloadParameterCount);
               for (var j = 0; j < overloadParameterCount; j++) {
                  var parameter = method.ParameterList.Parameters[j];
                  Emit(" && ");
                  Emit("SharpJsHelpers.TestTypeCheck(args[" + j + "], ");
                  if (si.Parameters[j].RefKind != RefKind.None) {
                     Emit("OutRefParam");
                  } else {
                     HandleEmitTypeIdentifier(parameter.Type, true);
                  }
                  Emit(")");
               }
               Emit(") ");
               Emit(isCtor ? "{ " : "return ");
               Emit(HasModifier(method.Modifiers, SyntaxKind.StaticKeyword) ? containingTypeName : "this");
               Emit(".");
               Emit(BuildName(i));
               Emit("(");
               for (var j = 0; j < method.ParameterList.Parameters.Count; j++) {
                  if (j != 0) Emit(", ");
                  Emit("<");
                  if (si.Parameters[j].RefKind != RefKind.None) {
                     Emit("OutRefParam<");
                     HandleEmitTypeIdentifier(method.ParameterList.Parameters[j].Type);
                     Emit(">");
                  } else {
                     HandleEmitTypeIdentifier(method.ParameterList.Parameters[j].Type);
                  }
                  Emit(">");

                  if (j < overloadParameterCount) {
                     Emit("args[" + j + "]");
                  } else {
                     HandleExpressionDescent(method.ParameterList.Parameters[j].Default.Value);
                  }
               }
               Emit(");");
               EmitLine(isCtor ? " return; }" : "");
            }
         }

         if (matches.Any()) {
            EmitLine("throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');");
         }

         Unindent();
         EmitLine("}");
         EmitLine();
      }

      // Emits method with 0 optional parameters. Optimal parameters are handled via MethodGroup emit overloading.
      private void HandleMethodDeclaration(BaseMethodDeclarationSyntax method, string emittedName, int? optDeclarationOnlyParameterLimit = null, SyntaxTokenList? modifierListOverride = null) {
         HandleModifierList(modifierListOverride ?? method.Modifiers);
         Emit(emittedName);
         HandleParenthesizedParameterList(method.ParameterList, optDeclarationOnlyParameterLimit);

         TypeSyntax returnType = null;
         if (method is MethodDeclarationSyntax mds) {
            Emit(" : ");
            HandleEmitTypeIdentifier(mds.ReturnType);
            returnType = mds.ReturnType;
         } else if (method is OperatorDeclarationSyntax ods) {
            Emit(" : ");
            HandleEmitTypeIdentifier(ods.ReturnType);
            returnType = ods.ReturnType;
         }

         if (optDeclarationOnlyParameterLimit.HasValue) {
            EmitLine(";");
            return;
         }

         Emit(" ");
         if (method.Body != null) {
            HandleBlock(method.Body, true);
         } else {
            var hasExpressionBodyReturn = !(returnType is PredefinedTypeSyntax pts && pts.Keyword.Kind() == SyntaxKind.VoidKeyword);
            HandleExpressionBody(method.ExpressionBody, hasExpressionBodyReturn);
         }
         EmitLine();
         if (emittedName == "Main") {
            mainFullIdentifier = method.SJSGetNamespaceLessFullEmittedIdentifier();
         }
      }

      private void HandleExpressionBody(ArrowExpressionClauseSyntax node, bool emitReturn) {
         Emit("{ ");
         if (emitReturn) Emit("return ");
         HandleExpressionDescent(node.Expression);
         EmitLine("; }");
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

      private void HandleParenthesizedParameterList(ParameterListSyntax node, int? optDeclarationOnlyParameterLimit = null) {
         // declarations don't have default values. Must emit multiple signatures for them. These are then handled
         // at the methodgroup overload resolution handler.
         var parameterLimit = optDeclarationOnlyParameterLimit ?? node.Parameters.Count;
         Emit("(");
         for (var i = 0; i < parameterLimit; i++) {
            if (i != 0) Emit(", ");
            var p = node.Parameters[i];
            HandleEmitParameterType(p);
            if (p.Default != null && !optDeclarationOnlyParameterLimit.HasValue) {
               Emit(" = ");
               HandleExpressionDescent(p.Default.Value);
            }
         }
         Emit(")");
      }

      private void HandleEmitParameterType(ParameterSyntax node) {
         var outRef = HasModifier(node.Modifiers, SyntaxKind.OutKeyword) || HasModifier(node.Modifiers, SyntaxKind.RefKeyword);
         Emit(node.Identifier.Text);
         Emit(" : ");
         if (outRef) Emit("OutRefParam<");
         HandleEmitTypeIdentifier(node.Type);
         if (outRef) Emit(">");
      }

      private bool TryGetOperatorMethodName(SyntaxToken operatorKeyword, int arity, bool isPrefix, out string methodName) {
         switch(operatorKeyword.Kind()) {
            case SyntaxKind.EqualsEqualsToken:
               methodName = "opEquals";
               return true;
            case SyntaxKind.ExclamationEqualsToken:
               methodName = "opNotEquals";
               return true;
            case SyntaxKind.MinusToken when arity == 1 && isPrefix:
               methodName = "opNegate";
               return true;
            default:
               methodName = null;
               return false;
         }
      }

      private void HandleOperatorDeclaration(string containingTypeName, OperatorDeclarationSyntax node) {
         if (TryGetOperatorMethodName(node.OperatorToken, node.ParameterList.Parameters.Count, true, out string methodName)) {
            HandleMethodDeclaration(node, methodName);

            Emit("public ");
            Emit(methodName);
            Emit("(");
            for (var i = 1; i < node.ParameterList.Parameters.Count; i++) {
               if (i != 1) Emit(", ");
               var p = node.ParameterList.Parameters[i];
               Emit("operand" + i);
               Emit(" : ");
               HandleEmitTypeIdentifier(p.Type);
            }
            Emit(") : ");
            HandleEmitTypeIdentifier(node.ReturnType);

            Emit(" { return ");
            Emit(containingTypeName);
            Emit(".");
            Emit(methodName);
            Emit("(this");
            for (var i = 1; i < node.ParameterList.Parameters.Count; i++) {
               Emit(", ");
               Emit("operand" + i);
            }
            EmitLine("); }");
            EmitLine();
         } else {
            Console.Error.WriteLine("Warning! Operator not support: " + node);
         }
      }

      private void HandlePropertyDeclaration(string containingTypeName, PropertyDeclarationSyntax property) {
         var isStaticProperty = HasModifier(property.Modifiers, SyntaxKind.StaticKeyword);
         var backingStoreName = (isStaticProperty ? "s_" : "m_") + property.Identifier.Text;
         var qualifiedBackingStoreName = (isStaticProperty ? containingTypeName : "this") + "." + backingStoreName;
         if (property.AccessorList.Accessors.Any(a => a.Body == null && a.ExpressionBody == null)) {
            Emit("private ");
            if (isStaticProperty) Emit("static ");
            HandleVariableDeclarator(property.Type, null, backingStoreName);
            EmitLine(";");
         }
         foreach (var accessor in property.AccessorList.Accessors) {
            var accessorKind = accessor.Keyword.Kind();
            if (accessorKind == SyntaxKind.GetKeyword || accessorKind == SyntaxKind.SetKeyword) {
               var isGetter = accessorKind == SyntaxKind.GetKeyword;
               HandleModifierList(accessor.Modifiers);
               if (isGetter) {
                  Emit("get ");
                  Emit(property.Identifier.Text);
                  Emit("(): ");
                  HandleEmitTypeIdentifier(property.Type);
                  Emit(" ");
               } else {
                  Emit("set ");
                  Emit(property.Identifier.Text);
                  Emit("(value: ");
                  HandleEmitTypeIdentifier(property.Type);
                  Emit(") "); // setter can't have return type annotation
               }
               if (accessor.Body != null) HandleBlock(accessor.Body, true);
               else if (accessor.ExpressionBody != null) HandleExpressionBody(accessor.ExpressionBody, isGetter);
               else {
                  if (isGetter) {
                     EmitLine("{ return " + qualifiedBackingStoreName + "; }");
                  } else {
                     EmitLine("{ " + qualifiedBackingStoreName + " = SharpJsHelpers.valueClone(value); }");
                  }
               }
            }
         }
      }

      private void HandleBlock(BlockSyntax body, bool trailingNewline) {
         if (body.Statements.Count == 0) {
            EmitLine("{ }");
            return;
         }

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
               if (n.Else != null) {
                  Emit("else ");
                  HandleStatement(n.Else.Statement);
               }
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
               Emit("for (let ");
               Emit(n.Identifier.Text); // lhs of for of can't use type annotation in TS
               Emit(" of ");
               HandleExpressionDescent(n.Expression);
               Emit(") ");
               HandleStatement(n.Statement);
               break;
            case SwitchStatementSyntax n:
               Emit("switch (");
               HandleExpressionDescent(n.Expression);
               EmitLine(") {");
               Indent();

               foreach (var section in n.Sections) {
                  for (var i = 0; i < section.Labels.Count; i++) {
                     if (i != 0) EmitLine();
                     var label = section.Labels[i];
                     if (label is CaseSwitchLabelSyntax csls) {
                        Emit("case ");
                        HandleExpressionDescent(csls.Value);
                        Emit(": ");
                     } else if (label is DefaultSwitchLabelSyntax dsls) {
                        Emit("default: ");
                     }
                  }

                  if (section.Statements.Count == 1 && section.Statements[0] is BlockSyntax bs) {
                     HandleStatement(bs);
                  } else {
                     EmitLine("{");
                     Indent();

                     foreach (var child in section.Statements) {
                        HandleStatement(child);
                     }

                     Unindent();
                     EmitLine("}");
                  }
               }

               Unindent();
               EmitLine("}");
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
               HandleIdentifierName(n);
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
            case PrefixUnaryExpressionSyntax n: {
               if (TryGetOperatorMethodName(n.OperatorToken, 1, true, out string operatorMethodName)) {
                  var si = model.GetSymbolInfo(n);
                  if (si.Symbol.Locations.Length != 0) {
                     HandleExpressionDescent(n.Operand);
                     Emit(".");
                     Emit(operatorMethodName);
                     Emit("()");
                     break;
                  }
               }
               HandleUnaryExpression(n.Operand, n.OperatorToken, true);
               break;
            }
            case PostfixUnaryExpressionSyntax n: {
               if (TryGetOperatorMethodName(n.OperatorToken, 1, false, out string operatorMethodName)) {
                  var si = model.GetSymbolInfo(n);
                  if (si.Symbol.Locations.Length != 0) {
                     HandleExpressionDescent(n.Operand);
                     Emit(".");
                     Emit(operatorMethodName);
                     Emit("()");
                     break;
                  }
               }
               HandleUnaryExpression(n.Operand, n.OperatorToken, false);
               break;
            }
            case BinaryExpressionSyntax n: {
               if (n.OperatorToken.Text == "^") {
                  var lhsTi = model.GetTypeInfo(n.Left);
                  if (lhsTi.Type.SpecialType == SpecialType.System_Boolean) {
                     Emit("SharpJsHelpers.booleanXor(");
                     HandleExpressionDescent(n.Left);
                     Emit(", ");
                     HandleExpressionDescent(n.Right);
                     Emit(")");
                     break;
                  }
               }

               if (TryGetOperatorMethodName(n.OperatorToken, 2, false, out string operatorMethodName)) {
                  var si = model.GetSymbolInfo(n);
                  if (si.Symbol.Locations.Length != 0) {
                     Emit("SharpJsHelpers.tryBinaryOperator(");
                     HandleExpressionDescent(n.Left);
                     Emit(", ");
                     HandleExpressionDescent(n.Right);
                     Emit(", '");
                     Emit(operatorMethodName);
                     Emit("', (a, b) => a ");
                     Emit(n.OperatorToken.Text);
                     Emit(" b)");
                     break;
                  }
               }

               HandleExpressionDescent(n.Left);
               Emit(" ");

               if (n.OperatorToken.Text == "is") Emit("instanceof");
               else if (n.OperatorToken.Text == "==") Emit("===");
               else if (n.OperatorToken.Text == "!=") Emit("!==");
               else Emit(n.OperatorToken.Text);
               Emit(" ");
               HandleExpressionDescent(n.Right);
               break;
            }
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
         var si = model.GetSymbolInfo(node.Type);
         var symbolPath = si.Symbol.GetPath();

         if (TryEmitterLanguageApiConstructorOverrides(symbolPath, node.Type, node.ArgumentList)) {
            // override handled emit
         } else {
            Emit("new ");
            HandleEmitTypeIdentifier(node.Type);
            Emit("(");
            HandleArgumentListExpression(node.ArgumentList);
            Emit(")");
         }
      }

      private void HandleUnaryExpression(ExpressionSyntax operand, SyntaxToken operatorToken, bool isPrefix) {
         var ins = operand as IdentifierNameSyntax;
         var isOutRefWrite = ins != null &&
                             model.GetSymbolInfo(ins).Symbol.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax() is ParameterSyntax ps &&
                             (HasModifier(ps.Modifiers, SyntaxKind.OutKeyword) || HasModifier(ps.Modifiers, SyntaxKind.RefKeyword));

         if (isOutRefWrite) {

            if (isPrefix) {
               Emit(ins.Identifier.Text);
               Emit(".write(");
               if (operatorToken.Text.Length == 1) {
                  Emit(operatorToken.Text); // e.g. -, +
                  Emit(ins.Identifier.Text);
                  Emit(".read()");
               } else {
                  Emit(ins.Identifier.Text);
                  Emit(".read() ");
                  Emit(operatorToken.Text.Substring(1)); // e.g. --, ++ => -, +
                  Emit(" 1");
               }
               Emit(")");
            } else {
               Emit("SharpJsHelpers.readThenExec(() => ");
               Emit(ins.Identifier.Text);
               Emit(".read(), val => ");
               Emit(ins.Identifier.Text);
               Emit(".write(val ");
               Emit(operatorToken.Text.Substring(1)); // e.g. --, ++ => -, +
               Emit(" 1))");
            }
         } else {
            if (isPrefix) {
               Emit(operatorToken.Text);
               HandleExpressionDescent(operand);
            } else {
               HandleExpressionDescent(operand);
               Emit(operatorToken.Text);
            }
         }
      }

      private void HandleSimpleAssignmentExpression(AssignmentExpressionSyntax node) {
         var leftSymbolPath = ResolveExpressionInvokedSymbolPath(node.Left); // can be empty, e.g. for indexer
         if (leftSymbolPath.Count > 0 && TryEmitterLanguageApiSetterOverrides(leftSymbolPath, node.Left, node.Right)) {
            return;
         }

         // detect if write to left.
         var ins = node.Left as IdentifierNameSyntax;
         var isOutRefWriteToLeft = ins != null &&
                                   model.GetSymbolInfo(ins).Symbol.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax() is ParameterSyntax ps &&
                                   (HasModifier(ps.Modifiers, SyntaxKind.OutKeyword) || HasModifier(ps.Modifiers, SyntaxKind.RefKeyword));

         if (isOutRefWriteToLeft) {
            Emit(ins.Identifier.Text);
            Emit(".write(");
            if (node.OperatorToken.Text.Length != 1) { // e.g. +=, -=, /=
               Emit(ins.Identifier.Text);
               Emit(".read() ");
               Emit(node.OperatorToken.Text.Substring(0, node.OperatorToken.Text.Length - 1));
               Emit(" ");
            }
         } else {
            HandleExpressionDescent(node.Left);
            Emit(" ");
            Emit(node.OperatorToken.Text);
            Emit(" ");
         }

         // write RHS
         var rhsTi = model.GetTypeInfo(node.Right);
         var rhsType = rhsTi.Type ?? rhsTi.ConvertedType;
         if (rhsType.IsValueType) {
            Emit("SharpJsHelpers.valueClone(");
            HandleExpressionDescent(node.Right);
            Emit(")");
         } else {
            HandleExpressionDescent(node.Right);
         }

         // close out/ref write
         if (isOutRefWriteToLeft) {
            Emit(")");
         }
      }

      // Note: SimpleAssignmentExpression LHS can be MemberAccessExpression. 
      // We want to handle getters and setters here. Getters are overrided as normal.
      // Setters must not be overrided as getters. Setter overriding happens at the
      // SimpleAssignmentExpression.
      private void HandleMemberAccessExpression(MemberAccessExpressionSyntax node) {
         var isAssignmentLhs = node.Parent is AssignmentExpressionSyntax aes && node == aes.Left;
         if (!isAssignmentLhs && TryEmitterLanguageApiGetterOverrides(ResolveExpressionInvokedSymbolPath(node), node)) {
            // Override handles emit.
         } else {
            HandleExpressionDescent(node.Expression);
            Emit(".");
            Emit(node.Name.Identifier.Text);
         }
      }

      private void HandleArgumentExpression(ArgumentSyntax node) {
         // If we're passing to an out/ref arg what's already an out/ref arg, just pass what was given to us
         if (node.Parent is ArgumentListSyntax als && als.Parent is InvocationExpressionSyntax ies) {
            var methodSymbolInfo = model.GetSymbolInfo(ies.Expression);
            var nodeSymbolInfo = model.GetSymbolInfo(node.Expression);
            if (methodSymbolInfo.Symbol is IMethodSymbol methodSymbol && 
                node.Expression is IdentifierNameSyntax ins &&
                nodeSymbolInfo.Symbol is IParameterSymbol ps) {
               var argIndex = als.Arguments.IndexOf(node);
               if (methodSymbol.Parameters[argIndex].RefKind != RefKind.None && ps.RefKind != RefKind.None) {
                  Emit(ins.Identifier.Text);
                  return;
               }
            }
         }
         if (node.RefOrOutKeyword.Kind() != 0) {
            // out or ref. Not necessarily of an identifier node! E.g. can be to a struct member
            Emit("createOutRefParam(() => { return SharpJsHelpers.valueClone(");
            HandleExpressionDescent(node.Expression);
            Emit("); }, (__value) => { ");
            HandleExpressionDescent(node.Expression);
            Emit(" = __value; return SharpJsHelpers.valueClone(__value); })");
         } else {
            HandleExpressionDescent(node.Expression);
         }
      }

      private void HandleArgumentListExpression(BaseArgumentListSyntax node) {
         //BUG: doesn't handle named args
         for (var i = 0; i < node.Arguments.Count; i++) {
            if (i != 0) Emit(", ");
            HandleArgumentExpression(node.Arguments[i]);
         }
      }

      private void HandleIdentifierName(IdentifierNameSyntax n) {
         const int kEmitThis = 0, kEmitStatic = 1, kEmitNothing = 2, kEmitOutRefRead = 3;

         var si = model.GetSymbolInfo(n);
         var declaringSyntax = si.Symbol.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax();

         int CheckRequiredAmbuityResolution() {
            // If on RHS of . e.g. b of a.b, no need for this.
            if (n.Parent is MemberAccessExpressionSyntax maes && maes.Expression != n) {
               return kEmitNothing;
            }

            if (declaringSyntax is MethodDeclarationSyntax ||
                declaringSyntax?.Parent?.Parent is FieldDeclarationSyntax ||
                declaringSyntax is PropertyDeclarationSyntax) {
               return si.Symbol.IsStatic ? kEmitStatic : kEmitThis;
            }

            if (declaringSyntax is ParameterSyntax ps) {
               // note: write cases are handled in AssignmentExpressionSyntax, PostfixUnaryExpressionSyntax, PrefixUnaryExpressionSyntax.
               // So no need to handle here.
               if (HasModifier(ps.Modifiers, SyntaxKind.OutKeyword) || HasModifier(ps.Modifiers, SyntaxKind.RefKeyword)) {
                  return kEmitOutRefRead;
               }
            }

            if (declaringSyntax is BaseTypeDeclarationSyntax btds) {
               HandlePotentialCrossFileTypeDependency(btds);
            }

            return kEmitNothing;
         }

         var ambiguityResolution = CheckRequiredAmbuityResolution();
         if (ambiguityResolution == kEmitThis) Emit("this.");
         else if (ambiguityResolution == kEmitStatic) {
            var clazz = declaringSyntax.Ancestors().OfType<ClassDeclarationSyntax>().FirstOrDefault();
            var struzt = declaringSyntax.Ancestors().OfType<StructDeclarationSyntax>().FirstOrDefault();
            if (clazz != null) HandleEmitTypeIdentifier(clazz);
            if (struzt != null) HandleEmitTypeIdentifier(struzt);
            Emit(".");
         }
         Emit(n.Identifier.Text);
         if (ambiguityResolution == kEmitOutRefRead) {
            Emit(".read()");
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

      private bool TryEmitterLanguageApiConstructorOverrides(IReadOnlyList<ISymbol> symbols, TypeSyntax type, ArgumentListSyntax argumentList) {
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;

         bool IsMatch(params string[] path) => symbols.Count == 3 + path.Length + 1 && symbols.Skip(3).Take(path.Length).Select(s => s.Name).SequenceEqual(path);

         if (IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic))) {
            switch (symbols[6].Name) {
               case "List":
                  Emit("new ");
                  HandleEmitTypeIdentifier(type);
                  Emit("()"); // forego capacity arg
                  return true;
            }
         }
         return false;
      }

      private bool TryEmitterLanguageApiGetterOverrides(IReadOnlyList<ISymbol> symbols, MemberAccessExpressionSyntax node) {
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;

         bool IsMatch(params string[] path) => symbols.Count == 3 + path.Length + 1 && symbols.Skip(3).Take(path.Length).Select(s => s.Name).SequenceEqual(path);

         var subject = node.Expression;
         if (IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic), "List") ||
             IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic), "IReadOnlyList") ||
             IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic), "IReadOnlyCollection")) {
            switch (symbols[7].Name) {
               case nameof(List<object>.Count):
                  HandleExpressionDescent(subject);
                  Emit(".length");
                  return true;
            }
         } else if (IsMatch(nameof(System), nameof(System.Array))) {
            switch (symbols[5].Name) {
               case nameof(Array.Length):
                  HandleExpressionDescent(subject);
                  Emit(".length");
                  return true;
            }
         }
         return false;
      }

      // BUG: Doesn't handle unary operators
      private bool TryEmitterLanguageApiSetterOverrides(IReadOnlyList<ISymbol> symbols, ExpressionSyntax left, ExpressionSyntax right) {
         // symbols is of left type.
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;

         bool IsMatch(params string[] path) => symbols.Count == 3 + path.Length + 1 && symbols.Skip(3).Take(path.Length).Select(s => s.Name).SequenceEqual(path);

         if (IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic), "List")) {
            switch (symbols[7].Name) {
               case nameof(List<object>.Capacity) when (left is MemberAccessExpressionSyntax maes):
                  Emit("SharpJsHelpers.setCapacity(");
                  HandleExpressionDescent(maes.Expression);
                  Emit(", ");
                  HandleExpressionDescent(right);
                  Emit(")");
                  return true;
            }
         }
         return false;
      }

      private bool TryEmitterLanguageApiInvocationOverrides(IReadOnlyList<ISymbol> symbols, InvocationExpressionSyntax node, ArgumentListSyntax argumentList) {
         Trace.Assert(symbols[0].Kind == SymbolKind.Assembly);
         Trace.Assert(symbols[1].Kind == SymbolKind.NetModule);
         Trace.Assert(symbols[2].Kind == SymbolKind.Namespace); //global ns
         if (symbols[3].Kind != SymbolKind.Namespace) return false;

         bool IsMatch(params string[] path) => symbols.Count == 3 + path.Length + 1 && symbols.Skip(3).Take(path.Length).Select(s => s.Name).SequenceEqual(path);

         if (IsMatch(nameof(System), nameof(System.Console))) {
            switch (symbols[5].Name) {
               case nameof(Console.WriteLine):
                  Emit("console.log(");
                  HandleArgumentListExpression(argumentList);
                  Emit(")");
                  return true;
               case nameof(Console.ReadLine):
                  Emit("prompt(\"Enter String Input:\")");
                  return true;
            }
         } else if (IsMatch(nameof(System), nameof(Int32))) {
            switch (symbols[5].Name) {
               case nameof(int.Parse):
                  Emit("parseInt(");
                  HandleArgumentListExpression(argumentList);
                  Emit(")");
                  return true;
            }
         } else if (IsMatch(nameof(System), nameof(Math))) {
            Emit("Math." + char.ToLower(symbols[5].Name[0]) + symbols[5].Name.Substring(1) + "(");
            HandleArgumentListExpression(argumentList);
            Emit(")");
            return true;
         } else if (IsMatch(nameof(System), nameof(System.Collections), nameof(System.Collections.Generic), "List")) {
            var maes = (MemberAccessExpressionSyntax)node.Expression;
            switch (symbols[7].Name) {
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
               case nameof(List<object>.RemoveAt):
                  HandleExpressionDescent(maes.Expression);
                  Emit(".splice(");
                  HandleArgumentListExpression(argumentList);
                  Emit(", 1)");
                  return true;
               case nameof(List<object>.Reverse):
                  HandleExpressionDescent(maes.Expression);
                  Emit(".reverse(");
                  Emit(")");
                  return true;
               case nameof(List<object>.Sort):
                  HandleExpressionDescent(maes.Expression);
                  Emit(".sort(");
                  if (argumentList.Arguments.Count > 0) {
                     Trace.Assert(argumentList.Arguments.Count == 1);
                     Emit("(cmpLeft, cmpRight) => ");
                     HandleExpressionDescent(argumentList.Arguments[0].Expression);
                     Emit(".Compare(cmpLeft, cmpRight)");
                  }
                  Emit(")");
                  return true;
            }
         }
         return false;
      }

      private bool TryEmitterClassInvocationOverrides(IReadOnlyList<ISymbol> symbols) {
         var lastSymbol = symbols.Last();
         if (lastSymbol.Kind == SymbolKind.Method) {
            var methodSymbol = (IMethodSymbol)lastSymbol;
            if (methodSymbol.IsStatic) {
               var methodClass = methodSymbol.ContainingType;
               var methodClassFQTN = methodClass.SJSGetFullEmittedIdentifier();
               if (fqtnToFilePath.TryGetValue(methodClassFQTN, out string dependencyFilePath)) {
                  HandlePotentialCrossFileTypeDependency(methodClass.Name, dependencyFilePath);
                  Emit(methodClass.Name);
                  Emit(".");
                  Emit(methodSymbol.Name);
                  return true;
               }
            }
         }
         return false;
      }

      private void HandleEmitTypeIdentifier(BaseTypeDeclarationSyntax node, bool isSharpJsHelperTypeCheckArg = false) {
         // TODO: Probably buggy with nested classes.
         HandlePotentialCrossFileTypeDependency(node);
         Emit(node.Identifier.Text);
      }

      private void HandleEmitTypeIdentifier(TypeSyntax node, bool isSharpJsHelperTypeCheckArg = false) {
         var typeInfo = model.GetTypeInfo(node);
         var type = typeInfo.Type;

         if (type != null) {
            HandleEmitTypeIdentifier(type, isSharpJsHelperTypeCheckArg);
         } else {
            var si = model.GetSymbolInfo(node);
            var nts = (ITypeSymbol)si.Symbol;
            HandleEmitTypeIdentifier(nts, isSharpJsHelperTypeCheckArg);
         }
      }

      private void HandleEmitTypeIdentifier(ITypeSymbol type, bool isSharpJsHelperTypeCheckArg = false) {
         if (type.TypeKind == TypeKind.Array) {
            if (isSharpJsHelperTypeCheckArg) {
               Emit("Array");
            } else {
               var arrayType = (IArrayTypeSymbol)type;
               HandleEmitTypeIdentifier(arrayType.ElementType);
               Emit("[]");
            }
            return;
         }

         if (type is INamedTypeSymbol nts) {
            if (nts.TypeKind == TypeKind.Enum && isSharpJsHelperTypeCheckArg) {
               HandleEmitTypeIdentifier(nts.EnumUnderlyingType, isSharpJsHelperTypeCheckArg);
               return;
            }

            switch (nts.SJSGetFullEmittedIdentifier()) {
               case "System.Collections.Generic.List":
               case "System.Collections.Generic.IReadOnlyList":
                  if (isSharpJsHelperTypeCheckArg) {
                     Emit("Array");
                  } else {
                     Emit("Array<");
                     HandleEmitTypeIdentifier(nts.TypeArguments[0]);
                     Emit(">");
                  }
                  return;
               case "System.Exception":
                  Emit("Error");
                  return;
            }
         }

         HandlePotentialCrossFileTypeDependency(type);
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
               Emit(isSharpJsHelperTypeCheckArg ? "'number'" : "number");
               break;
            case nameof(String):
               Emit(isSharpJsHelperTypeCheckArg ? "'string'" : "string");
               break;
            case nameof(Boolean):
               Emit(isSharpJsHelperTypeCheckArg ? "'boolean'" : "boolean");
               break;
            case nameof(Object):
               Emit(isSharpJsHelperTypeCheckArg ? "'object'" : "{}");
               break;
            case "Void":
               if (isSharpJsHelperTypeCheckArg) throw new InvalidOperationException("Transpiler error. Shouldn't be type checking for void?");
               Emit("void");
               break;
            default:
               Emit(type.Name);

               if ((nts = type as INamedTypeSymbol) != null && nts.Arity != 0 && !isSharpJsHelperTypeCheckArg) {
                  Emit("<");
                  for (var i = 0; i < nts.Arity; i++) {
                     if (i != 0) Emit(", ");
                     HandleEmitTypeIdentifier(nts.TypeArguments[i], false);
                  }
                  Emit(">");
               }
               break;
         }
      }

      private void HandlePotentialCrossFileTypeDependency(TypeSyntax node) {
         var si = model.GetSymbolInfo(node);
         if (si.Symbol is ITypeSymbol ts) {
            HandlePotentialCrossFileTypeDependency(ts);
         }
      }

      private void HandlePotentialCrossFileTypeDependency(BaseTypeDeclarationSyntax decl) {
         var loc = decl.GetLocation().GetMappedLineSpan();
         if (loc.Path == null) {
            // not our code
            return;
         }
         HandlePotentialCrossFileTypeDependency(decl.Identifier.Text, loc.Path);
      }

      private void HandlePotentialCrossFileTypeDependency(ITypeSymbol type) {
         if (type.Locations.Length > 1) {
            throw new NotSupportedException("Partial classes not supported");
         }

         if (type is IArrayTypeSymbol ats) {
            HandlePotentialCrossFileTypeDependency(ats.ElementType);
            return;
         }

         if (type is INamedTypeSymbol nts) {
            foreach (var typeArg in nts.TypeArguments) {
               HandlePotentialCrossFileTypeDependency(typeArg);
            }
         }
         
         var loc = type.Locations.First().GetMappedLineSpan();
         if (loc.Path == null) {
            // not our code
            return;
         }
         HandlePotentialCrossFileTypeDependency(type.Name, loc.Path);
      }

      private void HandlePotentialCrossFileTypeDependency(string className, string dependencyFilePath) {
         if (dependencyFilePath == this.filePath) return;
         importedClassesByPath.Add(dependencyFilePath, className);
      }

      private void HandleInvocationExpression(InvocationExpressionSyntax node) {
         var symbolPath = ResolveExpressionInvokedSymbolPath(node);
         if (TryEmitterLanguageApiInvocationOverrides(symbolPath, node, node.ArgumentList)) {
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

      private IReadOnlyList<ISymbol> ResolveExpressionInvokedSymbolPath(InvocationExpressionSyntax node) {
         return ResolveExpressionInvokedSymbolPath(node.Expression);
      }

      private IReadOnlyList<ISymbol> ResolveExpressionInvokedSymbolPath(ExpressionSyntax node) {
         var symbolInfo = model.GetSymbolInfo(node);
         var symbol = symbolInfo.Symbol;
         return symbol.GetPath();
      }


      private void HandleLocalDeclarationStatement(LocalDeclarationStatementSyntax node) {
         Emit("let ");
         HandleVariableDeclarationStatement(node.Declaration, true);
      }

      private void HandleVariableDeclarationStatement(VariableDeclarationSyntax node, bool trailingSemicolonNewline) {
         for (var i = 0; i < node.Variables.Count; i++) {
            if (i != 0) Emit(", ");
            var variable = node.Variables[i];
            HandleVariableDeclarator(node, variable);
         }
         if (trailingSemicolonNewline) EmitLine(";");
      }

      private void HandleVariableDeclarator(VariableDeclarationSyntax node, VariableDeclaratorSyntax variable) {
         HandleVariableDeclarator(node.Type, variable.Initializer, variable.Identifier.Text);
      }

      private void HandleVariableDeclarator(TypeSyntax type, EqualsValueClauseSyntax initializerOrNull, string variableName) {
         HandleEmitTypedVariable(variableName, type);
         Emit(" = ");
         if (initializerOrNull != null) {
            HandleExpressionDescent(initializerOrNull.Value);
         } else {
            HandleEmitTypeDefault(type);
         }
         HandlePotentialCrossFileTypeDependency(type);
      }

      private void HandleEmitTypeDefault(TypeSyntax type) {
         var si = model.GetSymbolInfo(type);
         if (si.Symbol is IArrayTypeSymbol ats) {
            Emit("null");
         } else if (si.Symbol is INamedTypeSymbol nts) {
            switch (nts.SpecialType) {
               case SpecialType.System_Boolean:
                  Emit("false");
                  return;
               case SpecialType.System_SByte:
               case SpecialType.System_Int16:
               case SpecialType.System_Int32:
               case SpecialType.System_Int64:
               case SpecialType.System_Byte:
               case SpecialType.System_UInt16:
               case SpecialType.System_UInt32:
               case SpecialType.System_UInt64:
               case SpecialType.System_Single:
               case SpecialType.System_Double:
                  Emit("0");
                  return;
            }

            if (nts.TypeKind == TypeKind.Enum) {
               Emit("<");
               HandleEmitTypeIdentifier(nts);
               Emit(">");
               Emit("0");
               return;
            }

            if (!nts.IsValueType) {
               Emit("null");
               return;
            }

            HandleEmitTypeIdentifier(nts);
            Emit(".default()");
         }
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

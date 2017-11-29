using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace SharpJS {
   public class JavaScriptES5Emitter : ITranspilationEmitter {
      private readonly StringBuilder sb = new StringBuilder();
      private readonly HashSet<string> emittedNamespaces = new HashSet<string>();
      private string mainFullIdentifier = null;
      private Compilation compilation;
      private SemanticModel model;

      public string Process(ClassDeclarationSyntax node, Compilation compilation) {
         model = compilation.GetSemanticModel(node.SyntaxTree);

         sb.Clear();
         emittedNamespaces.Clear();
         mainFullIdentifier = null;
         this.compilation = compilation;

         HandleNamespaceDeclaration(GetFullEmittedIdentifier(node));
         HandleClassDeclaration(node);

         if (mainFullIdentifier != null) {
            EmitLine(mainFullIdentifier + "();");
         }
         return sb.ToString();
      }

      private string GetFullEmittedIdentifier(SyntaxNode node) {
         return "global." + node.GetFullIdentifierText();
      }

      private string GetFullEmittedIdentifier(ISymbol node) {
         var path = node.GetPath();
         Trace.Assert(path[0].Kind == SymbolKind.Assembly);
         Trace.Assert(path[1].Kind == SymbolKind.NetModule);
         Trace.Assert(path[2].Kind == SymbolKind.Namespace); // global
         var sb = new StringBuilder();
         sb.Append("global");
         for (var i = 3; i < path.Count; i++) {
            sb.Append(".");
            sb.Append(path[i].Name);
         }
         return sb.ToString();
      }
      
      private void HandleNamespaceDeclaration(string fullIdentifier) {
         var parts = fullIdentifier.Split('.');
         for (var i = 2; i <= parts.Length; i++) {
            var subIdentifier = string.Join(".", parts.Take(i));
            if (!emittedNamespaces.Contains(subIdentifier)) {
               EmitLine($"{subIdentifier} = {subIdentifier} || {{}};");
               emittedNamespaces.Add(subIdentifier);
            }
         }
      }

      private void HandleClassDeclaration(ClassDeclarationSyntax node) {
         var fullIdentifier = GetFullEmittedIdentifier(node);
         HandleNamespaceDeclaration(fullIdentifier);
         foreach (var method in node.Members<MethodDeclarationSyntax>()) {
            HandleMethodDeclaration(method);
         }
      }

      private void HandleMethodDeclaration(MethodDeclarationSyntax method) {
         string methodFullIdentifier = GetMethodFullIdentifier(method);
         Emit(methodFullIdentifier + " = ");
         HandleAnonymousMethod(method);
         EmitLine(";");
         if (method.Identifier.Text == "Main") {
            mainFullIdentifier = methodFullIdentifier;
         }
      }

      private string GetMethodFullIdentifier(MethodDeclarationSyntax method) {
         var classFullIdentifier = method.Parent.GetFullIdentifierText();
         var methodName = method.Identifier.Text;
         if (method.Modifiers.Any(x => x.Kind() == SyntaxKind.StaticKeyword)) {
            return $"{classFullIdentifier}.{methodName}";
         } else {
            return $"{classFullIdentifier}.prototype.{methodName}";
         }
      }

      private void HandleAnonymousMethod(MethodDeclarationSyntax method) {
         var isAsync = method.Modifiers.Any(x => x.Kind() == SyntaxKind.AsyncKeyword);
         if (isAsync) {
            Emit("async ");
         }
         Emit("function (");
         Emit(string.Join(", ", method.ParameterList.Parameters.Select(p => p.Identifier.Text)));
         Emit(") ");
         HandleBlock(method.Body);
      }

      private void HandleBlock(BlockSyntax body) {
         EmitLine("{");
         Indent();
         foreach (var statement in body.Statements) {
            HandleStatement(statement);
         }
         Unindent();
         Emit("}");
      }

      private void HandleStatement(StatementSyntax statement) {
         foreach (var node in statement.ChildNodes()) {
            switch (statement.Kind()) {
               case SyntaxKind.ExpressionStatement:
                  HandleExpressionDescent(node);
                  EmitLine(";");
                  break;
               case SyntaxKind.LocalDeclarationStatement:
                  HandleVariableDeclarationStatement(((LocalDeclarationStatementSyntax)statement).Declaration);
                  break;
               case SyntaxKind.ReturnStatement:
                  Emit("return ");
                  HandleExpressionDescent(node);
                  EmitLine(";");
                  break;
               default:
                  throw new NotSupportedException(statement.Kind().ToString());
            }
         }
      }

      private void HandleStatementDescendent(SyntaxNode node) {
         switch (node.Kind()) {
            case SyntaxKind.IdentifierName:
               Emit(((IdentifierNameSyntax)node).Identifier.Text);
               break;
            case SyntaxKind.ExpressionStatement:
               foreach (var child in node.ChildNodes()) {
                  HandleStatementDescendent(child);
               }
               break;
            case SyntaxKind.InvocationExpression:
               HandleExpressionDescent(node);
               break;
            case SyntaxKind.SimpleMemberAccessExpression:
               HandleSimpleMemberAccessExpression((MemberAccessExpressionSyntax)node);
               break;
            default:
               throw new NotImplementedException(node.Kind().ToString());
         }
      }

      private void HandleExpressionDescent(SyntaxNode node) {
         switch (node.Kind()) {
            case SyntaxKind.AwaitExpression:
               Emit("(");
               Emit("await (");
               HandleExpressionDescent(((AwaitExpressionSyntax)node).Expression);
               Emit("))");
               break;
            case SyntaxKind.NumericLiteralExpression:
               Emit(((LiteralExpressionSyntax)node).Token.Text);
               break;
            case SyntaxKind.IdentifierName:
               Emit(((IdentifierNameSyntax)node).Identifier.Text);
               break;
            case SyntaxKind.InterpolatedStringExpression:
               HandleInterpolatedStringExpression((InterpolatedStringExpressionSyntax)node);
               break;
            case SyntaxKind.InvocationExpression:
               HandleInvocationExpression((InvocationExpressionSyntax)node);
               break;
            case SyntaxKind.StringLiteralExpression:
               Emit(node.GetText().ToString());
               break;
            default:
               throw new NotSupportedException(node.Kind().ToString());
         }
      }

      private void HandleArgumentExpression(ArgumentSyntax node) {
         HandleExpressionDescent(node.Expression);
      }

      private void HandleArgumentListExpression(ArgumentListSyntax node) {
         Emit("(");
         for (var i = 0; i < node.Arguments.Count; i++) {
            if (i != 0) {
               Emit(", ");
            }
            HandleArgumentExpression(node.Arguments[i]);
         }
         Emit(")");
      }

      private void HandleInterpolatedStringExpression(InterpolatedStringExpressionSyntax node) {
         for (var i = 0; i < node.Contents.Count; i++) {
            if (i != 0) {
               Emit(" + ");
            }
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
         if (symbols[3].Kind != SymbolKind.Namespace) {
            // e.g. class in global namespace
            return false;
         }
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
               Emit("console.log");
               HandleArgumentListExpression(argumentList);
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
               Emit("parseInt");
               HandleArgumentListExpression(argumentList);
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
               Emit(GetFullEmittedIdentifier(methodSymbol));
               return true;
            }
         }
         return false;
      }

      private void HandleInvocationExpression(InvocationExpressionSyntax node) {
         var symbolPath = ResolveInvocationExpressionInvokedSymbolPath(node);
         if (TryEmitterLanguageApiOverrides(symbolPath, node.ArgumentList)) {
            // emitter handles expression emit
         } else if (TryEmitterClassInvocationOverrides(symbolPath)) {
            HandleArgumentListExpression(node.ArgumentList);
         } else {
            HandleStatementDescendent(node.Expression);
            HandleArgumentListExpression(node.ArgumentList);
         }
      }

      private IReadOnlyList<ISymbol> ResolveInvocationExpressionInvokedSymbolPath(InvocationExpressionSyntax node) {
         var diags = model.Compilation.GetDiagnostics();
         var expression = node.Expression;
         var symbolInfo = model.GetSymbolInfo(node);
         var symbol = symbolInfo.Symbol;
         return symbol.GetPath();
      }

      private void HandleSimpleMemberAccessExpression(MemberAccessExpressionSyntax node) {
         HandleStatementDescendent(node.Expression);
         Emit(node.OperatorToken.Text);
         Emit(node.Name.Identifier.Text);
      }

      private void HandleVariableDeclarationStatement(VariableDeclarationSyntax node) {
         Emit("var ");
         for (int i = 0; i < node.Variables.Count; i++) {
            if (i != 0) {
               Emit(", ");
            }
            var variable = node.Variables[i];
            Emit(variable.Identifier.Text);
            if (variable.Initializer != null) {
               Emit(" = ");
               HandleExpressionDescent(variable.Initializer.Value);
            }
         }
         EmitLine(";");
      }

      private string indentationHelper = new string(' ', 1024);
      private int indentCount = 0;
      private bool isStartOfLine = true;
      private void Indent() { indentCount++; }
      private void Unindent() { indentCount--; }

      private void EmitToken(string s) => Emit(s + " ");

      private void Emit(string s) {
         ConditionallyEmitIndent();
         sb.Append(s);
         isStartOfLine = false;
      }

      private void EmitLine(string s) {
         ConditionallyEmitIndent();
         sb.AppendLine(s);
         isStartOfLine = true;
      }

      private void ConditionallyEmitIndent() {
         if (isStartOfLine) {
            sb.Append(indentationHelper, 0, indentCount * 3);
            isStartOfLine = false;
         }
      }
   }
}
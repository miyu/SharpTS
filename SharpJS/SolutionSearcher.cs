using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharpJS {
   public static class SolutionSearcher {
      public static async Task<List<ClassDeclarationSyntax>> FindClasses(Solution solution) {
         var namespaceNodes = new Stack<NamespaceDeclarationSyntax>();
         var classNodes = new List<ClassDeclarationSyntax>();
         foreach (var project in solution.Projects) {
            foreach (var document in project.Documents) {
               var syntaxTree = await document.GetSyntaxTreeAsync();
               var documentRoot = syntaxTree.GetRoot();
               if (!documentRoot.IsKind(SyntaxKind.CompilationUnit)) continue;
               foreach (var node in documentRoot.ChildNodes<NamespaceDeclarationSyntax>()) {
                  namespaceNodes.Push(node);
               }
               foreach (var node in documentRoot.ChildNodes<ClassDeclarationSyntax>()) {
                  classNodes.Add(node);
               }
            }
         }
         while (namespaceNodes.Any()) {
            var namespaceNode = namespaceNodes.Pop();
            foreach (var node in namespaceNode.ChildNodes<NamespaceDeclarationSyntax>()) {
               namespaceNodes.Push(node);
            }
            foreach (var node in namespaceNode.ChildNodes<ClassDeclarationSyntax>()) {
               classNodes.Add(node);
            }
         }
         return classNodes;
      }
   }

   public class JavaScriptES5Emitter {
      private readonly StringBuilder sb = new StringBuilder();
      private string mainFullIdentifier = null;

      public string Process(ClassDeclarationSyntax node) {
         sb.Clear();
         mainFullIdentifier = null;

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

      private void HandleNamespaceDeclaration(string fullIdentifier) {
         var parts = fullIdentifier.Split('.');
         for (var i = 2; i < parts.Length; i++) {
            var subIdentifier = string.Join(".", parts.Take(i));
            EmitLine($"{subIdentifier} = {subIdentifier} || {{}};");
         }
      }

      private void HandleClassDeclaration(ClassDeclarationSyntax node) {
         var fullIdentifier = GetFullEmittedIdentifier(node);
         foreach (var method in node.Members<MethodDeclarationSyntax>()) {
            HandleMethodDeclaration(fullIdentifier, method);
         }
      }

      private void HandleMethodDeclaration(string classFullIdentifier, MethodDeclarationSyntax method) {
         var methodName = method.Identifier.Text;
         string methodFullIdentifier;
         if (method.Modifiers.Any(x => x.Kind() == SyntaxKind.StaticKeyword)) {
            methodFullIdentifier = $"{classFullIdentifier}.{methodName}";
         } else {
            methodFullIdentifier = $"{classFullIdentifier}.prototype.{methodName}";
         }
         Emit(methodFullIdentifier + " = ");
         HandleAnonymousMethod(method);
         EmitLine(";");
         if (methodName == "Main") {
            mainFullIdentifier = methodFullIdentifier;
         }
      }

      private void HandleAnonymousMethod(MethodDeclarationSyntax method) {
         Emit("function(");
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
            HandleStatementDescendent(node);
         }
         EmitLine(";");
      }

      private void HandleStatementDescendent(SyntaxNode node) {
         switch (node.Kind()) {
            case SyntaxKind.Argument:
               HandleArgumentExpression((ArgumentSyntax)node);
               break;
            case SyntaxKind.ArgumentList:
               HandleArgumentListExpression((ArgumentListSyntax)node);
               break;
            case SyntaxKind.IdentifierName:
               Emit(((IdentifierNameSyntax)node).Identifier.Text);
               break;
            case SyntaxKind.ExpressionStatement:
               foreach (var child in node.ChildNodes()) {
                  HandleStatementDescendent(child);
               }
               break;
            case SyntaxKind.InvocationExpression:
               HandleInvocationExpression((InvocationExpressionSyntax)node);
               break;
            case SyntaxKind.SimpleMemberAccessExpression:
               HandleSimpleMemberAccessExpression((MemberAccessExpressionSyntax)node);
               break;
            case SyntaxKind.StringLiteralExpression:
               Emit(node.GetText().ToString());
               break;
            default:
               throw new NotImplementedException(node.Kind().ToString());
         }
      }

      private void HandleArgumentExpression(ArgumentSyntax node) {
         HandleStatementDescendent(node.Expression);
      }

      private void HandleArgumentListExpression(ArgumentListSyntax node) {
         Emit("(");
         for (var i = 0; i < node.Arguments.Count; i++) {
            if (i != 0) {
               Emit(", ");
            }
            HandleStatementDescendent(node.Arguments[i]);
         }
         Emit(")");
      }

      private void HandleInvocationExpression(InvocationExpressionSyntax node) {
         if (node.Expression.ToString() == "Console.WriteLine") {
            var x = (MemberAccessExpressionSyntax)node.Expression;
            Emit("console.log");
         } else {
            HandleStatementDescendent(node.Expression);
         }
         HandleStatementDescendent(node.ArgumentList);
      }

      private void HandleSimpleMemberAccessExpression(MemberAccessExpressionSyntax node) {
         HandleStatementDescendent(node.Expression);
         Emit(node.OperatorToken.Text);
         Emit(node.Name.Identifier.Text);
      }

      private string indentationHelper = new string(' ', 1024);
      private int indentCount = 0;
      private bool isStartOfLine = true;
      private void Indent() { indentCount++; }
      private void Unindent() { indentCount--; }
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

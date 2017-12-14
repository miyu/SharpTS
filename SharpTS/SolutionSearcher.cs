using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SharpJS {
   public static class SolutionSearcher {
      public static async Task<(List<ClassDeclarationSyntax>, List<StructDeclarationSyntax>, List<EnumDeclarationSyntax>)> FindTypes(Solution solution) {
         var classNodes = new List<ClassDeclarationSyntax>();
         var structNodes = new List<StructDeclarationSyntax>();
         var enumNodes = new List<EnumDeclarationSyntax>();
         foreach (var project in solution.Projects) {
            var (classes, structs, enums) = await FindTypes(project);
            classNodes.AddRange(classes);
            structNodes.AddRange(structs);
            enumNodes.AddRange(enums);
         }
         return (classNodes, structNodes, enumNodes);
      }

      public static async Task<(List<ClassDeclarationSyntax>, List<StructDeclarationSyntax>, List<EnumDeclarationSyntax>)> FindTypes(Project project) {
         var namespaceNodes = new Stack<NamespaceDeclarationSyntax>();
         var classNodes = new List<ClassDeclarationSyntax>();
         var structNodes = new List<StructDeclarationSyntax>();
         var enumNodes = new List<EnumDeclarationSyntax>();
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
            foreach (var node in documentRoot.ChildNodes<StructDeclarationSyntax>()) {
               structNodes.Add(node);
            }
            foreach (var node in documentRoot.ChildNodes<EnumDeclarationSyntax>()) {
               enumNodes.Add(node);
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
            foreach (var node in namespaceNode.ChildNodes<StructDeclarationSyntax>()) {
               structNodes.Add(node);
            }
            foreach (var node in namespaceNode.ChildNodes<EnumDeclarationSyntax>()) {
               enumNodes.Add(node);
            }
         }
         return (classNodes, structNodes, enumNodes);
      }
   }
}

using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SharpJS {
   public static class SolutionSearcher {
      public static async Task<List<ClassDeclarationSyntax>> FindClasses(Solution solution) {
         List<ClassDeclarationSyntax> classes = new List<ClassDeclarationSyntax>();
         foreach (var project in solution.Projects) {
            classes.AddRange(await FindClasses(project));
         }
         return classes;
      }

      public static async Task<List<ClassDeclarationSyntax>> FindClasses(Project project) {
         var namespaceNodes = new Stack<NamespaceDeclarationSyntax>();
         var classNodes = new List<ClassDeclarationSyntax>();
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
}

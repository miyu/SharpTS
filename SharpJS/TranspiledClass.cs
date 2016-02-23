using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace SharpJS {
   public class TranspilationRoot {
      private readonly Dictionary<string, TranspiledClass> classesByFullIdentifier = new Dictionary<string, TranspiledClass>();

      public bool TryGetClassByFullIdentifier(string fullIdentifier, out TranspiledClass value) {
         return classesByFullIdentifier.TryGetValue(fullIdentifier, out value);
      }
   }

   public class TranspiledNamespace {

   }

   public class TranspiledClass {
      public TranspiledClass(ClassDeclarationSyntax declaration, List<MethodDeclarationSyntax> methods) {
         Declaration = declaration;
         Methods = methods;
      }

      public string FullName => Declaration.GetFullIdentifierText();
      public string Name => Declaration.Identifier.Text;
      public ClassDeclarationSyntax Declaration { get; }
      public List<MethodDeclarationSyntax> Methods { get; }

      public void Merge(TranspiledClass other) {

      }
   }

   public static class RoslynExtensions {
      public static string GetFullIdentifierText(this SyntaxNode node) {
         string fullIdentifier = null;
         while (true) {
            string identifier;
            switch (node.Kind()) {
               case SyntaxKind.ClassDeclaration:
                  identifier = ((ClassDeclarationSyntax)node).Identifier.Text;
                  break;
               case SyntaxKind.NamespaceDeclaration:
                  identifier = ((NamespaceDeclarationSyntax)node).Name.ToString();
                  break;
               case SyntaxKind.CompilationUnit:
                  return fullIdentifier;
               default:
                  throw new NotImplementedException(node.Kind().ToString());
            }
            if (fullIdentifier == null) {
               fullIdentifier = identifier;
            } else {
               fullIdentifier = identifier + "." + fullIdentifier;
            }
            node = node.Parent;
         }
      }

      public static IEnumerable<T> ChildNodes<T>(this SyntaxNode n) {
         return n.ChildNodes().OfType<T>();
      }

      public static IEnumerable<T> Members<T>(this NamespaceDeclarationSyntax n) {
         return n.Members.OfType<T>();
      }

      public static IEnumerable<T> Members<T>(this ClassDeclarationSyntax n) {
         return n.Members.OfType<T>();
      }
   }
}

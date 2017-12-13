using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Generic;
using System.Linq;

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
      public static string GetFullIdentifierText(this SyntaxNode node, bool includeNamespace = true) {
         string fullIdentifier = null;
         while (true) {
            string identifier;
            switch (node) {
               case MethodDeclarationSyntax n:
                  identifier = n.Identifier.Text;
                  break;
               case NamespaceDeclarationSyntax n:
                  if (!includeNamespace) {
                     node = node.Parent;
                     continue;
                  }
                  identifier = n.Name.ToString();
                  break;
               case ClassDeclarationSyntax n:
                  identifier = n.Identifier.Text;
                  break;
               case StructDeclarationSyntax n:
                  identifier = n.Identifier.Text;
                  break;
               case EnumDeclarationSyntax n:
                  identifier = n.Identifier.Text;
                  break;
               case CompilationUnitSyntax n:
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

      public static IReadOnlyList<ISymbol> GetPath(this ISymbol n) {
         var s = new Stack<ISymbol>();
         while (n != null) {
            s.Push(n);
            n = n.ContainingSymbol;
         }
         var result = new ISymbol[s.Count];
         for (var i = 0; i < result.Length; i++) {
            result[i] = s.Pop();
         }
         return result;
      }
   }
}

using System;
using Microsoft.CodeAnalysis.MSBuild;

namespace SharpJS {
   public static class Program {
      public static void Main() {
         var workspace = MSBuildWorkspace.Create();
         var solutionFilePath = @"C:\my-repositories\SharpJS\HelloWorld\HelloWorld.sln";
         var solution = workspace.OpenSolutionAsync(solutionFilePath).Result;
         var classes = SolutionSearcher.FindClasses(solution).Result;
         var emitter = new JavaScriptES5Emitter();
         foreach (var c in classes) {
            Console.WriteLine(emitter.Process(c));
         }
      }
   }
}

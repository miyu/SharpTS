using System;
using System.IO;
using System.Text;
using Microsoft.CodeAnalysis.MSBuild;

namespace SharpJS {
   public static class Program {
      public static void Main() {
         var workspace = MSBuildWorkspace.Create();
         var solutionFilePath = @"C:\my-repositories\SharpJS\HelloWorld\HelloWorld.sln";
         var solution = workspace.OpenSolutionAsync(solutionFilePath).Result;
         var dependencyGraph = solution.GetProjectDependencyGraph();
         var finalSource = new StringBuilder();
         foreach (var projectId in dependencyGraph.GetTopologicallySortedProjects()) {
            var project = solution.GetProject(projectId);
            var compilation = project.GetCompilationAsync().Result;
            var classes = SolutionSearcher.FindClasses(project).Result;
            var emitter = new JavaScriptES5Emitter();
            foreach (var c in classes) {
               var source = emitter.Process(c, compilation);
               finalSource.AppendLine(source);
               Console.WriteLine(source);
            }
         }
         File.WriteAllText("out.js", finalSource.ToString());
      }
   }
}

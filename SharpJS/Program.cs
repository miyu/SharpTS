using System;
using System.IO;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.MSBuild;

namespace SharpJS {
   public static class Program {
      public static void Main() {
         //Environment.SetEnvironmentVariable("MSBUILD_EXE_PATH", @"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\bin\msbuild.exe");
         Environment.SetEnvironmentVariable("VSINSTALLDIR", @"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community");
         Environment.SetEnvironmentVariable("VisualStudioVersion", @"15.0");

         var workspace = MSBuildWorkspace.Create();
         workspace.WorkspaceFailed += (s, e) => {
            Console.WriteLine($"Workspace failed {e.Diagnostic}");
            //throw new Exception("Workspace failed");
         };

         var solutionFilePath = @"C:\my-repositories\miyu\SharpJS\HelloWorld\HelloWorld.sln";
         var solution = workspace.OpenSolutionAsync(solutionFilePath).Result;
         var dependencyGraph = solution.GetProjectDependencyGraph();
         var finalSource = new StringBuilder();
         foreach (var projectId in dependencyGraph.GetTopologicallySortedProjects()) {
            var project = solution.GetProject(projectId);
            if (project.Name.Contains("SharpJS.Definitions")) {
               continue;
            }
            var compilation = project.GetCompilationAsync().Result;
            compilation = compilation.AddReferences(MetadataReference.CreateFromFile(typeof(object).Assembly.Location));
            //compilation = compilation.WithOptions(new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

            var classes = SolutionSearcher.FindClasses(project).Result;
            var emitter = new JavaScriptES5Emitter();
            var references = project.AllProjectReferences;
            var diags = compilation.GetDiagnostics();
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

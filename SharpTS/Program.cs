// motivation example architecture
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Linq;
using System.Xml.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.MSBuild;
using SharpJS.TypeScript;

namespace SharpJS {
   public static class Program {
      public static void Main(string[] args) {
         //Environment.SetEnvironmentVariable("MSBUILD_EXE_PATH", @"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\bin\msbuild.exe");
         Environment.SetEnvironmentVariable("VSINSTALLDIR", @"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community");
         Environment.SetEnvironmentVariable("VisualStudioVersion", @"15.0");

         var workspace = MSBuildWorkspace.Create();
         workspace.WorkspaceFailed += (s, e) => {
            //Console.WriteLine($"Workspace failed {e.Diagnostic}");
            //throw new Exception("Workspace failed");
         };

         //var solutionFilePath = @"C:\my-repositories\miyu\SharpJS\HelloWorld\HelloWorld.sln";
         //var solutionFilePath = @"C:\my-repositories\miyu\SharpJS\CrossFileReferences\CrossFileReferences.sln";
         //var solutionFilePath = @"C:\my-repositories\miyu\SharpJS\SimpleOOP\SimpleOOP.sln";
         var solutionFilePath = args[0]; // @"C:\my-repositories\miyu\SharpJS\Clipper\Clipper.sln";
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
            
            var defaultNamespace = GetDefaultNamespace(project, workspace);
            TypeScriptProjectTranspiler.Transpile(project, workspace, compilation, defaultNamespace);
         }
         File.WriteAllText("out.js", finalSource.ToString());
      }

      private static string GetDefaultNamespace(Project project, MSBuildWorkspace workspace) {
         var document = XDocument.Load(project.FilePath);
         var projectNode = document.Root;
         var ns = projectNode.Name.Namespace;
         return (
            from propertyGroup in projectNode.Elements(ns + "PropertyGroup")
            from property in propertyGroup.Elements(ns + "RootNamespace")
            select property.Value).FirstOrDefault() ?? project.Name;
      }
   }
}

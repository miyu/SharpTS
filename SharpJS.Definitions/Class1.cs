using System.Threading.Tasks;
using SystemConsole = System.Console;

namespace SharpJS.Definitions {
   public static class Console {
      public static Task<string> ReadLineAsync() {
         return Task.FromResult(SystemConsole.ReadLine());
      }
   }
}

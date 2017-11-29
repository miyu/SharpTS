using System.Threading.Tasks;
using SharpJS.Definitions;

namespace HelloWorld.InnerNamespace {
   public static class Program {
      public static void Main() {
         Console.WriteLine("Hello, World!");
         var age = PromptAge();
         Console.WriteLine($"You are {age} years old!");
      }
      public static async Task<int> PromptAge() {
         Console.WriteLine("How old are you?");
         return int.Parse(await Console.ReadLineAsync());
      }
   }
}

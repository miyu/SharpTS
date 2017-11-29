using System;

namespace HelloWorld.InnerNamespace {
   public static class Program {
      public static int Main(string[] args) {
         Console.WriteLine("Hello, World!");
         var age = PromptAge();
         Console.WriteLine($"You are {age} years old!");
         return 0;
      }

      public static int PromptAge() {
         Console.WriteLine("How old are you?");
         return int.Parse(Console.ReadLine());
      }
   }
}

using System;

namespace SimpleOOP {
   public static class OverloadingDemo {
      public static void Test() {
         for (var i = 0; i < 10; i++) {
            Print("Fact " + i);
            Print(Factorial(i));
            Print();
         }
      }

      public static void Print() => Console.WriteLine();
      public static void Print(int n) => Console.WriteLine(n);
      public static void Print(string s) => Console.WriteLine(s);

      public static int Factorial(int n) => Factorial(1, n);
      public static int Factorial(int n, int acc) => n == 0 ? acc : Factorial(n - 1, acc * n);
   }
}

using System;

namespace SimpleOOP {
   public static class ArrayDemo {
      private const int N = 10;

      public static void Test() {
         var x = new int[100];
         for (var i = 0; i < N && i < 1337; i++) {
            x[i] = i;
         }
         for (var i = 0; i < x.Length; i++) {
            Console.WriteLine(x[i]);
         }
         foreach (var v in x) {
            Console.WriteLine(v);
         }
      }
   }
}

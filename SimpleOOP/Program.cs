using System;

namespace SimpleOOP {
   public class Program {
      static void Main(string[] args) {
         Section("Linked Lists"); LinkedListDemo.Test();
         Section("Arrays"); ArrayDemo.Test();
         Section("Overloading"); OverloadingDemo.Test();
         Section("Polymorphism"); PolymorphismDemo.Test();
         Section("Out/Ref"); OutRefDemo.Test();
      }

      static void Section(string s) {
         Console.WriteLine(s);
         Console.WriteLine();
      }
   }
}

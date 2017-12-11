using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SimpleOOP {
   public static class PolymorphismDemo {
      public static void Test() {
         new Vehicle();
         new Car();
         new Truck();
      }
   }

   public class Vehicle {
      public Vehicle() => Console.WriteLine("Vehicle");
   }

   public class Car : Vehicle {
      public Car() => Console.WriteLine("Car");
   }

   public class Truck : Vehicle {
      public Truck() {
         Console.WriteLine("Truck");
      }
   }
}

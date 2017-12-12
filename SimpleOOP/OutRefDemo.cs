using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SimpleOOP {
   public static class OutRefDemo {
      public static void Test() {
         {
            int x;
            Console.WriteLine(Helper1(out x));
            Console.WriteLine(x);
         }
         {
            Dummy x;
            Console.WriteLine(Helper2(out x));
            Console.WriteLine(x);
         }
         {
            int x = 10, y = 20;
            Console.WriteLine(x + " " + y);
            Swap1(ref x, ref y);
            Console.WriteLine(x + " " + y);

            Console.WriteLine(Helper3(ref x));
            Console.WriteLine(x);

            Console.WriteLine(Helper4(ref x));
            Console.WriteLine(x);

            Console.WriteLine(Helper5(ref x));
            Console.WriteLine(x);
         }
         {
            var a = new Point();
            a.x = 10;
            a.y = 20;
            var b = new Point();
            Helper1(out b.x);
            Helper1(out b.y);
            Helper5(ref b.y); // a = (10, 20), b = (10, 5).
            Console.WriteLine(a.x + " " + a.y + " " + b.x + " " + b.y);
            Swap2(ref a, ref b);
            Console.WriteLine(a.x + " " + a.y + " " + b.x + " " + b.y);

            var pba = new PointBox();
            pba.p = a;

            var pbb = new PointBox();
            pbb.p = b;

            Console.WriteLine(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);
            Swap2(ref pba.p, ref pbb.p);
            Console.WriteLine(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);

            Helper1(out pba.p.x);
            Helper1(out pba.p.y);
            Helper1(out pbb.p.x);
            Helper1(out pbb.p.y);
            Console.WriteLine(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);
            Console.WriteLine(a.x + " " + a.y + " " + b.x + " " + b.y);
         }
      }

      private static int Helper1(out int x) => x = 10;
      private static Dummy Helper2(out Dummy x) => x = new Dummy();
      private static int Helper3(ref int x) => x++;
      private static int Helper4(ref int x) => --x;
      private static int Helper5(ref int x) => x /= 2;

      private static void Swap1(ref int x, ref int y) {
         var temp = x;
         x = y;
         y = temp;
      }

      private static void Swap2(ref Point a, ref Point b) {
         var temp = a;
         a = b;
         b = temp;
      }
   }

   public class Dummy {
      public int x;
   }

   public struct Point {
      public int x;
      public int y;
   }

   public struct PointBox {
      public Point p;
   }
}

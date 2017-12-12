using System;
using System.Collections.Generic;

namespace Clipper {
   public class Program {
      private static List<IntPoint> MakeRectangle(int left, int top, int right, int bottom) {
         var contour = new List<IntPoint>();
         contour.Add(new IntPoint(left, top));
         contour.Add(new IntPoint(right, top));
         contour.Add(new IntPoint(right, bottom));
         contour.Add(new IntPoint(left, bottom));
         contour.Add(new IntPoint(left, top));
         return contour;
      }

      private static void Dump(int indent, PolyNode node) {
         string s = "";
         for (var i = 0; i < indent; i++) s += "  ";
         foreach (var p in node.Contour) {
            s += "(" + p.X + ", " + p.Y + ") ";
         }
         Console.WriteLine(s);
         foreach (var child in node.Childs) {
            Dump(indent + 1, child);
         }
      }

      static void Main(string[] args) {
         var a = MakeRectangle(0, 0, 10, 10);
         var b = MakeRectangle(5, 5, 15, 15);
         Console.WriteLine(Clipper.Area(a));
         Console.WriteLine(Clipper.Area(b));
         var clipper = new Clipper();
         clipper.AddPath(a, PolyType.ptClip, true);
         clipper.AddPath(b, PolyType.ptClip, true);

         PolyTree pt = new PolyTree();
         clipper.Execute(ClipType.ctUnion, pt, PolyFillType.pftPositive);

         Dump(0, pt);
      }
   }
}

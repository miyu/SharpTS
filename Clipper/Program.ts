import { Clipper, ClipType, IntPoint, PolyFillType, PolyNode, PolyTree, PolyType } from './Clipper';

/* SharpJS - Emitted on 12/12/2017 10:20:06 PM */
class OutRefParam<T> { 
   constructor (public read: () => T, public write: (val: T) => T) { }
}
function createOutRefParam<T>(read: () => T, write: (val: T) => T): OutRefParam<T> { return new OutRefParam<T>(read, write); }

interface IComparer<T> { Compare(a : T, b : T): number; }
class SharpJsHelpers { 
   static conditionalAccess(val, next) { 
      return val ? next(val) : val;
   }
   static valueClone(val) { 
      if (typeof val !== 'object') return val;
      if (val.zzz__sharpjs_clone) return val.zzz__sharpjs_clone();
      return val;
   }
   static arrayClear(arr) { 
      while(arr.length) arr.pop();
   }
   static TestTypeCheck(x, type) {
      if (type === 'object') return typeof(x) == 'object' || x instanceof Object || x == null;
      if (type === 'string') return typeof(x) == 'string' || x instanceof String;
      if (typeof(type) === 'string') return typeof(x) == type;
      if (typeof(type) === 'function') return x instanceof type;
      return false;
   }
   static readThenExec<T>(read: () => T, exec: (val: T) => void ): T {
      const res : T = read();
      exec(res);
      return res;
   }
   static booleanXor(x: boolean, y: boolean): boolean {
      return x != y && (x || y);
   }
   static setCapacity<T>(arr: Array<T>, capacity: number): number {
      if (arr.length > capacity) arr.length = capacity; // don't resize upward.
      return capacity;
   }
   static tryBinaryOperator<T, R>(a: T, b: T, op: string, fallback: (a: T, b: T) => R) {
      return (op in <any>a) ? (<any>a)[op](b) : fallback(a, b);
   }
}


export class Program {
   constructor(...args: any[]) {
   }
   
   private static MakeRectangle(left : number, top : number, right : number, bottom : number) : Array<IntPoint> {
      let contour : Array<IntPoint> = new Array<IntPoint>();
      contour.push(new IntPoint(left, top));
      contour.push(new IntPoint(right, top));
      contour.push(new IntPoint(right, bottom));
      contour.push(new IntPoint(left, bottom));
      contour.push(new IntPoint(left, top));
      return contour;
   }
   
   private static Dump(indent : number, node : PolyNode) : void {
      let s : string = "";
      for (let i : number = 0; i < indent; i++) s += "  ";
      for (let p of node.Contour) {
         s += "(" + p.X + ", " + p.Y + ") ";
      }
      console.log(s);
      for (let child of node.Childs) {
         Program.Dump(indent + 1, child);
      }
   }
   
   static Main(args : string[]) : void {
      let a : Array<IntPoint> = Program.MakeRectangle(0, 0, 10, 10);
      let b : Array<IntPoint> = Program.MakeRectangle(5, 5, 15, 15);
      console.log(Clipper.Area(a));
      console.log(Clipper.Area(b));
      let clipper : Clipper = new Clipper();
      clipper.AddPath(a, PolyType.ptClip, true);
      clipper.AddPath(b, PolyType.ptClip, true);
      let pt : PolyTree = new PolyTree();
      clipper.Execute(ClipType.ctUnion, pt, PolyFillType.pftPositive);
      Program.Dump(0, pt);
   }
   
}

eval("if (!module.parent) Program.Main(process.argv.slice(1))");

/* SharpJS - Emitted on 12/14/2017 3:14:06 AM */
export class OutRefParam<T> { 
   constructor (public read: () => T, public write: (val: T) => T) { }
}
export function createOutRefParam<T>(read: () => T, write: (val: T) => T): OutRefParam<T> { return new OutRefParam<T>(read, write); }

interface IComparer<T> { Compare(a : T, b : T): number; }
class SharpJsHelpers { 
   static conditionalAccess<T, R>(val: T, next : (x: T) => R) : R | null { 
      return val ? next(val) : null;
   }
   static valueClone<T>(val: T): T { 
      if (!val || typeof val !== 'object') return val;
      if ((<any>val).zzz__sharpjs_clone) return (<any>val).zzz__sharpjs_clone();
      return val;
   }
   static arrayClear<T>(arr: Array<T>): void { 
      while(arr.length) arr.pop();
   }
   static TestTypeCheck<T>(x: T, type: string | Function) {
      if (type === 'object') return typeof(x) == 'object' || <any>x instanceof Object || <any>x == null;
      if (type === 'string') return typeof(x) == 'string' || <any>x instanceof String;
      if (typeof(type) === 'string') return typeof(x) == type;
      if (typeof(type) === 'function') return <any>x instanceof type;
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


export class OutRefDemo {
   constructor(...args: any[]) {
   }
   
   public static Test() : void {
      {
         let x : number = 0;
         console.log(OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); })));
         console.log(x);
      }
      {
         let x : Dummy = null;
         console.log(OutRefDemo.Helper2(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); })));
         console.log(x);
      }
      {
         let x : number = 10, y : number = 20;
         console.log(x + " " + y);
         OutRefDemo.Swap1(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(y); }, (__value) => { y = __value; return SharpJsHelpers.valueClone(__value); }));
         console.log(x + " " + y);
         console.log(OutRefDemo.Helper3(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); })));
         console.log(x);
         console.log(OutRefDemo.Helper4(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); })));
         console.log(x);
         console.log(OutRefDemo.Helper5(createOutRefParam(() => { return SharpJsHelpers.valueClone(x); }, (__value) => { x = __value; return SharpJsHelpers.valueClone(__value); })));
         console.log(x);
      }
      {
         let a : Point = new Point();
         a.x = SharpJsHelpers.valueClone(10);
         a.y = SharpJsHelpers.valueClone(20);
         let b : Point = new Point();
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(b.x); }, (__value) => { b.x = __value; return SharpJsHelpers.valueClone(__value); }));
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(b.y); }, (__value) => { b.y = __value; return SharpJsHelpers.valueClone(__value); }));
         OutRefDemo.Helper5(createOutRefParam(() => { return SharpJsHelpers.valueClone(b.y); }, (__value) => { b.y = __value; return SharpJsHelpers.valueClone(__value); }));
         console.log(a.x + " " + a.y + " " + b.x + " " + b.y);
         OutRefDemo.Swap2(createOutRefParam(() => { return SharpJsHelpers.valueClone(a); }, (__value) => { a = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(b); }, (__value) => { b = __value; return SharpJsHelpers.valueClone(__value); }));
         console.log(a.x + " " + a.y + " " + b.x + " " + b.y);
         let pba : PointBox = new PointBox();
         pba.p = SharpJsHelpers.valueClone(a);
         let pbb : PointBox = new PointBox();
         pbb.p = SharpJsHelpers.valueClone(b);
         console.log(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);
         OutRefDemo.Swap2(createOutRefParam(() => { return SharpJsHelpers.valueClone(pba.p); }, (__value) => { pba.p = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(pbb.p); }, (__value) => { pbb.p = __value; return SharpJsHelpers.valueClone(__value); }));
         console.log(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(pba.p.x); }, (__value) => { pba.p.x = __value; return SharpJsHelpers.valueClone(__value); }));
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(pba.p.y); }, (__value) => { pba.p.y = __value; return SharpJsHelpers.valueClone(__value); }));
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(pbb.p.x); }, (__value) => { pbb.p.x = __value; return SharpJsHelpers.valueClone(__value); }));
         OutRefDemo.Helper1(createOutRefParam(() => { return SharpJsHelpers.valueClone(pbb.p.y); }, (__value) => { pbb.p.y = __value; return SharpJsHelpers.valueClone(__value); }));
         console.log(pba.p.x + " " + pba.p.y + " " + pbb.p.x + " " + pbb.p.y);
         console.log(a.x + " " + a.y + " " + b.x + " " + b.y);
      }
   }
   
   private static Helper1(x : OutRefParam<number>) : number { return x.write(SharpJsHelpers.valueClone(10)); }
   
   private static Helper2(x : OutRefParam<Dummy>) : Dummy { return x.write(new Dummy()); }
   
   private static Helper3(x : OutRefParam<number>) : number { return SharpJsHelpers.readThenExec(() => x.read(), val => x.write(val + 1)); }
   
   private static Helper4(x : OutRefParam<number>) : number { return x.write(x.read() - 1); }
   
   private static Helper5(x : OutRefParam<number>) : number { return x.write(x.read() / SharpJsHelpers.valueClone(2)); }
   
   private static Swap1(x : OutRefParam<number>, y : OutRefParam<number>) : void {
      let temp : number = x.read();
      x.write(SharpJsHelpers.valueClone(y.read()));
      y.write(SharpJsHelpers.valueClone(temp));
   }
   
   private static Swap2(a : OutRefParam<Point>, b : OutRefParam<Point>) : void {
      let temp : Point = a.read();
      a.write(SharpJsHelpers.valueClone(b.read()));
      b.write(SharpJsHelpers.valueClone(temp));
   }
   
}

export class Dummy {
   public x : number = 0;
   
   constructor(...args: any[]) {
   }
   
}

export class Point {
   public x : number = 0;
   public y : number = 0;
   
   constructor_SharpJs_Overload_0() { }
   
   constructor();
   constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public zzz__sharpjs_clone() : Point {
      let res = new Point();
      res.x = SharpJsHelpers.valueClone(this.x);
      res.y = SharpJsHelpers.valueClone(this.y);
      return res;
   }
   public static default() : Point {
      return new Point();
   }
}

export class PointBox {
   public p : Point = Point.default();
   
   constructor_SharpJs_Overload_0() { }
   
   constructor();
   constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public zzz__sharpjs_clone() : PointBox {
      let res = new PointBox();
      res.p = SharpJsHelpers.valueClone(this.p);
      return res;
   }
   public static default() : PointBox {
      return new PointBox();
   }
}


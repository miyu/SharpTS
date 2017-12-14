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


export class OverloadingDemo {
   constructor(...args: any[]) {
   }
   
   public static Test() : void {
      for (let i : number = 0; i < 10; i++) {
         OverloadingDemo.Print(OverloadingDemo.Identity("Fact " + i));
         OverloadingDemo.Print(OverloadingDemo.Identity(OverloadingDemo.Factorial(i)));
         OverloadingDemo.Print();
         OverloadingDemo.Identity();
      }
      OverloadingDemo.Print(new DummyClassA());
      OverloadingDemo.Print(new DummyClassB());
      OverloadingDemo.Print(<{}>null);
      OverloadingDemo.Print(new Array<number>(2));
      OverloadingDemo.Print(new Array<string>(2));
   }
   
   public static Identity_SharpJs_Overload_0() : void { }
   
   public static Identity_SharpJs_Overload_1(n : number) : number { return n; }
   
   public static Identity_SharpJs_Overload_2(s : string) : string { return s; }
   
   public static Identity() : void;
   public static Identity(n : number) : number;
   public static Identity(s : string) : string;
   public static Identity(...args: any[]): void | number | string {
      if (args.length == 0) return OverloadingDemo.Identity_SharpJs_Overload_0();
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) return OverloadingDemo.Identity_SharpJs_Overload_1(<number>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'string')) return OverloadingDemo.Identity_SharpJs_Overload_2(<string>args[0]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public static Print_SharpJs_Overload_0() : void { console.log(); }
   
   public static Print_SharpJs_Overload_1(n : number) : void { console.log(n); }
   
   public static Print_SharpJs_Overload_2(s : string) : void { console.log(s); }
   
   public static Print_SharpJs_Overload_3(x : DummyClassA) : void { console.log("DummyClass"); }
   
   public static Print_SharpJs_Overload_4(arr : number[]) : void { console.log("int[]: " + arr.length); }
   
   public static Print_SharpJs_Overload_5(arr : string[]) : void { console.log("string[]: " + arr.length); }
   
   public static Print_SharpJs_Overload_6(x : {}) : void { console.log("Object: " + x); }
   
   public static Print() : void;
   public static Print(n : number) : void;
   public static Print(s : string) : void;
   public static Print(x : DummyClassA) : void;
   public static Print(arr : number[]) : void;
   public static Print(arr : string[]) : void;
   public static Print(x : {}) : void;
   public static Print(...args: any[]): void | void | void | void | void | void | void {
      if (args.length == 0) return OverloadingDemo.Print_SharpJs_Overload_0();
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) return OverloadingDemo.Print_SharpJs_Overload_1(<number>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'string')) return OverloadingDemo.Print_SharpJs_Overload_2(<string>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], DummyClassA)) return OverloadingDemo.Print_SharpJs_Overload_3(<DummyClassA>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], Array)) return OverloadingDemo.Print_SharpJs_Overload_4(<number[]>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], Array)) return OverloadingDemo.Print_SharpJs_Overload_5(<string[]>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'object')) return OverloadingDemo.Print_SharpJs_Overload_6(<{}>args[0]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public static Factorial_SharpJs_Overload_0(n : number) : number { return OverloadingDemo.Factorial(n, 1); }
   
   public static Factorial_SharpJs_Overload_1(n : number, acc : number) : number { return n === 0 ? acc : OverloadingDemo.Factorial(n - 1, acc * n); }
   
   public static Factorial(n : number) : number;
   public static Factorial(n : number, acc : number) : number;
   public static Factorial(...args: any[]): number | number {
      if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) return OverloadingDemo.Factorial_SharpJs_Overload_0(<number>args[0]);
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) return OverloadingDemo.Factorial_SharpJs_Overload_1(<number>args[0], <number>args[1]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
}

export class DummyClassA {
   constructor(...args: any[]) {
   }
   
}

export class DummyClassB {
   constructor(...args: any[]) {
   }
   
}


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


export class ArrayDemo {
   private static readonly N : number = 10;
   
   constructor(...args: any[]) {
   }
   
   public static Test() : void {
      let x : number[] = new Array<number>(ArrayDemo.N + 1);
      for (let i : number = 0; i < ArrayDemo.N && i < 1337; i++) {
         x[i] = SharpJsHelpers.valueClone(i);
      }
      for (let i : number = 0; i < x.length; i++) {
         console.log(x[i]);
      }
      for (let v of x) {
         console.log(v);
      }
   }
   
}


import { LinkedListDemo } from './LinkedListDemo';
import { ArrayDemo } from './ArrayDemo';
import { OverloadingDemo } from './OverloadingDemo';
import { PolymorphismDemo } from './PolymorphismDemo';
import { OutRefDemo } from './OutRefDemo';

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


export class Program {
   constructor(...args: any[]) {
   }
   
   static Main(args : string[]) : void {
      Program.Section("Linked Lists");
      LinkedListDemo.Test();
      Program.Section("Arrays");
      ArrayDemo.Test();
      Program.Section("Overloading");
      OverloadingDemo.Test();
      Program.Section("Polymorphism");
      PolymorphismDemo.Test();
      Program.Section("Out/Ref");
      OutRefDemo.Test();
   }
   
   static Section(s : string) : void {
      console.log(s);
      console.log();
   }
   
}

eval("if (!module.parent && typeof(process) !== 'undefined' && typeof(process.argv) !== 'undefined') Program.Main(process.argv.slice(1))");

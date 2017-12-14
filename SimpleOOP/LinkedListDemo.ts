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


export class LinkedListDemo {
   constructor(...args: any[]) {
   }
   
   public static Test() : void {
      let ll : LinkedList = new LinkedList();
      for (let i : number = 0; i < 10; i++) {
         ll.Append(i);
      }
      ll.Prepend(1337);
      ll.Dump();
      console.log("--");
      ll.ClearAndPrintProductExcludingFirstTwoAndSelfCalls();
      console.log("--");
      ll.Dump();
   }
   
}

export class LinkedList {
   private front : LinkedListNode = null;
   
   constructor(...args: any[]) {
   }
   
   public Prepend(val : number) : void { this.front = new LinkedListNode(val, this.front); }
   
   public Append(val : number) : void {
      let node : LinkedListNode = new LinkedListNode();
      node.Value = SharpJsHelpers.valueClone(val);
      if (this.front === null) {
         this.front = node;
         return;
      }
      let current : LinkedListNode = this.front;
      while (current.Next !== null) current = current.Next;
      current.Next = node;
   }
   
   public Dump() : void {
      let current : LinkedListNode = this.front;
      while (current !== null) {
         console.log(current.Value);
         current = current.Next;
      }
   }
   
   public ClearAndPrintProductExcludingFirstTwoAndSelfCalls() : void {
      let product : number = 1;
      for (this.front = this.front.Next, this.front = SharpJsHelpers.conditionalAccess(this.front, sharpJsTemp => sharpJsTemp.Next); this.front !== null; this.front = this.front.Next) {
         product *= SharpJsHelpers.valueClone(this.front.Value);
      }
      console.log(product);
      this.SelfCall();
      this.SelfCall();
      (<LinkedList>this).SelfCall();
   }
   
   public SelfCall() : void {
      console.log("Self Call");
   }
   
}

export class LinkedListNode {
   private value : number = 0;
   
   public constructor_SharpJs_Overload_0() { }
   
   public constructor_SharpJs_Overload_1(value : number, next : LinkedListNode) {
      this.Value = SharpJsHelpers.valueClone(value);
      this.Next = next;
   }
   
   public constructor();
   public constructor(value : number, next : LinkedListNode);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], LinkedListNode)) { this.constructor_SharpJs_Overload_1(<number>args[0], <LinkedListNode>args[1]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   get Value(): number {
      return this.value;
   }
   set Value(value: number) {
      this.value = SharpJsHelpers.valueClone(value);
   }
   private m_Next : LinkedListNode = null;
   get Next(): LinkedListNode { return this.m_Next; }
   set Next(value: LinkedListNode) { this.m_Next = SharpJsHelpers.valueClone(value); }
}


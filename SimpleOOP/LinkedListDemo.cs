using System;

namespace SimpleOOP {
   public static class LinkedListDemo {
      public static void Test() {
         var ll = new LinkedList();
         for (var i = 0; i < 10; i++) {
            ll.Append(i);
         }
         ll.Prepend(1337);
         ll.Dump();
         Console.WriteLine("--");
         ll.ClearAndPrintProductExcludingFirstTwoAndSelfCalls();
         Console.WriteLine("--");
         ll.Dump();
      }
   }

   public class LinkedList {
      private LinkedListNode front;

      public void Prepend(int val) => front = new LinkedListNode(val, front);

      public void Append(int val) {
         var node = new LinkedListNode();
         node.Value = val;
         if (front == null) {
            front = node;
            return;
         }
         var current = front;
         while (current.Next != null) current = current.Next;
         current.Next = node;
      }

      public void Dump() {
         var current = front;
         while (current != null) {
            Console.WriteLine(current.Value);
            current = current.Next;
         }
      }

      // Real dumb, but tests for loops with a mix of initializers and declarations
      public void ClearAndPrintProductExcludingFirstTwoAndSelfCalls() {
         int product = 1;
         for (front = front.Next, front = front?.Next; front != null; front = front.Next) {
            product *= front.Value;
         }
         Console.WriteLine(product);
         SelfCall();
         this.SelfCall();
         ((LinkedList)this).SelfCall();
      }

      public void SelfCall() {
         Console.WriteLine("Self Call");
      }
   }

   public class LinkedListNode {
      private int value;

      public int Value { get { return value; } set { this.value = value; } }
      public LinkedListNode Next { get; set; }

      public LinkedListNode() { }

      public LinkedListNode(int value, LinkedListNode next) {
         this.Value = value;
         this.Next = next;
      }
   }
}

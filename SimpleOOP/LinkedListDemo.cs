using System;

namespace SimpleOOP {
   public static class LinkedListDemo {
      public static void Test() {
         var ll = new LinkedList();
         for (var i = 0; i < 10; i++) {
            ll.Append(i);
         }
         ll.Dump();
         Console.WriteLine("--");
         ll.ClearAndPrintProductExcludingFirstTwo();
         Console.WriteLine("--");
         ll.Dump();
      }
   }

   public class LinkedList {
      private LinkedListNode front;

      public void Prepend(int val) {
         var node = new LinkedListNode();
         node.value = val;
         node.next = front;
         front = node;
      }

      public void Append(int val) {
         var node = new LinkedListNode();
         node.value = val;
         if (front == null) {
            front = node;
            return;
         }
         var current = front;
         while (current.next != null) current = current.next;
         current.next = node;
      }

      public void Dump() {
         var current = front;
         while (current != null) {
            Console.WriteLine(current.value);
            current = current.next;
         }
      }

      // Real dumb, but tests for loops with a mix of initializers and declarations
      public void ClearAndPrintProductExcludingFirstTwo() {
         int product = 1;
         for (front = front.next, front = front?.next; front != null; front = front.next) {
            product *= front.value;
         }
         Console.WriteLine(product);
      }
   }

   public class LinkedListNode {
      public int value;
      public LinkedListNode next;
   }
}

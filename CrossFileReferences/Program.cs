namespace CrossFileReferences {
   public static class Program {
      public static int Main(string[] args) {
         return InFileHelper.HelperA();
      }
   }
   public static class InFileHelper {
      public static int HelperA() {
         return OutOfFileHelper.HelperB();
      }
   }
}

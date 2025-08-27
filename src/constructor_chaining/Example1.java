package constructor_chaining;
class Hotal{
    Hotal(int a){
        System.out.println("MC Don");
    }
    Hotal(double b){
        this(8);
        System.out.println("Dominos");
    }
    Hotal(String str){
        this(8.8);
        System.out.println("KFC");
    }
   void hey(){

    }
}
public class Example1 {
    public static void main(String[] args) {
        Hotal ref = new Hotal("hey");

    }
}

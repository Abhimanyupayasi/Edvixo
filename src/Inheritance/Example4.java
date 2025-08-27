package Inheritance;
class Wa1{
    void message(){
        System.out.println("messanging");
    }
}
class Wa2 extends Wa1{
    void status(){
        System.out.println("messanging");
    }
}
class Wa3 extends Wa2{
    void call(){
        System.out.println("call feature");
    }
}
public class Example4 {
    public static void main(String[] args) {

        Wa3 ref = new Wa3();
        ref.call();
        ref.status();
        ref.message();
    }
}

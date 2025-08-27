package methodOverloading;
class Demo{
    void play(int a){
        System.out.println("play int");
    }
    void play(double d){
        System.out.println("play double");
    }
    void play(String str){
        System.out.println("play string");
    }
}
public class Example1 {
    public static void main(String[] args) {
        Demo d = new Demo();
        d.play(9);
        d.play(9.8);
        d.play("hey");
    }
}

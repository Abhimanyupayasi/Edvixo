package abstraction;
abstract class Demo{
    abstract void disp();
    abstract void play();
}
class Sample extends Demo{
    @Override
    void disp() {
        System.out.println("disp");
    }

    @Override
    void play() {
        System.out.println("play");
    }
}
public class Example1 {
    public static void main(String[] args) {
        Demo ref = new Sample();
        ref.disp();
        ref.play();
    }
}

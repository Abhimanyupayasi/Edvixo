package abstraction;
abstract class Alpha {
    void print(){
        System.out.println("print");
    }
    abstract void play();
}
class  Beta extends Alpha{
    @Override
    void play() {
        System.out.println("play");
    }
}
public class Example2 {
    public static void main(String[] args) {
        Alpha ref = new Beta();
        ref.play();
        ref.print();

    }
}

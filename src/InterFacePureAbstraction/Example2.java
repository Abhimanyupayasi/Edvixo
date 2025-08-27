package InterFacePureAbstraction;
interface Delta{
    void play();
    void test();
}
class Exmaple implements Delta{
    @Override
    public void play() {
        System.out.println("ex play");
    }
    @Override
    public void test(){
        System.out.println("test");
    }
}
public class Example2 {
    public static void main(String[] args) {
        Delta ref = new Exmaple();
        ref.play();
        ref.test();
    }
}

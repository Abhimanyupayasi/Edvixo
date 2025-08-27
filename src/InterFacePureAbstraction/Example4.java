package InterFacePureAbstraction;
class Alpha{
    void play(){
        System.out.println("play");
    }
}
interface Beta{
    void start();
}
class Gamma extends Alpha implements Beta{
    @Override
    public void start() {
        System.out.println("start");
    }
}
public class Example4 {
    public static void main(String[] args) {
        Gamma ref = new Gamma();
        ref.start();
        ref.play();
    }
}

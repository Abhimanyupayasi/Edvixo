package abstraction;
abstract class Delta{
    void start(){
        System.out.println("start");
    }
    void end(){
        System.out.println("end");
    }
}
class Example extends Delta{

}
public class Example3 {
    public static void main(String[] args) {
        Delta ref = new Example();
        ref.end();
        ref.start();
    }
}

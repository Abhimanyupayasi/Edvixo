package methodOverriding;
class Demo{
    void test(){
        System.out.println("Manual testing");
    }
}
class Sample extends Demo{
    @Override
    void test(){
        System.out.println("Automation testing");
    }
}
public class Example3 {
    public static void main(String[] args) {
        Demo ref =new Demo();
        Sample obj = new  Sample();
        ref.test();
        obj.test();
    }
}

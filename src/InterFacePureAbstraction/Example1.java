package InterFacePureAbstraction;

interface Demo {
    void  test();
}
class Sample implements Demo{
    public void test(){
        System.out.println("excecuting test");
    }
}

public class Example1 {
    public static void main(String[] args) {
        Demo ref = new Sample();
        ref.test();
    }
}

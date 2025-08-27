package downcasting;
class A{
    void test(){

    }
}
class B extends A{
    void disp(){

    }
}
class C extends B{
    void play(){

    }
}
public class Example3 {
    public static void main(String[] args) {
        A a1 = new C();
        a1.test();
        B b1 = (B) a1;
        b1.disp();
        b1.test();

    }
}

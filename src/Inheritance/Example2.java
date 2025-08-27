package Inheritance;
class Alpha{
    void disp(){
        System.out.println("heyyy disp");
    }
}
class Beta extends  Alpha{
    void test(){
        System.out.println("heyyy test");
    }
}
public class Example2 {
    public static void main(String[] args) {
        Beta b = new Beta();
        b.test();
        b.disp();
        Alpha a = new Alpha();
        a.disp();
       // a.test();// it will throw error bcz we cant access the properties of child class via parent class
    }
}

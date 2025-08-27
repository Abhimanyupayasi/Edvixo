package Widening;
class Demo{
    void  test(float f){
        System.out.println(f);
    }
}
public class Example2 {
    public static void main(String[] args) {
        Demo ref = new Demo();
        ref.test(10);
        ref.test(101f);// auto widening : int ---> float
        ref.test('A');// auto widening : char ----> float
    }
}

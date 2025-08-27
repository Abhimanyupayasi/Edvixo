package Inheritance;
class Demo{
    int val = 100;
    void print(){
        System.out.println("executing print");
    }
}
class Sample extends Demo{

}
public class Example1 {
    public static void main(String[] args) {
        Sample ref = new Sample();
        System.out.println(ref.val);
        ref.print();
    }
}

package downcasting;
class Demo{

}
class Sample extends Demo{

}
public class Example1 {
    public static void main(String[] args) {
        Demo ref = new Sample(); //upcasting sample - demo
        Sample obj = (Sample) ref; // downcasting demp - sample
        System.out.println(ref);
        System.out.println(obj);

    }
}

package upcasting;
class Delta{
    int num = 100;
}
class Example extends Delta{
    int val = 200;
}
public class Example2 {
    public static void main(String[] args) {
        Delta ref = new Example();
        System.out.println(ref.num);
        //System.out.println(ref.val);
        //we can't access the properties of sub class by parent class reference variable;
    }
}

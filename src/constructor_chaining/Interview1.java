package constructor_chaining;
class Parent{
    Parent(){
        System.out.println("parent constructor");
    }
}
class Child extends Parent{

}
public class Interview1 {
    public static void main(String[] args) {
        Child ref = new Child();

    }
}

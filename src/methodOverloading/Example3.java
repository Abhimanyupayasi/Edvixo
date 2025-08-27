package methodOverloading;
class Courses{
    void display(int a , boolean b){
        System.out.println("Java full stack");
    }
    void display(boolean b, int a){
        System.out.println("MERN Stack");
    }
}
public class Example3 {
    public static void main(String[] args) {
        Courses c = new Courses();
        c.display(7, true);
        c.display(true, 7);
    }
}

package methodOverriding;
class Windows10{
    void startMenu(){
        System.out.println("List View");
    }
}
class Windows11 extends Windows10{
    @Override
    void startMenu(){
        System.out.println("Box views");
    }
}
public class Example6 {
    public static void main(String[] args) {
        Windows10 w = new Windows10();
        w.startMenu();
        Windows11 w1 = new Windows11();
        w1.startMenu();
    }
}

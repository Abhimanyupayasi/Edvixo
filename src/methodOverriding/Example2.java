package methodOverriding;
class Father{
    void moterCycle(){
        System.out.println("Normal");
    }
}
class Son extends Father{
    @Override
    void moterCycle(){
        System.out.println("Modified");
    }

}
public class Example2
{
    public static void main(String[] args) {
        Father f = new Father();
        f.moterCycle();
        Son s = new Son();
        s.moterCycle();
        Father f2 = new Son();
        f2.moterCycle();
    }
}

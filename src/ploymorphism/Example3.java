package ploymorphism;
class BrowserLauncher{
    void open(int a){
        System.out.println("chrome");
    }
    void open(double a){
        System.out.println("safari");
    }void open(String a){
        System.out.println("brave");
    }

}
public class Example3 {
    public static void main(String[] args) {
        BrowserLauncher ref = new BrowserLauncher();
        ref.open(5);
        ref.open(5.6);
        ref.open("das");
    }
}

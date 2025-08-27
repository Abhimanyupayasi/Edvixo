package methodOverloading;
class Food{
    void eat(int a){
        System.out.println("paratha");
    }
    void eat(int a, int b){
        System.out.println("meals");
    }
    void eat(int a, int b, int c){
        System.out.println("Biryani");
    }

}
public class Example2 {
    public static void main(String[] args) {
        Food f = new Food();
        f.eat(5);
        f.eat(8,5);
        f.eat(9,8,9);
    }
}

package upcastingExample;

import java.sql.Ref;

public class Mainclass1 {
    public static void main(String[] args) {
        Television tv = new Television();
        Flipcart.addToCart(tv);
        System.out.println("--------------------------------");
        Mobile mob = new Mobile();
        Flipcart.addToCart(mob);
        System.out.println("-----------------------------------");
        Refrigerator ref = new Refrigerator();
        Flipcart.addToCart(ref);

    }
}

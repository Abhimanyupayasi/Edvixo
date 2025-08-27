package methodOverloading;

import downcastingExample.Flipcart;

class FlipCart{
    void paymemt(){
        System.out.println("COD");
    }
    void payment(long card){
        System.out.println("CARD");
    }
    void payment(String s){
        System.out.println("UPI");
    }
}
public class Example4 {
    public static void main(String[] args) {
        FlipCart f = new FlipCart();
        f.paymemt();
        f.payment(533565466);
       f.payment("hey");
    }
}

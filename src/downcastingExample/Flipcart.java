package downcastingExample;

public class Flipcart {
    static void delevery(Product p){
        if(p!=null){
            if(p instanceof Mobile){
                System.out.println("2 wheeler ");
            }
            else if(p instanceof Refrigarator){
                System.out.println("delivered in 4 wheeler");
            }
            else if(p instanceof Television){
                System.out.println(" 3 wheeler");
            }
        }
    }
}

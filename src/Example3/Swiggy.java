package Example3;

import java.util.Scanner;

public class Swiggy {
    static void PrintBiryani(Biryani b){
        if(b != null){
            System.out.println("Biryani qty is : "+b.qty);
            System.out.println("Biryani price is : "+b.price);
        }
    }
    static Biryani createBiryani(){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter biryani qty : ");
        int qty = sc.nextInt();
        System.out.println("Enter biryani price : ");
        double price = sc.nextDouble();
        Biryani b = new Biryani(qty, price);
        return b;
    }
}

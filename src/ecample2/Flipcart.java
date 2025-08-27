package ecample2;

import java.util.Scanner;

public class Flipcart {
    static void displayProductDetails(Product p){
        System.out.println("product id is : "+p.pid);
        System.out.println("Product price is : "+p.price);
    }
    static Product createProduct(){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter Product id : ");
        int pid = sc.nextInt();
        System.out.println("Enter Product Price : ");
        double price = sc.nextDouble();
        Product p = new Product(pid, price);
        return  p;
    }
}

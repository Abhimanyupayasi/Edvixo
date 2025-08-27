package ploymorphism;
class Flipkart{
    void pay(){
        System.out.println("COD");
    }
    void pay(long card){
        System.out.println("card");
    }
    void pay(String upi){
        System.out.println("UPI");
    }

}
    public class Example1 {
    public static void main(String[] args) {
        Flipkart ref = new Flipkart();
        ref.pay();
        ref.pay(5646112L);
        ref.pay("abhi@dev");
    }
}

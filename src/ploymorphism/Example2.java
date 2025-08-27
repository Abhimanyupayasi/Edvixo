package ploymorphism;
class  IRCTC{
    void search(int trainnum){
        System.out.println("Train number Search");
    }
    void search(String a, String b){
        System.out.println("a to b");
    }
    void  search(Long pnr){
        System.out.println("PNR");
    }
}
public class Example2 {
    public static void main(String[] args) {
        IRCTC ref = new IRCTC();
        ref.search(8546L);
        ref.search(5454);
        ref.search("a","v");
    }
}

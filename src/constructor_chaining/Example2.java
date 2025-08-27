package constructor_chaining;
class City{
    City(){
        this(1);
        System.out.println("BNG");

    }
    City(int a){
        this(10,39);
        System.out.println("MUMBAI");
    }
    City(int a, int b){
        System.out.println("DELHI");
    }
}
public class Example2 {
    public static void main(String[] args) {
        City c = new City();

    }
}

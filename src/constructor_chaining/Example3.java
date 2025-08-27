package constructor_chaining;
class Amazon{
    Amazon(){
        System.out.println("Iitialize ac");
    }
    Amazon(double sub){
        this();
        System.out.println("Prime video");
        System.out.println("song prime");

    }
}
public class Example3 {
    public static void main(String[] args) {
        Amazon amzn = new Amazon(8.5);
        System.out.println("----------------------");
        Amazon amzH= new Amazon();

    }

}

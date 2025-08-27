package Inheritance;
class AdobeFree{
    void read() {
        System.out.println("read");
    }
}
class AdobePaid extends AdobeFree{
    void edit(){
        System.out.println("edit the pdf");
    }
}
public class Example5 {
    public static void main(String[] args) {
        AdobePaid ref = new AdobePaid();
        ref.edit();
        ref.read();
    }
}

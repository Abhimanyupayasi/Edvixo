package methodOverriding;
class Whatsapp{
    void readReceipt(){
        System.out.println("sent");
    }
}
class Whatsapp1 extends Whatsapp{
    @Override
    void readReceipt(){
        System.out.println("sent - del");
    }
}
class Whatsapp2 extends Whatsapp1{
    @Override
    void readReceipt(){
        System.out.println("sent - del - seen");
    }
}
public class Example5 {
    public static void main(String[] args) {
        Whatsapp w1 = new Whatsapp();
        w1.readReceipt();
        Whatsapp1 w2 = new Whatsapp1();
        w2.readReceipt();
        Whatsapp2 w3 = new Whatsapp2();
        w3.readReceipt();
    }
}

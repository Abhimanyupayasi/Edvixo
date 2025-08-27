package methodOverloading;
class FingerPrint{

}
class Phone{
    void unlock(){
        System.out.println("swip");
    }
    void unlock(int pin){
        System.out.println("pin");
    }void unlock(String str){
        System.out.println("string");
    }
    void unlock(FingerPrint fp){
        System.out.println("fp");
    }
}
public class Example7 {
    public static void main(String[] args) {
        Phone ph = new Phone();
        ph.unlock();
        ph.unlock(45);
        ph.unlock("guh");
        ph.unlock(new FingerPrint());
    }
}

package abstraction;

public class MainClass2 {
    public static void main(String[] args) {
        Samsung s = new Samsung();
        PhoneManager.details(s);
        Vivo v = new Vivo();
        PhoneManager.details(v);
        Oppo o = new Oppo();
        PhoneManager.details(o);
    }
}

package abstraction;

public class PhoneManager {
    static void details(Android a){
        if(a!=null){
            a.ui();
            a.services();
        }
    }
}

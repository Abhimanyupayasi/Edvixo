package abstraction;

public class ContetntManager {
    static void control(Hotstar hs){
        if(hs!=null){
            hs.login();
            hs.watch();
        }
    }
}

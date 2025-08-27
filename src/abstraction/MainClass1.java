package abstraction;

public class MainClass1 {
    public static void main(String[] args) {
        HotstarFree free = new HotstarFree();
        HotstarPremium pre = new HotstarPremium();
        HotstarVIP vip = new HotstarVIP();
        ContetntManager.control(free);
        ContetntManager.control(vip);
        ContetntManager.control(pre);
    }
}

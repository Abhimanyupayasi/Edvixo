package Example5;

public class MainClass5 {
    public static void main(String[] args) {
        Account a1 = Icici.createAccount();
        Account a2 = Icici.createAccount();
        Icici.PrintAccountDetails(a1);
        Icici.PrintAccountDetails(a2);
    }
}

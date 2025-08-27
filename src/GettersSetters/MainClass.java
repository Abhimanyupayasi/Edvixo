package GettersSetters;

public class MainClass {
    public static void main(String[] args) {
        Person p = new Person();
        p.setAge(21);
        System.out.println(p.getAge());
        Account ac = new Account();
        ac.setaccountNumber(5885584L);
        ac.setAccountBalance(845454);
        System.out.println(ac.getAccountBalance());
        System.out.println(ac.getAccountNumber());
    }
}

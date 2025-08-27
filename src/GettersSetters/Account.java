package GettersSetters;

public class Account {
    private long accountNumber;
    private double accountBalance;
    public void setaccountNumber(long accountNumber){
        this.accountNumber = accountNumber;
    }
    public void setAccountBalance(double accountBalance){
        this.accountBalance = accountBalance;
    }
    public long getAccountNumber(){
        return  accountNumber;
    }
    public double getAccountBalance(){
        return accountBalance;

    }

}

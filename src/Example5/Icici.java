package Example5;

import java.util.Scanner;

public class Icici {
    static void PrintAccountDetails(Account a){
        System.out.println("Eccount number is : "+a.accNum);
        System.out.println("Account Balance is : "+a.accBal);
    }
    static Account createAccount(){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter ac number : ");
        long acnum = sc.nextInt();
        double bal = sc.nextDouble();
        Account a = new Account(acnum, bal);
        return  a ;
    }
}

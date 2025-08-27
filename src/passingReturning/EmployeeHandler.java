package passingReturning;

import java.util.Scanner;

public class EmployeeHandler {
    static  void displayEmployeeDetails(Employee e){
        if(e!=null){
            System.out.println("eid : "+e.eid );
            System.out.println("ctc : "+  e.ctc);
        }
    }
    static Employee createEmployee(){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter Eid");
        int eid = sc.nextInt();
        double ctc = sc.nextDouble();
        Employee e = new Employee(eid, ctc);
        return e;
    }
}

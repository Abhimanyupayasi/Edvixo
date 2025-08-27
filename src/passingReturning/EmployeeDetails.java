package passingReturning;

public class EmployeeDetails {
    public static void main(String[] args) {
        Employee e1 = EmployeeHandler.createEmployee();
        EmployeeHandler.displayEmployeeDetails(e1);
        Employee e2 = EmployeeHandler.createEmployee();
        EmployeeHandler.displayEmployeeDetails(e2);
    }
}

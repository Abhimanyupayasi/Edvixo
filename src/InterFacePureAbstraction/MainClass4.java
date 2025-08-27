package InterFacePureAbstraction;

public class MainClass4 {
    public static void main(String[] args) {
        MySQLDriver md = new MySQLDriver();
        DriverService.RegisterDrive(md);
        OracleDriver od = new OracleDriver();
        DriverService.RegisterDrive(od);
    }
}

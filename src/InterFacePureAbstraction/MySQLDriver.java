package InterFacePureAbstraction;

public class MySQLDriver implements Driver{
    @Override
    public void register() {
        System.out.println("register for Mysql driver");
    }
}

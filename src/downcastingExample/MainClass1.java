package downcastingExample;

public class MainClass1 {
    public static void main(String[] args) {
        Tester test = new Tester();
        Manager.assignWork(test);
        System.out.println("--------------------------------------");
        Developer dev = new Developer();
        Manager.assignWork(dev);
    }
}

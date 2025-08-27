package InterFacePureAbstraction;

public class Bike implements Vehicle {
    @Override
    public void start() {
        System.out.println("bike start");
    }

    @Override
    public void stop() {
        System.out.println("bike stop");
    }
}

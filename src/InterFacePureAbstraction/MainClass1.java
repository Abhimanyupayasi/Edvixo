package InterFacePureAbstraction;

public class MainClass1 {
    public static void main(String[] args) {
        Bike b = new Bike();
        VehicleSimulater.simulator(b);
        Car c = new Car();
        VehicleSimulater.simulator(c);
    }
}

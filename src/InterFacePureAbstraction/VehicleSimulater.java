package InterFacePureAbstraction;

public class VehicleSimulater {
    static  void simulator( Vehicle v){
        if(v!=null){
            v.start();
            v.stop();
        }
    }
}

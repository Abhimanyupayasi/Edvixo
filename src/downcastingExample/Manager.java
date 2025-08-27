package downcastingExample;

public class Manager {
    static void assignWork(SoftwareEngineer sw){
        if (sw!=null){
            sw.meeting();
            if(sw instanceof Developer){
                Developer dev = (Developer) sw;
                dev.Coading();
            }
            else if(sw instanceof Tester){
                Tester test = (Tester) sw;
                test.testing();
            }
        }

    }
}

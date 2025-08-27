package downcastingExample;

public class SoftwareEngineer {
    void meeting(){
        System.out.println("meeting sw");
    }
}
class Developer extends SoftwareEngineer{
    void Coading(){
        System.out.println("codeing coder");
    }
}

class Tester extends SoftwareEngineer{
    void testing(){
        System.out.println("testing tester");
    }
}

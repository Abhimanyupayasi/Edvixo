package methodOverloading;

class FaceBook{
    void login(String ur, String  pass){
        System.out.println("logged in");
    }
    void login(long mob, String  pass){
        System.out.println("logged in");
    }
}
public class Example5 {
    public static void main(String[] args) {
        FaceBook fb = new FaceBook();
        fb.login(95562, "uvuj");
        fb.login("rdtguh", "yguh");
    }
}

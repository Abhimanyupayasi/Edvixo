package Inheritance;
class InstagramOld{
    void post(){
        System.out.println("Post Photo");
    }
}
class InstagarmNew extends  InstagramOld{
    void messenger(){
        System.out.println("messenger");
    }
}
class InstagramLatest extends InstagarmNew{
    void reel(){
        System.out.println("reel functionality");
    }
}
public class Example3 {
    public static void main(String[] args) {
        InstagramLatest ref = new InstagramLatest();
        ref.reel();
        ref.post();
        ref.messenger();
    }
}

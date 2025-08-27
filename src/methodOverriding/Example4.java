package methodOverriding;
class FacebookOld{
    void reaction(){
        System.out.println("LIKE");
    }
}
class FacebookNew extends FacebookOld{
    @Override
    void reaction(){
        System.out.println("LIKE , LOVE, HAHA, ANGRY");
    }
}
public class Example4 {
    public static void main(String[] args) {
        FacebookOld ref = new FacebookOld();
        FacebookNew obj = new FacebookNew();
        ref.reaction();
        obj.reaction();

    }
}

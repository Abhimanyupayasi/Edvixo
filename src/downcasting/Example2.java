package downcasting;
class Alpha{
    void test(){

    }
}
class Beta extends Alpha{
    void play(){

    }
}
public class Example2 {
    public static void main(String[] args) {
        Alpha obj = new Beta();
        obj.test();
        Beta ref = (Beta) obj;
        ref.play();
        ref.test();
        System.out.println(ref);
        System.out.println(obj);

    }
}

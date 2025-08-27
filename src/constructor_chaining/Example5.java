package constructor_chaining;
class Alpha{
    Alpha(){
        System.out.println("Alpha() is cons");
    }
    Alpha(int a){
        System.out.println("Alpha(a) is cons");
    }
}
class Beta extends Alpha{
    Beta(){
        super(10);
        System.out.println("Beta()...");
    }
}
public class Example5 {
    public static void main(String[] args) {
        Beta ref = new Beta();

    }
}

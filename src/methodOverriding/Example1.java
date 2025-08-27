package methodOverriding;
class  Parent{
    void watchTv(){
        System.out.println("News/Serial");
    }
}
class Child extends Parent{
    @Override
    void watchTv(){
        System.out.println("Sports/music");
    }
}

public class Example1 {
    public static void main(String[] args) {
        Parent obj = new Parent();
        obj.watchTv();
        Child ch = new Child();
        ch.watchTv();
        Parent ref = new Child(); //upcasting
        ref.watchTv();
    }
}

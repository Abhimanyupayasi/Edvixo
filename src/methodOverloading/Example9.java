package methodOverloading;
class Image{

}
class Video{

}
class FBPOST{
    void post(Image i){
        System.out.println("IMG");
    }
    void post(String str){
        System.out.println("TEXT");
    }
    void post(Video v){
        System.out.println("VIDEO");
    }
}
public class Example9 {
    public static void main(String[] args) {
        FBPOST f1 = new FBPOST();
        f1.post(new Image());
        f1.post("hey");
        f1.post(new Video());
    }
}

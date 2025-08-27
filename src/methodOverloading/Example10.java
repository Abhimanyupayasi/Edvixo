package methodOverloading;
class InstaStroy{
    void story(Image i){
        System.out.println("img");
    }
    void story(Video v){
        System.out.println("video");
    }
}
public class Example10 {
    public static void main(String[] args) {
        InstaStroy i = new InstaStroy();
        i.story(new Image());
        i.story(new Video());
    }
}

package InterFacePureAbstraction;
interface Loveable{
    void love();
}
interface Hateable{
    void hate();
}
class Person implements Loveable, Hateable{
    @Override
    public  void love(){
        System.out.println("loving");
    }

    @Override
    public void hate() {
        System.out.println("hating");
    }
}
public class MultipleInheritanceWithInterface {
    public static void main(String[] args) {
        Person p = new Person();
        p.hate();
        p.love();
    }
}

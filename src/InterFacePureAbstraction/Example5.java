package InterFacePureAbstraction;
interface Bravo{
    void push();
}
interface Halo extends Bravo{
    void pull();
}
class Exemple implements Halo{
    @Override
    public void push() {
        System.out.println("push");
    }

    @Override
    public void pull() {
        System.out.println("pull");
    }
}
public class Example5 {
    public static void main(String[] args) {
        Exemple ref = new Exemple();
        ref.pull();
        ref.push();
    }
}

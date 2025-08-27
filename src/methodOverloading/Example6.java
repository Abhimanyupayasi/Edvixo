package methodOverloading;
class IRCTC{
    void search(int tn){
        System.out.println("train number");
    }
    void search(long pnr){
        System.out.println("pnr number");
    }
    void search(String src, String dest){
        System.out.println("Dest");
    }
}
public class Example6 {
    public static void main(String[] args) {
        IRCTC i = new IRCTC();
        i.search(850);
        i.search(582652358l);
        i.search("gfgf","yg");

    }
}

package constructor_chaining;
class student2{
    student2(){
        System.out.println("personal details");
        System.out.println("acadmic details");

    }student2(boolean b){
        this();
        System.out.println("experince details");

    }
}
public class STUDENT {
    public static void main(String[] args) {
        student2 fresher=new student2();
        System.out.println("---------------------------------------");
        student2 exp=new student2(true);

    }



}

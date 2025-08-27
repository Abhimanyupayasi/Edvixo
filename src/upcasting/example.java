package upcasting;
class demo {
void help(){
    System.out.println("akshat");
}
}
class sample extends demo{
void send(){
    System.out.println("boss");
}
}
public class example {

    public static void main(String[] args) {
        sample ref=new sample();
        ref.help();
        ref.send();
        demo obj=ref;
        obj.help();
    }
}


















































































































































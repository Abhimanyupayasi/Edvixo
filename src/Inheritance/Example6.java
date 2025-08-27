package Inheritance;

import java.util.Date;

class Watch{
    void showTime(){
        System.out.println("time is : "+ new Date());
    }
}
class SmartWatch extends  Watch{
    void Notofication(){
        System.out.println("notofication");
    }
}
public class Example6 {
    public static void main(String[] args) {
        SmartWatch sw = new SmartWatch();
        sw.showTime();
        sw.Notofication();
    }
}

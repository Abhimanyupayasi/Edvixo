package constructor_chaining;

class Person{
    String name;
    int age;
    Person(){
        name ="abhi";
        age = 21;
    }
}
class Engineer extends Person{
    String degree ;
    Engineer(){
        degree = "B.Tech";
    }
}
public class Example6 {
    public static void main(String[] args) {
        Engineer er = new Engineer();
        System.out.println(er.age);
        System.out.println(er.degree);
        System.out.println(er.name);
    }
}

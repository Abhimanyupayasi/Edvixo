package Widening;

public class Example1 {
    public static void main(String[] args) {
        byte b = 127;
        short a = b;
        int c = a;
        char d = 'b';
        int e = d;
        long f = e;
        float g = f;
        double h = g;
        System.out.println(a+" "+b+" "+c+" "+d+" "+e+" "+f+" "+g+" "+h);

    }
}

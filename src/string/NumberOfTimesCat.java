package string;

public class NumberOfTimesCat {
    public static void main(String[] args) {
        String s ="cat";
        String str = "acat hcathj cat13cajkcaht";
        int c = 0;
        for (int i = 0; i < str.length()-2; i++) {
            char ch = str.charAt(i);
            char ch2 = str.charAt(i+1);
            char ch3 = str.charAt(i+2);
            if(ch=='c' && ch2=='a' && ch3=='t'){
                c++;
            }

        }
        System.out.println(c);


    }
}

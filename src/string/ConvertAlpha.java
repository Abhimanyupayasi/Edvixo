package string;

public class ConvertAlpha
{
    static String convert_str(String str){
        String s = "";
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if(ch<='Z' && ch>='A'){
                ch += 32;
                s = s+ch;
            } else if (ch<='z' && ch>='a') {
                ch -= 32;
                s = s+ch;
            }
            else {
                s= s+ch;
            }
        }
        return s;
    }
    public static void main(String[] args) {
        String s = "dLn hi@3aBCk $";
        String temp = "";
        String ans = "";
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            temp = temp+ch;
            if(ch<='z' && ch>='a'){
                ans = ans+temp.toUpperCase();
            }
            else if(ch<='Z' && ch>='A'){
                ans = ans + temp.toLowerCase();
            }
            else {
                ans = ans + temp;
            }
            temp = "";




        }
        System.out.println("String ans : "+ans);
        System.out.println("char ans : "+convert_str(s));

    }
}

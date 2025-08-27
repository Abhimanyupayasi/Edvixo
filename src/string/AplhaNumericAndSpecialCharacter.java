package string;

public class AplhaNumericAndSpecialCharacter {
    static String count(String str){
        int a = 0;
        int s = 0;
        int n = 0;
        for (int i = 0; i < str.length(); i++) {
            int ch = str.charAt(i);
            if((ch>=65 && ch<=90)||(ch>=97 && ch<=122)){
                a++;
            }
            else if(ch<=9 || ch>=0){
                n++;
            }
            else {
                s++;
            }
        }
        return ""+s+" "+a+" "+n;
    }
    public static void main(String[] args) {
        String str = "123&*#ABHI";
        int alpha = 0;
        int numeric = 0;
        int special = 0;

        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if((c>='A'&& c<='Z') || (c>='a'&& c<='z')){
                alpha++;
            } else if (c>='0' && c<='9') {
                numeric++;
            }
            else {
                special++;
            }

        }
        System.out.println(alpha +" "+numeric+" "+special);
        System.out.println(count(str));
    }
}

package string;

public class StringPalindrome {
    public static void main(String[] args) {
        String str1 = "malayalamd";
        String ans = "";
        for (int i = str1.length()-1; i>=0; i--) {
            char ch= str1.charAt(i);
            ans = ans+ch;
        }
        if(ans.equalsIgnoreCase(str1)){
            System.out.println("palindome");
        }
        else {
            System.out.println("not");
        }
    }
}

package string;

public class StringPalindrome2
{

    public static void main(String[] args) {
        String str = "malayalam";
        String rev = "";
        for (int i = 0; i < str.length(); i++) {
            rev =str.charAt(i)+rev;
        }
        System.out.println(rev);
        if(str.equals(rev)){
            System.out.println("palindrome");
        }
        else {
            System.out.println("not palindrome");
        }
    }
}

package string;

public class PalindromicString {
    static boolean isPalindrome(String s){
        String rev = "";
        for (int i = s.length()-1; i >=0; i--) {
            rev = rev+s.charAt(i);
        }
        return rev.equals(s);
    }
    public static void main(String[] args) {
        String str = "aabbajkjyuhuyhkj";
        for (int i = 0; i < str.length(); i++) {
            String temp = ""+str.charAt(i);
            for (int j = i+1; j <str.length() ; j++) {
                temp = temp+str.charAt(j);
                if(isPalindrome(temp)){
                    System.out.println(temp);
                }

            }
        }
    }
}

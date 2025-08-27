package LogicalQuetions;

public class SubstringPalindrome {
    static boolean isPalindorme(String str){
        String rev = "";
        for (int i = 0; i < str.length(); i++) {
            rev = str.charAt(i)+rev;
        }
        return str.equals(rev);
    }
    public static void main(String[] args) {
        String str = "aabbajkjyuhuyhkj";
        for (int i = 0; i < str.length(); i++) {
            String temp = ""+str.charAt(i);
            for (int j = i+1; j < str.length(); j++) {
                temp = temp+str.charAt(j);
                if(isPalindorme(temp)){
                    System.out.println(temp);
                }
            }


        }
    }
}

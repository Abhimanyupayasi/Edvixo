package string;

public class Problem8 {
    static boolean palindrome(String str){
        String rev = "";

        for (int i = 0; i < str.length(); i++) {
            rev = str.charAt(i)+rev;
        }
        if(rev.equals(str)) return  true;
        return false;
    }
    public static void main(String[] args) {
        String str = "aabbajkjyuhuyhkj";
        String arr[] = new String[str.length()];
        //aa abba bb jkj yuhuy uhu
        // min length 2
        for(int i = 0; i<str.length(); i++){
            String temp = "";

            for (int j = i; j < str.length(); j++) {
                temp = temp+str.charAt(j);
                for (int k = 0; k < arr.length; k++) {
                    if(arr[k]!=temp){
                        if(palindrome(temp) && temp.length()>1){
                            System.out.println(temp);
                            arr[i] = temp;
                            temp = "";
                        }
                    }
                }

                //temp = "";



            }

        }


    }
}

package string;

public class Problem7 {
    public static void main(String[] args) {
        String s = "hello hi bye how are you";
        String []arr = s.split(" ");

        String ans = "";
        for (int i = 0; i < arr.length; i++) {
            if(i%2==0){
                ans =  ans+" "+arr[i];
            }
            else{
                String temp = "";
                String temp2 = arr[i];
                for (int j = 0; j <temp2.length() ; j++) {
                    temp = temp2.charAt(j)+temp;
                }
                ans =  ans+" "+ temp ;
            }
        }
        System.out.println(ans);

    }
}

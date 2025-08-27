package LogicalQuetions;

public class WordReverse {
    public static void main(String[] args) {
        String s = "hello hi bye how are you";
        String ans = "";
        String [] arr = s.split(" ");
        for (int i = arr.length-1; i >=0 ; i--) {
            ans = ans+" "+arr[i];
        }
        System.out.println(ans);
    }
}

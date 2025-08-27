package string;

public class Problem6 {
    public static void main(String[] args) {
        String s = "hello hi bye how are you";
        String []arr = s.split(" ");
        String [] arr2 = new String[arr.length];
        for (int i = arr.length-1; i >= 0; i--) {
//            String temp = arr[i];
              arr2[i] = arr[i];
            System.out.print(arr[i]+" ");
        }

       String ans = "";
        for (int i = 0; i < arr2.length; i++) {
            ans = arr2[i]+" "+ans;

        }
        System.out.println(ans);

    }
}

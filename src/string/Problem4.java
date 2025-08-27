package string;

public class Problem4 {
    public static void main(String[] args) {
        int[] arr = new int[128];
        String str = "Apple Hello Hi";
        for(int i = 0; i<str.length(); i++){
            int index = str.charAt(i);
            arr[index]++;
        }
       for(int n :arr){
           if(n!=0){
               System.out.print((char) n + " ");
               System.out.println(n);
           }
       }
    }
}

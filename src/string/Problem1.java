package string;

public class Problem1 {
    public static void main(String[] args) {
        String [] arr = {"Zero","One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
        int n = 173201;
        String str = "";
        while (n!=0){
            int rem = n%10;
            String ans1 = arr[rem];
            str = ans1+str;
            n = n/10;

        }
        System.out.println(str);
    }
}

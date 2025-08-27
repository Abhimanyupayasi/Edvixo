package LogicalQuetions;

public class NumberToString {
    public static void main(String[] args) {
        int n = 173201;
        String res = "";
        String [] arr = {"Zero","One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
        while (n!=0){
            int temp = n%10;
            res = arr[temp]+res;
            n = n/10;
        }
        System.out.println(res);
    }
}

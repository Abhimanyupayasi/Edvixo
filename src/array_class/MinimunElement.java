package array_class;

public class MinimunElement {
    public static void main(String[] args) {
        int[] arr = {7,2,1,17,18,19};
        int small = Integer.MAX_VALUE;
        for (int i = 0; i < arr.length; i++) {
            if(small>arr[i]){
                small = arr[i];
            }
        }
        System.out.println("smallest value is : "+small);
    }
}

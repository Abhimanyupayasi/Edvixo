package array_class;

public class LargestElement {
    public static void main(String[] args) {
        int[] arr  = {2,7,18,16,17,8};
        int largest = Integer.MIN_VALUE;
        for(int i = 0; i< arr.length; i++){
            if(largest<arr[i]){
                largest = arr[i];
            }
        }
        System.out.println("largest element value is : "+largest);
    }
}

package string;

public class RotateArray2 {
    static void rotate(int [] arr){
        int temp = arr[arr.length-1];
        for (int i = arr.length-1; i >=1 ; i--) {
            arr[i] = arr[i-1];
        }
        arr[0] = temp;
    }
    public static void main(String[] args) {
        int [] arr = {7,2,1,4,5,6,8};
        int r = 3;
        for (int i = 1; i <= r; i++) {
            rotate(arr);
        }
        for(int el: arr){
            System.out.print(el+" ");
        }
    }
}

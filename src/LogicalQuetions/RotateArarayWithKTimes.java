package LogicalQuetions;

public class RotateArarayWithKTimes {
    static void RotateArray(int[] arr,int k){

            int temp = arr[arr.length-1];
            for (int i = arr.length-1; i > 0; i--) {
                arr[i] = arr[i-1];
            }
            arr[0] = temp;


    }
    public static void main(String[] args) {
        int [] arr = {7,2,1,4,5,6,8};
        int k = 3;
        for (int i = 0; i < 3; i++) {
            RotateArray(arr,1);
        }
        for(int el : arr){
            System.out.print(el+" ");
        }
    }
}

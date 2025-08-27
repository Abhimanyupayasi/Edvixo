package string;

public class RotateArray {
    public static void main(String[] args) {
        int [] arr = {7,2,1,4,5,6,8};
        int last = arr.length-1;
        int r = 3;
        int start = 0;
        while (r!=0){
            int temp = arr[last];
            for (int i = start; i < arr.length-start-2; i++) {
                int temp1 = arr[i+1];
                arr[i+1] = arr[i];
                arr[i+2] = temp1;
            }
            arr[start] = temp;
            start++;
            last--;
            r--;
        }
        for(int temp:arr){
            System.out.print(temp+" ");
        }
    }

}

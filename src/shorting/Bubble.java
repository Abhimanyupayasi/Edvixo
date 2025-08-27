package shorting;

public class Bubble {
    public static void main(String[] args) {
        int [] arr = {4,5,3,2,1};
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length-1-i ; j++) {
                if(arr[j]>arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        System.out.print("[ ");
        for(int el: arr){

            System.out.print(el+" ");

        }
        System.out.print("] ");

    }
}

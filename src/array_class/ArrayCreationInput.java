package array_class;

import java.util.Scanner;

public class ArrayCreationInput {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter length : ");
        int length= sc.nextInt();
        int [] arr = new int[length];
        for(int i = 0; i<length ; i++){
            System.out.println("Enter "+i+" value : ");
            arr[i] = sc.nextInt();
        }
        System.out.println("output ----------------------");
        for(int i = 0; i<length; i++){
            System.out.print(arr[i]+" ");
        }
    }
}

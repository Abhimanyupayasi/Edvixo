package string;

import java.lang.reflect.Array;
import java.util.Arrays;

public class problem2 {
    //Apple Hello Hi --->
    // ->2
    //A -> 1
    //H ->2

    public static void main(String[] args) {
        int arr [] = new int[128];
        String s = "Apple Hello Hi";
        for (int i = 0; i < s.length(); i++) {
            int ch = s.charAt(i);
            for (int j = i; j < s.length(); j++) {
                int chn = s.charAt(j);
                if(ch==chn){
                    arr[i] ++;
                }
            }
        }
        for (int i = 0; i < arr.length; i++) {
            char ch = (char) i;
            if(arr[i]!=0){
                System.out.println(ch+" = "+arr[i]);
            }
        }
    }
}

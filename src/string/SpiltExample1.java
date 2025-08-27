package string;

public class SpiltExample1 {
    public static void main(String[] args) {
        String s1 = "hello hi bye how are you";
        String arr1[] = s1.split(" ");
        for (int i = 0; i < arr1.length; i++) {
            System.out.println(arr1[i]);
        }
        System.out.println("------------------------");
        String s2 = "he@llo he@hey abhi@dev";
        String arr2[] = s2.split("@");
        for (int i = 0; i < arr2.length; i++) {
            System.out.println(arr2[i]);
        }

    }
}

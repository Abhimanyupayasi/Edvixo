package shorting;

public class AnagramString {
    static String shortStrint(String str){
        char [] arr = str.toCharArray();
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length-1-i ; j++) {
                if(arr[j]>arr[j+1]) {
                    char temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        String ans = new String(arr);
        return ans;
    }


    public static void main(String[] args) {
        String str = "hello";
        String str2 = "elloh";
        String ans1 = shortStrint(str);
        String ans2 = shortStrint(str2);
        if(ans1.equals(ans2)){
            System.out.println("anagram");
        }
        else{
            System.out.println("not a anagram");
        }
    }
}

package LogicalQuetions;

public class PerCharCount {
    public static void main(String[] args) {
        String str = "Apple Hello Hi";
        int arr[] = new int[128];
        for (int i = 0; i < str.length(); i++) {
            arr[str.charAt(i)]++;
        }
        for (int i = 0; i < arr.length; i++) {
            if(arr[i]!=0){
                char ch = (char) i;
                System.out.println(ch+" "+arr[i]);
            }
        }
    }
}

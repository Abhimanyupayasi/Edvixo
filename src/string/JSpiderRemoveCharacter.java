package string;

public class JSpiderRemoveCharacter {
    static  void printArray(char[] arr){
        for (int i = 0; i < arr.length; i++) {
            if(arr[i] !='0'){
                System.out.print(arr[i]);
                //System.out.println();
            }
        }
        System.out.println();
    }
    public static void main(String[] args) {
        String str = "jspiders";
        char[] arr = str.toCharArray();
        int even  = 0;

        int last = arr.length-1;
        int strt = 0;
        System.out.println(str);
        int temp = str.length();
        while (temp!=1){
            if(even==0){
                arr[last] = '0';
                even = 1;
                printArray(arr);
                last--;

            }
            else {

                arr[strt] = '0';
                printArray(arr);
                even = 0;
                strt++;
            }
            temp = temp-1;

        }


    }
}

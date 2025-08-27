package LogicalQuetions;

public class CountCatWord {
    public static void main(String[] args) {
        //String s ="cat";
        int count = 0;
        String str = "acat hcathj cat13cajkcaht";
        for (int i = 0; i < str.length()-2; i++) {
            if((str.charAt(i)=='c')&&(str.charAt(i+1)=='a')&&(str.charAt(i+2)=='t')){
                count++;
            }
        }
        System.out.println(count);
    }
}

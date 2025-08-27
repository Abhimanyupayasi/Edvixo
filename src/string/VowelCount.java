package string;

public class VowelCount {
    static int count(String str){
        String s = "aeiouAEIOU";
        int c = 0;
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            for (int j = 0; j < s.length(); j++) {
                char vo = s.charAt(j);
                if(vo==ch){
                    c++;
                }
            }
        }
        return c;
    }
    public static void main(String[] args) {
        String s = "hello i am abhimanyu HEY HERE";
        String str = s.toLowerCase();
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if((ch=='a')|| (ch=='e')|| (ch=='i')|| (ch=='o')|| (ch=='u')){
                count++;
            }
        }
        System.out.println(count);
        System.out.println(count(s));
    }
}

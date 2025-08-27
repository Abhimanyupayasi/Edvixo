package string;

public class rearrangeString {
    public static void main(String[] args) {
        String str = "a#1B@3";

        //aB13#@

        StringBuilder s1 = new StringBuilder();
        StringBuilder s2 = new StringBuilder();
        StringBuilder s3 = new StringBuilder();

        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
                s1.append(c);
            } else if (c >= '0' && c <= '9') {
                s2.append(c);
            } else {
                s3.append(c);
            }
        }
        System.out.println(s1+""+s2+""+s3);
    }
}

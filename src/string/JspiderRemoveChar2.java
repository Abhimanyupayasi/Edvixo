package string;

public class JspiderRemoveChar2 {
    public static void main(String[] args) {
        String s = "jspiders";
        System.out.println(s);
        int l = 0;
        int h = s.length()-1;
        for (int i = 0; i < s.length(); i++) {
            if(i%2==0){
                h--;
            }
            else{
                l++;
            }
            String temp ="";
            for (int j = l; j <=h ; j++) {
                temp = temp+s.charAt(j);


            }
            System.out.println(temp);
        }
    }
}

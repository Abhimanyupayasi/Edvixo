package LogicalQuetions;

public class CountAllTypeChar {
    public static void main(String[] args) {
        String str = "123&*#ABHI";
        int alpha = 0, num = 0, spe = 0;
        for (int i = 0; i < str.length(); i++) {
            char temp = str.charAt(i);
            if(temp>='0' && temp<='9'){
                num++;
            } else if ((temp>='a' && temp<='z') || (temp>='A' && temp<='Z') ) {
                alpha++;
            }
            else{
                spe++;
            }
        }
        System.out.println("spe : " +spe + " alpha : "+alpha+" num : "+num );
    }
}

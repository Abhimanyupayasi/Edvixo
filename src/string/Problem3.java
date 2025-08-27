package string;

public class Problem3 {
    public static void main(String[] args) {
        String str = "The";
        String ans = "";
        for(int i = 0; i<str.length(); i++){
            ans = ans+str.charAt(i);
            ans = ans+str.charAt(i);
        }
        System.out.println(ans);

        String a = "Hiabc";
        String b = "abc";
        a = a.toLowerCase();
        b = b.toLowerCase();
        boolean an = false;
        if(a.endsWith(b)){
           an= true;
        }
        else {
            an = false;
        }
        System.out.println(an);
        String d = ".abc.xyz";
        String c = "abc";
        System.out.println(d.contains(c));
        if(d.indexOf('a')-1==d.indexOf('.')){
            System.out.println("yes");
        }






    }
}

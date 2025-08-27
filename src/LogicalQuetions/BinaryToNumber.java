package LogicalQuetions;

public class BinaryToNumber {
    static  int power(int base, int po){
        int ans = 1;
        for(int i = 1; i<=po; i++){
            ans = base*ans;
        }
        return ans;
    }
    public static void main(String[] args) {
        int n = 110;
        //int po = 0;
        int po = 1;
        int res = 0;
        while(n!=0){
            int rem = n%10;
            //res = res+power(2,po)*rem;
            res = res+rem*po;
            //po++;
            po = po*2;
            n= n/10;

        }
        System.out.println(res);
    }
}

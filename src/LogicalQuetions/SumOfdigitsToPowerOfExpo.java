package LogicalQuetions;

public class SumOfdigitsToPowerOfExpo {
    static int power(int n , int ex){
        int res = 1;
        for(int i = 1; i<=ex ; i++){
            res = res*n;
        }
        return res;
    }

    public static void main(String[] args) {
        int n = 1432;
        int ex = 2, sum  = 0;
        while (n!=0){
            int rem = n%10;
            sum = sum+power(rem,ex);
            n = n/10;
        }
        System.out.println(sum);
    }

}

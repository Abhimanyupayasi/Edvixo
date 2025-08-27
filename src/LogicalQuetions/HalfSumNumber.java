package LogicalQuetions;

public class HalfSumNumber {
    static int countDigits(int n ){
        int count = 0;
        while (n!=0){
            count++;
            n=n/10;
        }
        return count;
    }
    static int power(int n, int ex){
        int ans = 1;
        for (int i = 1; i <= ex; i++) {
            ans = ans*n;
        }
        return ans;
    }
    public static void main(String[] args) {
        int n = 1234; //12+34 = 46
        int c = countDigits(n);
        int po = power(10,c/2);
        int firstHalf = n/po;
        int sec = n%po;
        System.out.println(firstHalf+sec);

    }
}

package patterns;

public class Quetion5 {
    public static void main(String[] args) {
        for (int i = 65; i<=69; i++){
            for (int j = 65; j <=i; j++) {
                char c = (char) j;
                System.out.print(c);
            }
            System.out.println();
        }
    }
}

package Example4;

import java.util.Scanner;

public class Dream11 {
    static void showPlayer(Player p){
        if (p != null) {
            System.out.println("Player name is : "+p.name);
            System.out.println("Player jersey number is : "+p.jerseyNumber);

        }
    }
    static Player generatePlayer(){
        System.out.println("Enter Player Jersey number : ");
        Scanner sc = new Scanner(System.in);
        int jerseyNumber = sc.nextInt();
        System.out.println("Enter Player Jersey number : ");
        String name = sc.next();
        Player p = new Player(jerseyNumber, name);
        return p;

    }
}

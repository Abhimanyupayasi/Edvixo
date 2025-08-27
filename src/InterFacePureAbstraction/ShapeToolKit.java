package InterFacePureAbstraction;

public class ShapeToolKit {
    static void drawShape(Shape s){
        if(s != null){
            s.draw();
        }
    }
}

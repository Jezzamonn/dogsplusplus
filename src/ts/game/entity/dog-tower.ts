import { PlayerController } from "../controller/player-controller";
import { Dog } from "./dog";

export class DogTower {

    isPlayer = false;

    dogs: Dog[] = [];

    constructor() {}

    static createFromDog(dog: Dog) {
        const tower = new DogTower();

        while (dog.downDog) {
            dog = dog.downDog;
        }

        while (true) {
            if (dog.controller instanceof PlayerController) {
                tower.isPlayer = true;
            }
            tower.dogs.push(dog);

            if (dog.upDog) {
                dog = dog.upDog;
            }
            else {
                break;
            }
        }
        tower.dogs.push(dog);

        return tower;
    }

    update(dt: number) {
        
    }

}
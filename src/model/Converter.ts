import type { Stock } from "./Stock";
import type { Token } from "./Token";

export class Recipe{
    input: Token[];
    output: Token[];

    constructor (input: Token[], output: Token[]){
        this.input = input;
        this.output = output;
    }

    hasInput (stock: Stock){
        return this.input.every(t => stock.has(t));
    }
}

export class Converter{
    id: string;
    inputStock: Stock;
    outputStock: Stock;
    recipe: Recipe;

    constructor (id: string, inputStock: Stock, outputStock: Stock, recipe: Recipe){
        this.id = id;
        this.inputStock = inputStock;
        this.outputStock = outputStock;
        this.recipe = recipe;
    }

    tick() {
        if(this.recipe.hasInput(this.inputStock)){
            this.recipe.input.forEach(t => this.inputStock.remove(t));
            this.recipe.output.forEach(t => this.outputStock.add(t));
        }
    }
}


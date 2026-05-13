
import { Stock } from "./Stock";
import { Token } from "./Token";

export class Sink {
    id: string;
    stock: Stock;
    type: string;
    wasSuccessful: boolean = false;
    totalConsumed: number = 0; // acumulado total de tokens consumidos

    constructor(id: string, stock: Stock, type: string) {
        this.id = id;
        this.stock = stock;
        this.type = type;
    }

    tick() {
        const token = new Token(this.type, 1);
        if (this.stock.has(token)) {
            this.stock.remove(token);
            this.wasSuccessful = true;
            this.totalConsumed += 1;
        } else {
            this.wasSuccessful = false;
        }
    }
}

import { Stock } from "./Stock";
import { Token } from "./Token";

export class Sink {
    id: string;
    stock: Stock;
    type: string;

    constructor(id: string, stock: Stock, type: string) {
        this.id = id;
        this.stock = stock;
        this.type = type;
    }

    tick() {
        const token = new Token(this.type, 1);
        this.stock.remove(token);
    }
}

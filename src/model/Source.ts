import { Stock } from "./Stock";
import { Token } from "./Token";

export class Source {
    id: string;
    stock: Stock;
    type: string;
    rate: number; // quantidade de tokens gerados por tick

    constructor(id: string, stock: Stock, type: string, rate: number = 1) {
        this.id = id;
        this.stock = stock;
        this.type = type;
        this.rate = rate;
    }

    tick() {
        const token = new Token(this.type, this.rate);
        this.stock.add(token);
    }
}

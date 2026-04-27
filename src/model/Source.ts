import { Stock } from "./Stock";
import { Token } from "./Token";

export class Source {
    id: string;
    stock: Stock;
    type: string;
    transferAmount: number;

    constructor(id: string, stock: Stock, type: string) {
        this.id = id;
        this.stock = stock;
        this.type = type;
        this.transferAmount = 1; // Padrão: gera 1 por tick
    }

    tick() {
        const token = new Token(this.type, this.transferAmount);
        this.stock.add(token);
    }
}

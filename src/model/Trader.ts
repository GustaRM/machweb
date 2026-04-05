import { Stock } from "./Stock";
import { Token } from "./Token";

export class Trade {
    input: Token[];
    output: Token[];

    constructor(input: Token[], output: Token[]) {
        this.input = input;
        this.output = output;
    }

    hasInput(stock: Stock) {
        return this.input.every(t => stock.has(t));
    }
}

export class Trader {
    id: string;
    stock1: Stock;
    stock2: Stock;
    trade: Trade;
    commission: number;

    constructor(id: string, stock1: Stock, stock2: Stock, trade: Trade, commission: number = 0) {
        this.id = id;
        this.stock1 = stock1;
        this.stock2 = stock2;
        this.trade = trade;
        this.commission = Math.max(0, Math.min(1, commission)); // Clamp between 0 and 1
    }

    tick() {
        if (this.trade.hasInput(this.stock1)) {
            // Remove input from stock1
            this.trade.input.forEach(t => this.stock1.remove(t));

            // Add output to stock2
            this.trade.output.forEach(t => {
                const commissionAmount = Math.floor(t.amount * this.commission);
                const outputAmount = t.amount - commissionAmount;
                if (outputAmount > 0) {
                    this.stock2.add(new Token(t.type, outputAmount));
                }
            });
        }
    }

    getCommissionEarned() {
        const commissionPerTrade = this.trade.output.reduce((sum, t) => {
            return sum + Math.floor(t.amount * this.commission);
        }, 0);
        return commissionPerTrade;
    }
}

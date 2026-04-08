import { Stock } from "./Stock";
import { Token } from "./Token";

export class Trade {
    termsA: Token[];
    termsB: Token[];

    constructor(termsA: Token[], termsB: Token[]) {
        this.termsA = termsA;
        this.termsB = termsB;
    }

    hasTermsA(stock: Stock) {
        return this.termsA.every(t => stock.has(t));
    }

    hasTermsB(stock: Stock) {
        return this.termsB.every(t => stock.has(t));
    }
}

export class Trader {
    id: string;
    partyA: Stock;
    partyB: Stock;
    trade: Trade;

    constructor(id: string, partyA: Stock, partyB: Stock, trade: Trade) {
        this.id = id;
        this.partyA = partyA;
        this.partyB = partyB;
        this.trade = trade;
    }

    tick() {
        if (this.trade.hasTermsA(this.partyA) && this.trade.hasTermsB(this.partyB)) {
            this.trade.termsA.forEach(t => this.partyA.remove(t));
            this.trade.termsB.forEach(t => this.partyB.remove(t));

            this.trade.termsA.forEach(t => this.partyB.add(t));
            this.trade.termsB.forEach(t => this.partyA.add(t));
        }
    }

   
}

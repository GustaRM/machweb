import type { Token } from "./Token";

export class Stock {
    id: string;
    tokens: Map <string, Token> = new Map();

    constructor (id: string){
        this.id = id;
    }

    add (token: Token){
        const current = this.tokens.get(token.type);

        if (current) {
            current.amount += token.amount;
        }else {
            this.tokens.set(token.type, token);
        }
    }

    remove (token: Token){
        if (this.has(token)) {
            this.tokens.get(token.type)!.amount -= token.amount;
        }
    }

    has (token: Token){
        const current = this.tokens.get(token.type);

        if (current) {
            if(current.amount >= token.amount){
                return true;
            }
        }
        return false;
    }
}
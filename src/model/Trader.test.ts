import { expect, it } from "vitest";
import { Trader, Trade } from "./Trader";
import { Stock } from "./Stock";
import { Token } from "./Token";

it("cria um trader com id, stocks e trade", () => {
    const stock1 = new Stock("s1");
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    expect(trader.id).toBe("trader1");
    expect(trader.partyA).toBe(stock1);
    expect(trader.partyB).toBe(stock2);
    expect(trader.trade).toBe(trade);
});


it("realiza uma troca zero-sum entre stocks", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    const stock2 = new Stock("s2");
    stock2.add({type: "bem", amount: 2})
    const trade = new Trade([new Token("moeda", 2)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(8);
    expect(stock1.tokens.get("bem")!.amount).toBe(1);
    expect(stock2.tokens.get("bem")!.amount).toBe(1);
    expect(stock2.tokens.get("moeda")!.amount).toBe(2);

});

it("não realiza troca se não houver suficiente no stock1", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 0});
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    expect(stock1.tokens.has("moeda")).toBe(true);
    expect(stock2.tokens.has("bem")).toBe(false);
});


it("realiza múltiplas trocas", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    const stock2 = new Stock("s2");
    stock2.add({type: "bem", amount: 10});
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    trader.tick();
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(7);
    expect(stock1.tokens.get("bem")!.amount).toBe(3);
    expect(stock2.tokens.get("bem")!.amount).toBe(7);
    expect(stock2.tokens.get("moeda")!.amount).toBe(3);
});


it("funciona com múltiplos inputs e outputs", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    stock1.add({type: "ouro", amount: 5});
    const stock2 = new Stock("s2");
    stock2.add({type: "bem_raro", amount: 10});
    const trade = new Trade(
        [new Token("moeda", 1), new Token("ouro", 1)],
        [new Token("bem_raro", 2)]
    );
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(9);
    expect(stock1.tokens.get("ouro")!.amount).toBe(4);
    expect(stock1.tokens.get("bem_raro")!.amount).toBe(2);
    expect(stock2.tokens.get("bem_raro")!.amount).toBe(8);
    expect(stock2.tokens.get("moeda")!.amount).toBe(1);
    expect(stock2.tokens.get("ouro")!.amount).toBe(1);
});
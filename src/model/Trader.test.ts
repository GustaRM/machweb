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
    expect(trader.stock1).toBe(stock1);
    expect(trader.stock2).toBe(stock2);
    expect(trader.trade).toBe(trade);
    expect(trader.commission).toBe(0);
});

it("cria um trader com comissão definida", () => {
    const stock1 = new Stock("s1");
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade, 0.1);
    expect(trader.commission).toBe(0.1);
});

it("realiza uma troca zero-sum entre stocks", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(9);
    expect(stock2.tokens.get("bem")!.amount).toBe(1);
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

it("aplica comissão corretamente", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 10)]);
    const trader = new Trader("trader1", stock1, stock2, trade, 0.1);
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(9);
    // Com 10% de comissão em 10 bens = 1 bem perdido
    expect(stock2.tokens.get("bem")!.amount).toBe(9);
    expect(trader.getCommissionEarned()).toBe(1);
});

it("realiza múltiplas trocas", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    trader.tick();
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(7);
    expect(stock2.tokens.get("bem")!.amount).toBe(3);
});

it("clamp commission entre 0 e 1", () => {
    const stock1 = new Stock("s1");
    const stock2 = new Stock("s2");
    const trade = new Trade([new Token("moeda", 1)], [new Token("bem", 1)]);
    const trader1 = new Trader("trader1", stock1, stock2, trade, -0.5);
    const trader2 = new Trader("trader2", stock1, stock2, trade, 1.5);
    expect(trader1.commission).toBe(0);
    expect(trader2.commission).toBe(1);
});

it("funciona com múltiplos inputs e outputs", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    stock1.add({type: "ouro", amount: 5});
    const stock2 = new Stock("s2");
    const trade = new Trade(
        [new Token("moeda", 1), new Token("ouro", 1)],
        [new Token("bem_raro", 2)]
    );
    const trader = new Trader("trader1", stock1, stock2, trade);
    trader.tick();
    expect(stock1.tokens.get("moeda")!.amount).toBe(9);
    expect(stock1.tokens.get("ouro")!.amount).toBe(4);
    expect(stock2.tokens.get("bem_raro")!.amount).toBe(2);
});

it("calcula comissão com múltiplos outputs", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "moeda", amount: 10});
    stock1.add({type: "ouro", amount: 5});
    const stock2 = new Stock("s2");
    const trade = new Trade(
        [new Token("moeda", 1), new Token("ouro", 1)],
        [new Token("bem", 10), new Token("ferramenta", 10)]
    );
    const trader = new Trader("trader1", stock1, stock2, trade, 0.2);
    trader.tick();
    // 20% comissão em (10 + 10) = 4 itens perdidos
    expect(stock2.tokens.get("bem")!.amount).toBe(8);
    expect(stock2.tokens.get("ferramenta")!.amount).toBe(8);
    expect(trader.getCommissionEarned()).toBe(4);
});

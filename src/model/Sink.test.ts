import { expect, it } from "vitest";
import { Sink } from "./Sink";
import { Stock } from "./Stock";

it("cria uma sink com id, stock e type", () => {
    const stock = new Stock("s1");
    const sink = new Sink("sink1", stock, "moeda");
    expect(sink.id).toBe("sink1");
    expect(sink.type).toBe("moeda");
    expect(sink.stock).toBe(stock);
});

it("remove um token do type ao estoque quando chama tick", () => {
    const stock = new Stock("s1");
    stock.add({type: "moeda", amount: 5});
    const sink = new Sink("sink1", stock, "moeda");
    sink.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(4);
});

it("remove múltiplos tokens ao chamar tick várias vezes", () => {
    const stock = new Stock("s1");
    stock.add({type: "moeda", amount: 10});
    const sink = new Sink("sink1", stock, "moeda");
    sink.tick();
    sink.tick();
    sink.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(7);
});

it("funciona com tipos diferentes de tokens", () => {
    const stock = new Stock("s1");
    stock.add({type: "moeda", amount: 5});
    stock.add({type: "bem", amount: 5});
    const sink1 = new Sink("sink1", stock, "moeda");
    const sink2 = new Sink("sink2", stock, "bem");
    sink1.tick();
    sink2.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(4);
    expect(stock.tokens.get("bem")!.amount).toBe(4);
});

it("não remove nada se o token não existir no estoque", () => {
    const stock = new Stock("s1");
    const sink = new Sink("sink1", stock, "moeda");
    sink.tick();
    expect(stock.tokens.has("moeda")).toBe(false);
});

it("não remove tokens de outros tipos", () => {
    const stock = new Stock("s1");
    stock.add({type: "moeda", amount: 5});
    stock.add({type: "bem", amount: 5});
    const sink = new Sink("sink1", stock, "moeda");
    sink.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(4);
    expect(stock.tokens.get("bem")!.amount).toBe(5);
});

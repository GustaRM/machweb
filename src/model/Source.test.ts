import { expect, it } from "vitest";
import { Source } from "./Source";
import { Stock } from "./Stock";
import { Token } from "./Token";

it("cria uma source com id, stock e type", () => {
    const stock = new Stock("s1");
    const source = new Source("source1", stock, "moeda");
    expect(source.id).toBe("source1");
    expect(source.type).toBe("moeda");
    expect(source.stock).toBe(stock);
})

it("adiciona um token do type ao estoque quando chama tick", () => {
    const stock = new Stock("s1");
    const source = new Source("source1", stock, "moeda");
    source.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(1);
})

it("adiciona múltiplos tokens ao chamar tick várias vezes", () => {
    const stock = new Stock("s1");
    const source = new Source("source1", stock, "moeda");
    source.tick();
    source.tick();
    source.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(3);
})

it("funciona com tipos diferentes de tokens", () => {
    const stock = new Stock("s1");
    const source1 = new Source("source1", stock, "moeda");
    const source2 = new Source("source2", stock, "bem");
    source1.tick();
    source2.tick();
    expect(stock.tokens.get("moeda")!.amount).toBe(1);
    expect(stock.tokens.get("bem")!.amount).toBe(1);
})

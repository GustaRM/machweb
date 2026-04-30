import { expect, it } from "vitest";
import { Gate } from "./Gate";
import { Stock } from "./Stock";
import { Token } from "./Token";

// Teste básico para o Gate
it("deve transferir recursos do estoque de origem para o estoque de destino", () => {
    const sourceStock = new Stock("source");
    const targetStock = new Stock("target");
    const token = new Token("moeda", 1);
    sourceStock.add(token);
    const gate = new Gate("gate1", [sourceStock], [targetStock], "moeda", 1);
    gate.tick();
    expect(sourceStock.has(token)).toBe(false);
    expect(targetStock.has(token)).toBe(true);
});

// Teste para o modo roundRobin
it("deve transferir recursos em round robin entre múltiplos stocks", () => {
    const sourceStock1 = new Stock("source1");
    const sourceStock2 = new Stock("source2");
    const targetStock1 = new Stock("target1");
    const targetStock2 = new Stock("target2");
    const token1 = new Token("moeda", 1);
    const token2 = new Token("moeda", 1);
    sourceStock1.add(token1);
    sourceStock2.add(token2);
    const gate = new Gate("gate1", [sourceStock1, sourceStock2], [targetStock1, targetStock2], "moeda", 1);
    gate.tick(); // Deve transferir de sourceStock1 para targetStock1
    expect(sourceStock1.has(token1)).toBe(false);
    expect(targetStock1.has(token1)).toBe(true);
});

// Teste para o modo chance
it("deve transferir recursos com base em chance", () => {
    const sourceStock = new Stock("source");
    const targetStock1 = new Stock("target1");
    const targetStock2 = new Stock("target2");
    const token = new Token("moeda", 1);
    sourceStock.add(token);
    const gate = new Gate("gate1", [sourceStock], [targetStock1, targetStock2], "moeda", 1);
    gate.mode = "chance";
    gate.chanceDistribution = [0.5, 0.5];
    gate.tick();
    const targetHasToken1 = targetStock1.has(token);
    const targetHasToken2 = targetStock2.has(token);
    expect(targetHasToken1 || targetHasToken2).toBe(true);
    expect(targetHasToken1 && targetHasToken2).toBe(false);
});

// Teste para o modo equalSplit
it("deve dividir recursos igualmente entre os targets", () => {
    const sourceStock = new Stock("source");
    const targetStock1 = new Stock("target1");
    const targetStock2 = new Stock("target2");
    const token = new Token("moeda", 2);
    sourceStock.add(token);
    const gate = new Gate("gate1", [sourceStock], [targetStock1, targetStock2], "moeda", 2);
    gate.mode = "equalSplit";
    gate.tick();
    expect(sourceStock.has(token)).toBe(false);
    expect(targetStock1.has(new Token("moeda", 1))).toBe(true);
    expect(targetStock2.has(new Token("moeda", 1))).toBe(true);
});

// Teste para o modo prioridade
it("deve transferir recursos para o target de maior prioridade primeiro", () => {
    const sourceStock = new Stock("source");
    const targetStock1 = new Stock("target1");
    const targetStock2 = new Stock("target2");
    const token = new Token("moeda", 1);
    sourceStock.add(token);
    const gate = new Gate("gate1", [sourceStock], [targetStock1, targetStock2], "moeda", 1);
    gate.mode = "priority";
    gate.priorityList = [0, 1];
    gate.tick();
    expect(sourceStock.has(token)).toBe(false);
    expect(targetStock1.has(token)).toBe(true);
    expect(targetStock2.has(token)).toBe(false);
});





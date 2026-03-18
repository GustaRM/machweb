import { expect, it } from "vitest";
import { Stock } from "./Stock";
import { Token } from "./Token";

it("vai adicionar a quantidade de um token em seu estoque", ()=>{
    const s1 = new Stock("s1");
    const t = new Token("moeda", 1);
    s1.add(t);
    expect(s1.tokens.get("moeda")!.amount).toBe(1);
})

it("vai remover a quantidade de um token em seu estoque", ()=>{
    const s1 = new Stock("s1");
    const saldo = new Token("moeda", 10);
    s1.add(saldo);
    expect(s1.tokens.get("moeda")!.amount).toBe(10);
    const custo =  new Token("moeda", 7);
    s1.remove(custo);
    expect(s1.tokens.get("moeda")!.amount).toBe(3);
})

it("não pode remover se não tiver a quantidade suficiente", ()=>{
    const s1 = new Stock("s1");
    const saldo = new Token("moeda", 10);
    s1.add(saldo);
    expect(s1.tokens.get("moeda")!.amount).toBe(10);
    const custo =  new Token("moeda", 70);
    s1.remove(custo);
    expect(s1.tokens.get("moeda")!.amount).toBe(10);
})

it("não pode remover se não tiver o tipo", ()=>{
    const s1 = new Stock("s1");
    expect(s1.tokens.size).toBe(0);
    const custo =  new Token("moeda", 70);
    s1.remove(custo);
    expect(s1.tokens.size).toBe(0);
})
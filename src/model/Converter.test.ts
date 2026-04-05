import { expect, it } from "vitest";
import { Source } from "./Source";
import { Stock } from "./Stock";
import { Converter, Recipe } from "./Converter";
import { Token } from "./Token";

it("cria um converter com id, stocks e recipe", () => {
    const stock1 = new Stock("s1");
    const stock2 = new Stock("s2");
    const recipe = new Recipe([new Token("Farinha", 1)], [new Token("Pão", 1)]);
    const converter = new Converter("c1", stock1, stock2, recipe);
    expect(converter.id).toBe("c1");
    expect(converter.inputStock).toBe(stock1);
    expect(converter.outputStock).toBe(stock2);
    expect(converter.recipe).toBe(recipe);
});

it("deve converter a entrada para saída", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Farinha", amount: 5});
    stock1.add({type: "Água", amount: 10});
    const stock2 = new Stock("s2");
    const recipe = new Recipe([new Token("Farinha", 1), new Token ("Água", 1)], [new Token ("Pão", 1)]);
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock2.has({type: "Pão", amount: 1})).toBeTruthy();
    expect(stock1.tokens.get("Farinha")?.amount).toBe(4);
    expect(stock1.tokens.get("Água")?.amount).toBe(9);
});

it("não converte se não houver suficiente input", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Farinha", amount: 1});
    stock1.add({type: "Água", amount: 0});
    const stock2 = new Stock("s2");
    const recipe = new Recipe([new Token("Farinha", 1), new Token ("Água", 1)], [new Token ("Pão", 1)]);
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock1.tokens.get("Farinha")?.amount).toBe(1);
    expect(stock2.tokens.has("Pão")).toBe(false);
});

it("realiza múltiplas conversões ao chamar tick várias vezes", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Farinha", amount: 5});
    stock1.add({type: "Água", amount: 5});
    const stock2 = new Stock("s2");
    const recipe = new Recipe([new Token("Farinha", 1), new Token ("Água", 1)], [new Token ("Pão", 1)]);
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    converter.tick();
    converter.tick();
    // Cada tick realiza uma conversão: 1 Farinha + 1 Água -> 1 Pão
    expect(stock1.tokens.get("Farinha")?.amount).toBe(2);
    expect(stock1.tokens.get("Água")?.amount).toBe(2);
    expect(stock2.tokens.get("Pão")?.amount).toBe(4);
});

it("converte com múltiplos outputs", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Ouro", amount: 10});
    const stock2 = new Stock("s2");
    const recipe = new Recipe(
        [new Token("Ouro", 1)],
        [new Token("Anel", 1), new Token("Poeira", 2)]
    );
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock1.tokens.get("Ouro")?.amount).toBe(9);
    expect(stock2.tokens.get("Anel")?.amount).toBe(1);
    expect(stock2.tokens.get("Poeira")?.amount).toBe(2);
});

it("converte com proporção maior de entrada", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Ingrediente", amount: 20});
    const stock2 = new Stock("s2");
    const recipe = new Recipe(
        [new Token("Ingrediente", 3)],
        [new Token("Produto", 1)]
    );
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock1.tokens.get("Ingrediente")?.amount).toBe(17);
    expect(stock2.tokens.get("Produto")?.amount).toBe(1);
});

it("converte com proporção maior de saída", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Ingrediente", amount: 10});
    const stock2 = new Stock("s2");
    const recipe = new Recipe(
        [new Token("Ingrediente", 1)],
        [new Token("Produto", 5)]
    );
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock1.tokens.get("Ingrediente")?.amount).toBe(9);
    expect(stock2.tokens.get("Produto")?.amount).toBe(5);
});

it("funciona com tipos de tokens diferentes", () => {
    const stock1 = new Stock("s1");
    stock1.add({type: "Madeira", amount: 5});
    stock1.add({type: "Prego", amount: 10});
    const stock2 = new Stock("s2");
    const recipe = new Recipe(
        [new Token("Madeira", 1), new Token("Prego", 4)],
        [new Token("Mesa", 1)]
    );
    const converter = new Converter ("c1", stock1, stock2, recipe);
    converter.tick();
    expect(stock1.tokens.get("Madeira")?.amount).toBe(4);
    expect(stock1.tokens.get("Prego")?.amount).toBe(6);
    expect(stock2.tokens.get("Mesa")?.amount).toBe(1);
});

it("verifica hasInput corretamente", () => {
    const stock = new Stock("s1");
    stock.add({type: "A", amount: 5});
    stock.add({type: "B", amount: 3});
    const recipe1 = new Recipe([new Token("A", 1), new Token("B", 1)], [new Token("C", 1)]);
    const recipe2 = new Recipe([new Token("A", 6), new Token("B", 1)], [new Token("C", 1)]);
    expect(recipe1.hasInput(stock)).toBe(true);
    expect(recipe2.hasInput(stock)).toBe(false);
});
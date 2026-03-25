import { expect, it } from "vitest";
import { Source } from "./Source";
import { Stock } from "./Stock";
import { Converter, Recipe } from "./Converter";
import { Token } from "./Token";

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
})
import { Source } from "./Source";
import { Converter } from "./Converter";
import { Trader } from "./Trader";
import { Stock } from "./Stock";

export class Simulator {
  converters: Converter[] = [];
  sources: Source[] = [];
  traders: Trader[] = [];
  stocks: Stock[] = [];
  tickCount: number = 0;

  // Adicionar elementos à simulação
  addConverter(converter: Converter) {
    this.converters.push(converter);
  }

  addSource(source: Source) {
    this.sources.push(source);
  }

  addTrader(trader: Trader) {
    this.traders.push(trader);
  }

  addStock(stock: Stock) {
    this.stocks.push(stock);
  }

  // Executar um tick da simulação
  tick() {
    // Ordem de execução (de trás para frente):
    // 1. Converters primeiro (consomem recursos)
    // 2. Traders depois (trocam recursos)
    // 3. Sources por último (geram recursos)
    
    // Converter executa primeiro
    this.converters.forEach(converter => converter.tick());

    // Traders executam segundo
    this.traders.forEach(trader => trader.tick());

    // Sources executam por último
    this.sources.forEach(source => source.tick());

    this.tickCount++;
  }

  // Executar múltiplos ticks
  runTicks(count: number) {
    for (let i = 0; i < count; i++) {
      this.tick();
    }
  }

  // Resetar a simulação
  reset() {
    this.tickCount = 0;
    this.stocks.forEach(stock => {
      stock.tokens.clear();
    });
  }
}

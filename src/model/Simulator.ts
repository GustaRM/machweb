import { Source } from "./Source";
import { Converter } from "./Converter";
import { Trader } from "./Trader";
import { Stock } from "./Stock";

export class Simulator {
  private converters: Converter[] = [];
  private sources: Source[] = [];
  private traders: Trader[] = [];
  private stocks: Stock[] = [];
  private tickCount: number = 0;

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

  // Obter o número de ticks executados
  getTickCount(): number {
    return this.tickCount;
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

  // Obter estado atual dos stocks (para exibir no React)
  getStocksState() {
    return this.stocks.map(stock => ({
      id: stock.id,
      tokens: Array.from(stock.tokens.entries()).map(([type, token]) => ({
        type,
        amount: token.amount,
      })),
    }));
  }

  // Resetar a simulação
  reset() {
    this.tickCount = 0;
    this.stocks.forEach(stock => {
      stock.tokens.clear();
    });
  }
}

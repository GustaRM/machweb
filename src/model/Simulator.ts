import { Source } from "./Source";
import { Converter } from "./Converter";
import { Trader } from "./Trader";
import { Stock } from "./Stock";
import { Gate } from "./Gate";

export class Simulator {
  private converters: Converter[] = [];
  private sources: Source[] = [];
  private traders: Trader[] = [];
  private gates: Gate[] = [];
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

  addGate(gate: Gate) {
    this.gates.push(gate);
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
    // Ordem de execução:
    // 1. Converters (consomem recursos)
    // 2. Gates (transferem recursos)
    // 3. Traders (trocam recursos)
    // 4. Sources (geram recursos)
    
    this.converters.forEach(converter => converter.tick());
    this.gates.forEach(gate => gate.tick());
    this.traders.forEach(trader => trader.tick());
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

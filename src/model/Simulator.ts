import { Source } from "./Source";
import { Converter } from "./Converter";
import { Trader } from "./Trader";
import { Stock } from "./Stock";
import { Gate } from "./Gate";
import type { Sink } from "./Sink";

export class Simulator {
  converters: Converter[] = [];
  sources: Source[] = [];
  traders: Trader[] = [];
  stocks: Stock[] = [];
  sinks: Sink[] = [];
  gates: Gate[] = [];
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

  addSink(sink: Sink) {
    this.sinks.push(sink);
  }

  addGate(gate: Gate) {
    this.gates.push(gate);
  }

  // Executar um tick da simulação
  tick() {
       
    // Sinks executam primeiro (consomem recursos)
    this.sinks.forEach(sink => sink.tick());
    
    // Traders executam em segundo (fazer as trocas)
    this.traders.forEach(trader => trader.tick());

    // Converter executa em terceiro (Fabricação)
    this.converters.forEach(converter => converter.tick());
    
    // Gates executam em quarto (distribuem recursos)
    this.gates.forEach(gate => gate.tick());

    // Sources executam por último (geram novos recursos)
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

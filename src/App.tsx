import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Suas classes do model
import { Simulator } from "./model/Simulator";
import { Stock } from "./model/Stock";
import { Token } from "./model/Token";
import { Converter, Recipe } from "./model/Converter"; // Ajuste se Recipe estiver dentro de Converter
import { Source } from "./model/Source";

// criar uma instância do simulador
const simulator = new Simulator();

function App() {
  const [tickCount, setTickCount] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Configurar a simulação
    const stock1 = new Stock("s1");
    const stock2 = new Stock("s2");
    const recipe = new Recipe([new Token("Farinha", 1)], [new Token("Pão", 1)]);
    const converter = new Converter("c1", stock1, stock2, recipe);
    const source = new Source("source1", stock1, "Farinha");

    simulator.addStock(stock1);
    simulator.addStock(stock2);
    simulator.addConverter(converter);
    simulator.addSource(source); 

    setStocks(simulator.stocks);

    // Iniciar o loop de ticks
    intervalRef.current = setInterval(() => {
      simulator.tick();
      setTickCount(simulator.tickCount);
      setStocks([...simulator.stocks]); // Atualiza o estado para refletir as mudanças nos stocks
    }, 1000); // 1 segundo por tick

    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Renderizar a interface, criar visualizações para os stocks e converters visualmente bonita

  return (
    <div className="App">
      <h1>Simulador de Processos</h1>
      <p>Tick Count: {tickCount}</p>
      <div className="stocks">
        {stocks.map(stock => (
          <div key={stock.id} className="stock">
            <h2>{stock.id}</h2>
            <ul>
              {Array.from(stock.tokens.entries()).map(([type, token]) => (
                <li key={type}>{type}: {token.amount}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
  
  
}

export default App;


import { useState, useEffect } from 'react'
import './App.css'
import { Simulator, Stock, Token, Source, Converter, Recipe, Gate } from './model'

function App() {
  const [simulatorState, setSimulatorState] = useState({
    madeira: 0,
    tabua: 0,
    ouro: 0,
    tick: 0
  })

  const [simulator] = useState(() => {
    // Criar os stocks (estoques)
    const madeiraStock = new Stock("madeira-armazem")
    const tauaStock = new Stock("tauas-armazem")
    const ouroStock = new Stock("ouro-armazem")

    // Criar fonte de madeira (gera 5 madeira por tick)
    const florestaSource = new Source("floresta", madeiraStock, "madeira")
    florestaSource.transferAmount = 5

    // Criar receita: 3 madeira → 2 tábuas
    const lenhadorRecipe = new Recipe(
      [new Token("madeira", 3)],
      [new Token("tabua", 2)]
    )
    const lenhador = new Converter("lenhador", madeiraStock, tauaStock, lenhadorRecipe)

    // Criar portão que transfere tábuas para ouro (conversão simples)
    const portaTauas = new Gate("porta-tauas", tauaStock, ouroStock, "tabua", 1)

    // Criar simulador e registrar elementos
    const sim = new Simulator()
    sim.addStock(madeiraStock)
    sim.addStock(tauaStock)
    sim.addStock(ouroStock)
    sim.addSource(florestaSource)
    sim.addConverter(lenhador)
    sim.addGate(portaTauas)

    return sim
  })

  // Atualizar visualização quando há mudança
  const updateState = () => {
    const stocks = simulator.getStocksState()
    
    const madeiraAmount = stocks[0]?.tokens.find(t => t.type === "madeira")?.amount || 0
    const tauaAmount = stocks[1]?.tokens.find(t => t.type === "tabua")?.amount || 0
    const ouroAmount = stocks[2]?.tokens.find(t => t.type === "tabua")?.amount || 0

    setSimulatorState({
      madeira: madeiraAmount,
      tabua: tauaAmount,
      ouro: ouroAmount,
      tick: simulator.getTickCount()
    })
  }

  useEffect(() => {
    updateState()
  }, [])

  const handleTick = () => {
    simulator.tick()
    updateState()
  }

  const handleRunTicks = (count: number) => {
    simulator.runTicks(count)
    updateState()
  }

  return (
    <div className="app-container">
      <h1>🎮 Simulador de Economia do Jogo (Machweb)</h1>
      
      <div className="stats">
        <h2>Tick: <span className="tick-counter">{simulatorState.tick}</span></h2>
      </div>

      <div className="stocks-container">
        <div className="stock">
          <h3>🌲 Madeira</h3>
          <div className="stock-value">{simulatorState.madeira}</div>
          <p className="description">Gerada pela Floresta (Source)</p>
        </div>

        <div className="stock">
          <h3>🪵 Tábuas</h3>
          <div className="stock-value">{simulatorState.tabua}</div>
          <p className="description">Produzidas pelo Lenhador (Converter)</p>
        </div>

        <div className="stock">
          <h3>✨ Ouro</h3>
          <div className="stock-value">{simulatorState.ouro}</div>
          <p className="description">Transferido via Portão (Gate)</p>
        </div>
      </div>

      <div className="controls">
        <button onClick={handleTick} className="btn btn-tick">
          ⏭️ Um Tick
        </button>
        <button onClick={() => handleRunTicks(5)} className="btn btn-run">
          ⏩ 5 Ticks
        </button>
        <button onClick={() => handleRunTicks(10)} className="btn btn-run">
          ⏭️ 10 Ticks
        </button>
      </div>

      <div className="info">
        <h3>📋 Como funciona:</h3>
        <ul>
          <li><strong>Source (Floresta):</strong> Gera 5 madeira por tick</li>
          <li><strong>Converter (Lenhador):</strong> Converte 3 madeira → 2 tábuas</li>
          <li><strong>Gate (Portão):</strong> Transfere 1 tábua por tick para ouro</li>
        </ul>
        <p className="order">Ordem de execução: Converter → Gate → Source</p>
      </div>
    </div>
  )
}

export default App

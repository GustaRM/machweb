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

    // Criar receita: 2 tábuas → 3 ouro
    const mercadorRecipe = new Recipe(
      [new Token("tabua", 2)],
      [new Token("ouro", 3)]
    )
    const mercador = new Converter("mercador", tauaStock, ouroStock, mercadorRecipe)

    // Criar simulador e registrar elementos
    const sim = new Simulator()
    sim.addStock(madeiraStock)
    sim.addStock(tauaStock)
    sim.addStock(ouroStock)
    sim.addSource(florestaSource)
    sim.addConverter(lenhador)
    sim.addConverter(mercador)

    return sim
  })

  // Atualizar visualização quando há mudança
  const updateState = () => {
    const stocks = simulator.getStocksState()
    
    const madeiraAmount = stocks[0]?.tokens.find(t => t.type === "madeira")?.amount || 0
    const tauaAmount = stocks[1]?.tokens.find(t => t.type === "tabua")?.amount || 0
    const ouroAmount = stocks[2]?.tokens.find(t => t.type === "ouro")?.amount || 0

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
      <div className="header">
        <h1>🎮 Simulador de Economia (Machinations)</h1>
        <div className="tick-display">
          <span className="tick-label">Tick:</span>
          <span className="tick-counter">{simulatorState.tick}</span>
        </div>
      </div>

      <div className="flow-diagram">
        {/* Source - Geração */}
        <div className="element source">
          <div className="element-header">🌲 Source</div>
          <div className="element-name">Floresta</div>
          <div className="element-output">
            <span className="resource">🌲 +5</span>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="arrow">→</div>

        {/* Stock 1 - Madeira */}
        <div className="stock-display">
          <div className="resource-name">🌲 Madeira</div>
          <div className="resource-value">{simulatorState.madeira}</div>
        </div>

        {/* Arrow 2 */}
        <div className="arrow">→</div>

        {/* Converter - Transformação */}
        <div className="element converter">
          <div className="element-header">⚙️ Converter</div>
          <div className="element-name">Lenhador</div>
          <div className="element-recipe">
            <span className="input">3 🌲</span>
            <span className="recipe-arrow">→</span>
            <span className="output">2 🪵</span>
          </div>
        </div>
      </div>

      <div className="flow-diagram flow-diagram-2">
        {/* Tabuas Stock */}
        <div className="stock-display">
          <div className="resource-name">🪵 Tábuas</div>
          <div className="resource-value">{simulatorState.tabua}</div>
        </div>

        {/* Arrow 3 */}
        <div className="arrow">→</div>

        {/* Converter 2 - Mercador */}
        <div className="element converter">
          <div className="element-header">⚙️ Converter</div>
          <div className="element-name">Mercador</div>
          <div className="element-recipe">
            <span className="input">2 🪵</span>
            <span className="recipe-arrow">→</span>
            <span className="output">3 ✨</span>
          </div>
        </div>

        {/* Arrow 4 */}
        <div className="arrow">→</div>

        {/* Ouro Stock */}
        <div className="stock-display">
          <div className="resource-name">✨ Ouro</div>
          <div className="resource-value">{simulatorState.ouro}</div>
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

      <div className="legend">
        <h3>📊 Fluxo de Economia:</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="step-label">🌳 Source (Floresta):</span> Gera 5 madeira/tick
          </div>
          <div className="legend-item">
            <span className="step-label">⚙️ Converter (Lenhador):</span> 3 madeira → 2 tábuas
          </div>
          <div className="legend-item">
            <span className="step-label">⚙️ Converter (Mercador):</span> 2 tábuas → 3 ouro
          </div>
        </div>
        <p className="execution-note">💡 Os recursos diminuem conforme são processados em cada etapa</p>
      </div>
    </div>
  )
}

export default App

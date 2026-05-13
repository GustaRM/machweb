import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import { Simulator } from "./model/Simulator";
import { Stock } from "./model/Stock";
import { Gate } from "./model/Gate";
import { Source } from "./model/Source";
import { Sink } from "./model/Sink";

// ── Constantes de layout ──────────────────────────────────
const W = 820;   // largura do SVG
const H = 380;   // altura do SVG
const R = 36;    // raio dos nós circulares

// Posições X dos nós na linha principal
const NX = { src: 75, res: 230, gate: 400 };
// Posições X dos nós nos ramos
const NX2 = { stock: 580, sink: 740 };
// Posições Y: main=centro, top=ramo superior, bot=ramo inferior
const NY = { main: 175, top: 85, bot: 265 };

// Modos disponíveis do Gate
type GateMode = Gate["mode"];
const MODES: { id: GateMode; label: string; desc: string; transferAmount: number }[] = [
  {
    id: "roundRobin",
    label: "Round Robin",
    desc: "Alterna entre Canal A e Canal B a cada tick",
    transferAmount: 1,
  },
  {
    id: "chance",
    label: "Chance",
    desc: "60% de chance para Canal A, 40% para Canal B",
    transferAmount: 1,
  },
  {
    id: "equalSplit",
    label: "Divisão Igual",
    desc: "Envia 1 recurso para cada canal por tick (usa 2 por tick)",
    transferAmount: 2,
  },
  {
    id: "priority",
    label: "Prioridade",
    desc: "Canal A tem prioridade; Canal B só recebe se A estiver cheio",
    transferAmount: 1,
  },
];

// ── Configuração da simulação ──────────────────────────────
function buildSim() {
  const stockRes = new Stock("Recurso");  // reserva central
  const stockA = new Stock("Recurso");   // canal A
  const stockB = new Stock("Recurso");   // canal B

  const src = new Source("Gerador", stockRes, "Recurso");

  // Gate distribui da Reserva para os dois canais
  const gate = new Gate("Distribuidor", [stockRes], [stockA, stockB], "Recurso", 1);
  gate.chanceDistribution = [0.6, 0.4]; // 60% A, 40% B
  gate.priorityList = [0, 1];            // índice 0 (A) tem prioridade

  const sinkA = new Sink("Dreno A", stockA, "Recurso");
  const sinkB = new Sink("Dreno B", stockB, "Recurso");

  const sim = new Simulator();
  sim.addStock(stockRes);
  sim.addStock(stockA);
  sim.addStock(stockB);
  sim.addSource(src);
  sim.addGate(gate);
  sim.addSink(sinkA);
  sim.addSink(sinkB);

  return { sim, stockRes, stockA, stockB, src, gate, sinkA, sinkB };
}

function amt(stock: Stock, type: string): number {
  return stock.tokens.get(type)?.amount ?? 0;
}

// ── Tipo auxiliar para setas ───────────────────────────────
type Arrow = {
  x1: number; y1: number;
  x2: number; y2: number;
  active: boolean;
};

// ── Componente principal ───────────────────────────────────
export default function App() {
  const simRef = useRef(buildSim());

  // Estado da simulação
  const [tick, setTick] = useState(0);
  const [resReserva, setResReserva] = useState(0);
  const [gateFired, setGateFired] = useState(false);
  const [gateTargets, setGateTargets] = useState<number[]>([]);
  const [sinkAFired, setSinkAFired] = useState(false);
  const [sinkBFired, setSinkBFired] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Totais acumulados (contam para cima a cada tick)
  const cumulativeARef = useRef(0); // refs para acesso síncrono dentro do callback
  const cumulativeBRef = useRef(0);
  const [cumulativeA, setCumulativeA] = useState(0); // total enviado ao Canal A
  const [cumulativeB, setCumulativeB] = useState(0); // total enviado ao Canal B
  const [totalConsumedA, setTotalConsumedA] = useState(0); // total consumido pelo Dreno A
  const [totalConsumedB, setTotalConsumedB] = useState(0); // total consumido pelo Dreno B

  // Controles de execução
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modo atual do Gate
  const [gateMode, setGateMode] = useState<GateMode>("roundRobin");

  // Taxa de geração da Fonte
  const [sourceRate, setSourceRate] = useState(1);

  /** Executa um único tick */
  const doTick = useCallback(() => {
    const { sim, stockRes, gate, sinkA, sinkB } = simRef.current;
    sim.tick(); // converters → gates → traders → sources → sinks

    // Acumula totais enviados a cada canal
    if (gate.wasSuccessful) {
      if (gate.activeTargetIndices.includes(0)) {
        cumulativeARef.current += gate.transferAmount;
      }
      if (gate.activeTargetIndices.includes(1)) {
        cumulativeBRef.current += gate.transferAmount;
      }
    }

    setTick(sim.tickCount);
    setResReserva(amt(stockRes, "Recurso"));
    setGateFired(gate.wasSuccessful);
    setGateTargets([...gate.activeTargetIndices]);
    setSinkAFired(sinkA.wasSuccessful);
    setSinkBFired(sinkB.wasSuccessful);
    setCumulativeA(cumulativeARef.current);
    setCumulativeB(cumulativeBRef.current);
    setTotalConsumedA(sinkA.totalConsumed);
    setTotalConsumedB(sinkB.totalConsumed);
    setAnimKey((k) => k + 1);
  }, []);

  // Loop automático
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(doTick, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, speed, doTick]);

  /** Altera a taxa de geração da Fonte sem reiniciar */
  const handleSourceRate = (delta: number) => {
    const next = Math.max(1, Math.min(10, sourceRate + delta));
    simRef.current.src.rate = next;
    setSourceRate(next);
  };

  /** Altera o modo do Gate sem reiniciar a simulação */
  const handleModeChange = (mode: GateMode) => {
    const modeCfg = MODES.find((m) => m.id === mode)!;
    simRef.current.gate.mode = mode;
    simRef.current.gate.transferAmount = modeCfg.transferAmount;
    setGateMode(mode);
  };

  /** Reinicia do zero */
  const handleReset = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    simRef.current = buildSim();
    simRef.current.gate.mode = gateMode;
    const modeCfg = MODES.find((m) => m.id === gateMode)!;
    simRef.current.gate.transferAmount = modeCfg.transferAmount;
    simRef.current.src.rate = sourceRate;
    // Zera todos os contadores
    cumulativeARef.current = 0;
    cumulativeBRef.current = 0;
    setTick(0);
    setResReserva(0);
    setGateFired(false);
    setGateTargets([]);
    setSinkAFired(false);
    setSinkBFired(false);
    setCumulativeA(0);
    setCumulativeB(0);
    setTotalConsumedA(0);
    setTotalConsumedB(0);
    setAnimKey(0);
  };

  // ── Definição das setas ────────────────────────────────
  const gateLeftTip = NX.gate - R;
  const gateRightTip = NX.gate + R;

  const arrows: Arrow[] = [
    // Gerador → Reserva (sempre ativa após primeiro tick)
    {
      x1: NX.src + R + 4, y1: NY.main,
      x2: NX.res - R - 4, y2: NY.main,
      active: animKey > 0,
    },
    // Reserva → Gate (ativa quando gate disparou)
    {
      x1: NX.res + R + 4, y1: NY.main,
      x2: gateLeftTip - 4, y2: NY.main,
      active: gateFired,
    },
    // Gate → Canal A (ramo superior, diagonal)
    {
      x1: gateRightTip + 4, y1: NY.main,
      x2: NX2.stock - R - 4, y2: NY.top,
      active: gateFired && gateTargets.includes(0),
    },
    // Gate → Canal B (ramo inferior, diagonal)
    {
      x1: gateRightTip + 4, y1: NY.main,
      x2: NX2.stock - R - 4, y2: NY.bot,
      active: gateFired && gateTargets.includes(1),
    },
    // Canal A → Dreno A
    {
      x1: NX2.stock + R + 4, y1: NY.top,
      x2: NX2.sink - R - 4, y2: NY.top,
      active: sinkAFired,
    },
    // Canal B → Dreno B
    {
      x1: NX2.stock + R + 4, y1: NY.bot,
      x2: NX2.sink - R - 4, y2: NY.bot,
      active: sinkBFired,
    },
  ];

  const currentMode = MODES.find((m) => m.id === gateMode)!;

  return (
    <div className="app">
      {/* ── Cabeçalho ── */}
      <header className="app-header">
        <h1>Simulador Machweb</h1>
        <p>
          Tick: <strong>{tick}</strong>
        </p>
      </header>

      {/* ── Diagrama SVG ── */}
      <div className="diagram-card">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
          <defs>
            <marker id="arr-gray" viewBox="0 0 8 6" markerWidth="8" markerHeight="6"
              refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#555" />
            </marker>
            <marker id="arr-gold" viewBox="0 0 8 6" markerWidth="8" markerHeight="6"
              refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#ffd700" />
            </marker>
          </defs>

          {/* Linhas guia para os ramos (sempre visíveis, indicam caminhos possíveis) */}
          <line
            x1={gateRightTip} y1={NY.main}
            x2={NX2.stock - R} y2={NY.top}
            stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4"
          />
          <line
            x1={gateRightTip} y1={NY.main}
            x2={NX2.stock - R} y2={NY.bot}
            stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4"
          />

          {/* ── Setas ativas ── */}
          {arrows.map((a, i) => (
            <g key={i}>
              {a.active && (
                <>
                  <line
                    x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                    stroke="#ffd700" strokeWidth={3}
                    markerEnd="url(#arr-gold)"
                  />
                  <circle
                    key={`tok-${i}-${animKey}`}
                    cx={a.x1} cy={a.y1} r={7}
                    fill="#ffd700" stroke="#fff" strokeWidth={1.5}
                    style={{
                      animation: "tokenSlide 0.55s ease-out forwards",
                      "--dx": `${a.x2 - a.x1}px`,
                      "--dy": `${a.y2 - a.y1}px`,
                    } as React.CSSProperties}
                  />
                </>
              )}
              {!a.active && (
                <line
                  x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                  stroke="#444" strokeWidth={2}
                  markerEnd="url(#arr-gray)"
                />
              )}
            </g>
          ))}

          {/* ── Nó: Gerador (Fonte) ── */}
          <g transform={`translate(${NX.src},${NY.main})`}>
            <circle r={R} fill="#1a6b33"
              stroke={animKey > 0 ? "#4caf50" : "#2a9347"}
              strokeWidth={animKey > 0 ? 4 : 2}
            />
            {animKey > 0 && (
              <circle key={`glow-src-${animKey}`} r={R} fill="none"
                stroke="#4caf50" strokeWidth={2}
                style={{ animation: "nodeGlow 0.55s ease-out forwards" }}
              />
            )}
            <text textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize={28} fontWeight="bold">+</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Fonte</text>
            <text textAnchor="middle" fill="#888" fontSize={10} y={R + 34}>+{sourceRate} / tick</text>
          </g>

          {/* ── Nó: Reserva (Stock central) ── */}
          <g transform={`translate(${NX.res},${NY.main})`}>
            <circle r={R} fill="#144a6e" stroke="#2980b9" strokeWidth={2} />
            <text textAnchor="middle" fill="white" fontSize={22} fontWeight="bold" y={-7}>
              {resReserva}
            </text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={11} y={11}>Recurso</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Reserva</text>
          </g>

          {/* ── Nó: Gate (distribuidor) ── */}
          <g transform={`translate(${NX.gate},${NY.main})`}>
            {/* Hexágono deitado */}
            <polygon
              points={`${-R},0 ${-R * 0.5},${-R * 0.86} ${R * 0.5},${-R * 0.86} ${R},0 ${R * 0.5},${R * 0.86} ${-R * 0.5},${R * 0.86}`}
              fill={gateFired ? "#0d5e6b" : "#06303a"}
              stroke={gateFired ? "#00d4ff" : "#0a4a57"}
              strokeWidth={gateFired ? 3 : 2}
            />
            {gateFired && (
              <polygon
                key={`glow-gate-${animKey}`}
                points={`${-R},0 ${-R * 0.5},${-R * 0.86} ${R * 0.5},${-R * 0.86} ${R},0 ${R * 0.5},${R * 0.86} ${-R * 0.5},${R * 0.86}`}
                fill="none" stroke="#00d4ff" strokeWidth={2}
                style={{ animation: "nodeGlow 0.55s ease-out forwards" }}
              />
            )}
            <text textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize={20}>⬡</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Gate</text>
            <text textAnchor="middle" fill="#00d4ff" fontSize={10} y={R + 34}>{currentMode.label}</text>
          </g>

          {/* ── Nó: Canal A (Stock topo) — mostra total recebido ── */}
          <g transform={`translate(${NX2.stock},${NY.top})`}>
            <circle r={R} fill="#144a6e" stroke="#2980b9" strokeWidth={2} />
            <text textAnchor="middle" fill="white" fontSize={22} fontWeight="bold" y={-7}>
              {cumulativeA}
            </text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={11}>recebidos</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Canal A</text>
          </g>

          {/* ── Nó: Canal B (Stock base) — mostra total recebido ── */}
          <g transform={`translate(${NX2.stock},${NY.bot})`}>
            <circle r={R} fill="#144a6e" stroke="#2980b9" strokeWidth={2} />
            <text textAnchor="middle" fill="white" fontSize={22} fontWeight="bold" y={-7}>
              {cumulativeB}
            </text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={11}>recebidos</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Canal B</text>
          </g>

          {/* ── Nó: Dreno A — mostra total consumido ── */}
          <g transform={`translate(${NX2.sink},${NY.top})`}>
            <circle r={R} fill="#6b1515"
              stroke={sinkAFired ? "#e74c3c" : "#4a0f0f"}
              strokeWidth={sinkAFired ? 4 : 2}
            />
            {sinkAFired && (
              <circle key={`glow-snkA-${animKey}`} r={R} fill="none"
                stroke="#e74c3c" strokeWidth={2}
                style={{ animation: "nodeGlow 0.55s ease-out forwards" }}
              />
            )}
            <text textAnchor="middle" fill="white" fontSize={22} fontWeight="bold" y={-7}>
              {totalConsumedA}
            </text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={11}>consumidos</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Dreno A</text>
          </g>

          {/* ── Nó: Dreno B — mostra total consumido ── */}
          <g transform={`translate(${NX2.sink},${NY.bot})`}>
            <circle r={R} fill="#6b1515"
              stroke={sinkBFired ? "#e74c3c" : "#4a0f0f"}
              strokeWidth={sinkBFired ? 4 : 2}
            />
            {sinkBFired && (
              <circle key={`glow-snkB-${animKey}`} r={R} fill="none"
                stroke="#e74c3c" strokeWidth={2}
                style={{ animation: "nodeGlow 0.55s ease-out forwards" }}
              />
            )}
            <text textAnchor="middle" fill="white" fontSize={22} fontWeight="bold" y={-7}>
              {totalConsumedB}
            </text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={11}>consumidos</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Dreno B</text>
          </g>
        </svg>
      </div>

      {/* ── Seletor de Modo do Gate ── */}
      <div className="mode-section">
        <p className="mode-title">Modo do Gate:</p>
        <div className="mode-buttons">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`btn-mode ${gateMode === m.id ? "active" : ""}`}
              onClick={() => handleModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mode-desc">{currentMode.desc}</p>
      </div>

      {/* ── Controle de geração da Fonte ── */}
      <div className="mode-section">
        <p className="mode-title">Recursos gerados por tick (Fonte):</p>
        <div className="rate-row">
          <button
            className="rate-btn"
            onClick={() => handleSourceRate(-1)}
            disabled={sourceRate <= 1}
          >
            −
          </button>
          <span className="rate-value">{sourceRate}</span>
          <button
            className="rate-btn"
            onClick={() => handleSourceRate(1)}
            disabled={sourceRate >= 10}
          >
            +
          </button>
        </div>
        <p className="mode-desc">
          A Fonte gera <strong style={{ color: "#ffd700" }}>{sourceRate}</strong> recurso{sourceRate > 1 ? "s" : ""} por tick.
          {sourceRate > 1 && " Maior geração acelera o enchimento dos canais."}
        </p>
      </div>

      {/* ── Painel de controles ── */}
      <div className="controls">
        <button
          className={`btn ${running ? "btn-pause" : "btn-play"}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "⏸ Pausar" : "▶ Iniciar"}
        </button>
        <button className="btn btn-step" onClick={doTick} disabled={running}>
          ⏭ Avançar 1 Tick
        </button>
        <button className="btn btn-reset" onClick={handleReset}>
          🔄 Reiniciar
        </button>
        <label className="speed-label">
          Velocidade:
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="speed-select"
          >
            <option value={2000}>Lenta (2 s/tick)</option>
            <option value={1000}>Normal (1 s/tick)</option>
            <option value={500}>Rápida (0,5 s/tick)</option>
            <option value={200}>Turbo (0,2 s/tick)</option>
          </select>
        </label>
      </div>

      {/* ── Legenda ── */}
      <div className="legend">
        <LegendItem shape="circle" color="#1a6b33" border="#4caf50" label="Fonte — gera recursos" />
        <LegendItem shape="circle" color="#144a6e" border="#2980b9" label="Estoque — armazena" />
        <LegendItem shape="hex" color="#0d5e6b" border="#00d4ff" label="Gate — distribui recursos" />
        <LegendItem shape="circle" color="#6b1515" border="#e74c3c" label="Dreno — consome recursos" />
      </div>
    </div>
  );
}

// ── Legenda ────────────────────────────────────────────────
function LegendItem({
  shape, color, border, label,
}: {
  shape: "circle" | "hex";
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div className="legend-item">
      <span className="legend-icon">
        <svg width={16} height={16} viewBox="0 0 16 16">
          {shape === "circle" ? (
            <circle cx={8} cy={8} r={6.5} fill={color} stroke={border} strokeWidth={1.5} />
          ) : (
            <polygon
              points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
              fill={color} stroke={border} strokeWidth={1.5}
            />
          )}
        </svg>
      </span>
      <span>{label}</span>
    </div>
  );
}
import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import { Simulator } from "./model/Simulator";
import { Stock } from "./model/Stock";
import { Gate } from "./model/Gate";
import { Source } from "./model/Source";
import { Converter, Recipe } from "./model/Converter";

// ── Constantes de layout ──────────────────────────────────
const W = 1100;  // largura do SVG
const H = 530;   // altura do SVG
const R = 33;    // raio dos nós circulares

// X das colunas
const NX = { src: 70, res: 205, gate: 350 };
const NX2 = { stock: 500, conv: 660 };

// Y das linhas
const NY = {
  top: 85,
  main: 235,
  bot: 385,
  convAB: 160,
  convBC: 310,
  real: 465,
};

// Modos disponíveis do Gate
type GateMode = Gate["mode"];
const MODES: { id: GateMode; label: string; desc: string; transferAmount: number }[] = [
  {
    id: "roundRobin",
    label: "Round Robin",
    desc: "Alterna entre Comum, Raro e Lendário a cada tick",
    transferAmount: 1,
  },
  {
    id: "chance",
    label: "Chance",
    desc: "80% de chance para Comum, 15% para Raro, 5% para Lendário",
    transferAmount: 1,
  },
  {
    id: "equalSplit",
    label: "Divisão Igual",
    desc: "Envia 1 recurso para cada canal por tick (usa 3 por tick)",
    transferAmount: 3,
  },
  {
    id: "priority",
    label: "Prioridade",
    desc: "Comum tem prioridade; Raro e Lendário só recebem se os anteriores estiverem cheios",
    transferAmount: 1,
  },
];

// ── Configuração da simulação ──────────────────────────────
function buildSim() {
  const stockRes = new Stock("Recurso");
  const stockA   = new Stock("Recurso");
  const stockB   = new Stock("Recurso");
  const stockC   = new Stock("Recurso");
  const stockReal = new Stock("Real");

  const src     = new Source("Gerador",    stockRes,  "Recurso");
  const srcReal = new Source("FonteReal",  stockReal, "Real", 1);

  const gate = new Gate("Distribuidor", [stockRes], [stockA, stockB, stockC], "Recurso", 1);
  gate.chanceDistribution = [0.80, 0.15, 0.05];
  gate.priorityList = [0, 1, 2];

  const convComToRar = new Converter(
    "ConvComRar", stockA, stockB,
    new Recipe([{ type: "Recurso", amount: 50 }], [{ type: "Recurso", amount: 1 }])
  );
  const convRarToLend = new Converter(
    "ConvRarLend", stockB, stockC,
    new Recipe([{ type: "Recurso", amount: 30 }], [{ type: "Recurso", amount: 1 }])
  );
  const convReal = new Converter(
    "ConvReal", stockReal, stockC,
    new Recipe([{ type: "Real", amount: 50 }], [{ type: "Recurso", amount: 1 }])
  );

  const sim = new Simulator();
  sim.addStock(stockRes);
  sim.addStock(stockA);
  sim.addStock(stockB);
  sim.addStock(stockC);
  sim.addStock(stockReal);
  sim.addSource(src);
  sim.addSource(srcReal);
  sim.addGate(gate);
  sim.addConverter(convComToRar);
  sim.addConverter(convRarToLend);
  sim.addConverter(convReal);
  // Drenos removidos — não consomem mais os estoques

  return { sim, stockRes, stockA, stockB, stockC, stockReal, src, gate, convComToRar, convRarToLend, convReal };
}

function amt(stock: Stock, type: string): number {
  return stock.tokens.get(type)?.amount ?? 0;
}

type Arrow = { x1: number; y1: number; x2: number; y2: number; active: boolean };

// ── Componente principal ───────────────────────────────────
export default function App() {
  const simRef = useRef(buildSim());

  const [tick, setTick]                       = useState(0);
  const [gateFired, setGateFired]             = useState(false);
  const [gateTargets, setGateTargets]         = useState<number[]>([]);
  const [animKey, setAnimKey]                 = useState(0);
  const [convComToRarFired, setConvComToRarFired] = useState(false);
  const [convRarToLendFired, setConvRarToLendFired] = useState(false);
  const [convRealFired, setConvRealFired]     = useState(false);
  const totalGeneratedRef                     = useRef(0);
  const cumulativeARef                        = useRef(0);
  const cumulativeBRef                        = useRef(0);
  const cumulativeCRef                        = useRef(0);
  const cumulativeRealRef                     = useRef(0);
  const [totalGenerated, setTotalGenerated]   = useState(0);
  const [cumulativeA, setCumulativeA]         = useState(0);
  const [cumulativeB, setCumulativeB]         = useState(0);
  const [cumulativeC, setCumulativeC]         = useState(0);
  const [cumulativeReal, setCumulativeReal]   = useState(0);
  const [running, setRunning]                 = useState(false);
  const [speed, setSpeed]                     = useState(1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gateMode, setGateMode]               = useState<GateMode>("roundRobin");
  const [sourceRate, setSourceRate]           = useState(1);

  const doTick = useCallback(() => {
    const { sim, stockA, stockB, stockC, stockReal, gate, convComToRar, convRarToLend, convReal } = simRef.current;
    sim.tick();
    totalGeneratedRef.current += simRef.current.src.rate;

    // Contabiliza total histórico enviado a cada stock (gate)
    if (gate.wasSuccessful) {
      if (gate.activeTargetIndices.includes(0)) cumulativeARef.current += gate.transferAmount;
      if (gate.activeTargetIndices.includes(1)) cumulativeBRef.current += gate.transferAmount;
      if (gate.activeTargetIndices.includes(2)) cumulativeCRef.current += gate.transferAmount;
    }
    // Contabiliza contribuições dos conversores
    if (convComToRar.wasSuccessful)  cumulativeBRef.current += 1;
    if (convRarToLend.wasSuccessful) cumulativeCRef.current += 1;
    if (convReal.wasSuccessful)      cumulativeCRef.current += 1;
    // Acumula reais gerados (srcReal gera 1 por tick)
    cumulativeRealRef.current += 1;

    setTick(sim.tickCount);
    setTotalGenerated(totalGeneratedRef.current);
    setGateFired(gate.wasSuccessful);
    setGateTargets([...gate.activeTargetIndices]);
    setConvComToRarFired(convComToRar.wasSuccessful);
    setConvRarToLendFired(convRarToLend.wasSuccessful);
    setConvRealFired(convReal.wasSuccessful);
    setCumulativeA(cumulativeARef.current);
    setCumulativeB(cumulativeBRef.current);
    setCumulativeC(cumulativeCRef.current);
    setCumulativeReal(cumulativeRealRef.current);
    setAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(doTick, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, speed, doTick]);

  const handleSourceRate = (delta: number) => {
    const next = Math.max(1, Math.min(10, sourceRate + delta));
    simRef.current.src.rate = next;
    setSourceRate(next);
  };

  const handleModeChange = (mode: GateMode) => {
    const cfg = MODES.find((m) => m.id === mode)!;
    simRef.current.gate.mode = mode;
    simRef.current.gate.transferAmount = cfg.transferAmount;
    setGateMode(mode);
  };

  const handleReset = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    simRef.current = buildSim();
    simRef.current.gate.mode = gateMode;
    simRef.current.gate.transferAmount = MODES.find((m) => m.id === gateMode)!.transferAmount;
    simRef.current.src.rate = sourceRate;
    totalGeneratedRef.current = 0;
    cumulativeARef.current = 0;
    cumulativeBRef.current = 0;
    cumulativeCRef.current = 0;
    cumulativeRealRef.current = 0;
    setTick(0);
    setTotalGenerated(0);
    setGateFired(false);
    setGateTargets([]);
    setConvComToRarFired(false);
    setConvRarToLendFired(false);
    setConvRealFired(false);
    setCumulativeA(0);
    setCumulativeB(0);
    setCumulativeC(0);
    setCumulativeReal(0);
    setAnimKey(0);
  };

  const gateLeftTip  = NX.gate - R;
  const gateRightTip = NX.gate + R;

  const arrows: Arrow[] = [
    { x1: NX.src + R + 4,      y1: NY.main, x2: NX.res - R - 4,       y2: NY.main,    active: animKey > 0 },
    { x1: NX.res + R + 4,      y1: NY.main, x2: gateLeftTip - 4,       y2: NY.main,    active: gateFired },
    { x1: gateRightTip + 4,    y1: NY.main, x2: NX2.stock - R - 4,     y2: NY.top,     active: gateFired && gateTargets.includes(0) },
    { x1: gateRightTip + 4,    y1: NY.main, x2: NX2.stock - R - 4,     y2: NY.main,    active: gateFired && gateTargets.includes(1) },
    { x1: gateRightTip + 4,    y1: NY.main, x2: NX2.stock - R - 4,     y2: NY.bot,     active: gateFired && gateTargets.includes(2) },
    { x1: NX2.stock + R + 4,   y1: NY.top,  x2: NX2.conv - R - 4,      y2: NY.convAB,  active: convComToRarFired },
    { x1: NX2.conv,             y1: NY.convAB + R + 4, x2: NX2.stock,   y2: NY.main - R - 4, active: convComToRarFired },
    { x1: NX2.stock + R + 4,   y1: NY.main, x2: NX2.conv - R - 4,      y2: NY.convBC,  active: convRarToLendFired },
    { x1: NX2.conv,             y1: NY.convBC + R + 4, x2: NX2.stock,   y2: NY.bot - R - 4,  active: convRarToLendFired },
    { x1: NX.src + R + 4,      y1: NY.real, x2: NX.res - R - 4,        y2: NY.real,    active: animKey > 0 },
    { x1: NX.res + R + 4,      y1: NY.real, x2: NX.gate - R - 4,       y2: NY.real,    active: convRealFired },
    { x1: NX.gate + R + 4,     y1: NY.real, x2: NX2.stock - R - 4,     y2: NY.bot,     active: convRealFired },
  ];

  const currentMode = MODES.find((m) => m.id === gateMode)!;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simulador Machweb</h1>
        <p>Tick: <strong>{tick}</strong></p>
      </header>

      <div className="diagram-card">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
          <defs>
            <marker id="arr-gray" viewBox="0 0 8 6" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#555" />
            </marker>
            <marker id="arr-gold" viewBox="0 0 8 6" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#ffd700" />
            </marker>
          </defs>

          {/* Linhas guia Gate → canais */}
          <line x1={gateRightTip} y1={NY.main} x2={NX2.stock - R} y2={NY.top}  stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={gateRightTip} y1={NY.main} x2={NX2.stock - R} y2={NY.main} stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={gateRightTip} y1={NY.main} x2={NX2.stock - R} y2={NY.bot}  stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          {/* Linhas guia Conversores crafting */}
          <line x1={NX2.stock + R} y1={NY.top}  x2={NX2.conv - R} y2={NY.convAB}   stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={NX2.conv}      y1={NY.convAB + R} x2={NX2.stock} y2={NY.main - R} stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={NX2.stock + R} y1={NY.main} x2={NX2.conv - R} y2={NY.convBC}   stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={NX2.conv}      y1={NY.convBC + R} x2={NX2.stock} y2={NY.bot - R}  stroke="#2a2e3e" strokeWidth={2} strokeDasharray="6 4" />
          {/* Linhas guia Fluxo Real */}
          <line x1={NX.src + R}  y1={NY.real} x2={NX.res - R}    y2={NY.real} stroke="#1a3a1a" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={NX.res + R}  y1={NY.real} x2={NX.gate - R}   y2={NY.real} stroke="#1a3a1a" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={NX.gate + R} y1={NY.real} x2={NX2.stock - R} y2={NY.bot}  stroke="#1a3a1a" strokeWidth={2} strokeDasharray="6 4" />

          {/* Setas */}
          {arrows.map((a, i) => (
            <g key={i}>
              {a.active ? (
                <>
                  <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#ffd700" strokeWidth={3} markerEnd="url(#arr-gold)" />
                  <circle
                    key={`tok-${i}-${animKey}`}
                    cx={a.x1} cy={a.y1} r={7}
                    fill="#ffd700" stroke="#fff" strokeWidth={1.5}
                    style={{ animation: "tokenSlide 0.55s ease-out forwards", "--dx": `${a.x2 - a.x1}px`, "--dy": `${a.y2 - a.y1}px` } as React.CSSProperties}
                  />
                </>
              ) : (
                <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#444" strokeWidth={2} markerEnd="url(#arr-gray)" />
              )}
            </g>
          ))}

          {/* Fonte (jogo) */}
          <g transform={`translate(${NX.src},${NY.main})`}>
            <circle r={R} fill="#1a6b33" stroke={animKey > 0 ? "#4caf50" : "#2a9347"} strokeWidth={animKey > 0 ? 4 : 2} />
            {animKey > 0 && <circle key={`glow-src-${animKey}`} r={R} fill="none" stroke="#4caf50" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={26} fontWeight="bold">+</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Fonte</text>
            <text textAnchor="middle" fill="#888" fontSize={10} y={R + 34}>+{sourceRate} / tick</text>
          </g>

          {/* Reserva */}
          <g transform={`translate(${NX.res},${NY.main})`}>
            <circle r={R} fill="#144a6e" stroke="#2980b9" strokeWidth={2} />
            <text textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" y={-6}>{totalGenerated}</text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={10}>gerados</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Reserva</text>
          </g>

          {/* Gate */}
          <g transform={`translate(${NX.gate},${NY.main})`}>
            <polygon
              points={`${-R},0 ${-R*.5},${-R*.86} ${R*.5},${-R*.86} ${R},0 ${R*.5},${R*.86} ${-R*.5},${R*.86}`}
              fill={gateFired ? "#0d5e6b" : "#06303a"} stroke={gateFired ? "#00d4ff" : "#0a4a57"} strokeWidth={gateFired ? 3 : 2}
            />
            {gateFired && <polygon key={`glow-gate-${animKey}`} points={`${-R},0 ${-R*.5},${-R*.86} ${R*.5},${-R*.86} ${R},0 ${R*.5},${R*.86} ${-R*.5},${R*.86}`} fill="none" stroke="#00d4ff" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={18}>⬡</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Gate</text>
            <text textAnchor="middle" fill="#00d4ff" fontSize={10} y={R + 34}>{currentMode.label}</text>
          </g>

          {/* Comum */}
          <g transform={`translate(${NX2.stock},${NY.top})`}>
            <circle r={R} fill="#144a6e" stroke={gateFired && gateTargets.includes(0) ? "#ffd700" : "#2980b9"} strokeWidth={gateFired && gateTargets.includes(0) ? 3 : 2} />
            <text textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" y={-6}>{cumulativeA}</text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={10}>acumulados</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Comum</text>
          </g>

          {/* Raro */}
          <g transform={`translate(${NX2.stock},${NY.main})`}>
            <circle r={R} fill="#144a6e" stroke={gateFired && gateTargets.includes(1) ? "#ffd700" : "#2980b9"} strokeWidth={gateFired && gateTargets.includes(1) ? 3 : 2} />
            <text textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" y={-6}>{cumulativeB}</text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={10}>acumulados</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Raro</text>
          </g>

          {/* Lendário */}
          <g transform={`translate(${NX2.stock},${NY.bot})`}>
            <circle r={R} fill="#144a6e" stroke={gateFired && gateTargets.includes(2) ? "#ffd700" : "#2980b9"} strokeWidth={gateFired && gateTargets.includes(2) ? 3 : 2} />
            <text textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" y={-6}>{cumulativeC}</text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={10}>acumulados</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Lendário</text>
          </g>

          {/* Conversor Comum → Raro (50:1) */}
          <g transform={`translate(${NX2.conv},${NY.convAB})`}>
            <polygon points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill={convComToRarFired ? "#5a3a00" : "#2a1a00"} stroke={convComToRarFired ? "#ffa500" : "#7a5000"} strokeWidth={convComToRarFired ? 3 : 2} />
            {convComToRarFired && <polygon key={`glow-cAB-${animKey}`} points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill="none" stroke="#ffa500" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" dominantBaseline="central" fill={convComToRarFired ? "#ffd700" : "#aaa"} fontSize={11} fontWeight="bold">50:1</text>
            <text textAnchor="middle" fill="#ccc" fontSize={10} fontWeight="600" y={R + 16}>Com→Rar</text>
          </g>

          {/* Conversor Raro → Lendário (30:1) */}
          <g transform={`translate(${NX2.conv},${NY.convBC})`}>
            <polygon points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill={convRarToLendFired ? "#5a3a00" : "#2a1a00"} stroke={convRarToLendFired ? "#ffa500" : "#7a5000"} strokeWidth={convRarToLendFired ? 3 : 2} />
            {convRarToLendFired && <polygon key={`glow-cBC-${animKey}`} points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill="none" stroke="#ffa500" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" dominantBaseline="central" fill={convRarToLendFired ? "#ffd700" : "#aaa"} fontSize={11} fontWeight="bold">30:1</text>
            <text textAnchor="middle" fill="#ccc" fontSize={10} fontWeight="600" y={R + 16}>Rar→Lend</text>
          </g>

          {/* Separador Dinheiro Real */}
          <line x1={20} y1={NY.real - 28} x2={W - 20} y2={NY.real - 28} stroke="#2a2e3e" strokeWidth={1} strokeDasharray="4 6" />
          <text x={20} y={NY.real - 14} fill="#555" fontSize={10}>— Dinheiro Real —</text>

          {/* Fonte Real */}
          <g transform={`translate(${NX.src},${NY.real})`}>
            <circle r={R} fill="#1a4a1a" stroke={animKey > 0 ? "#4caf50" : "#2a7a2a"} strokeWidth={animKey > 0 ? 4 : 2} />
            {animKey > 0 && <circle key={`glow-srcR-${animKey}`} r={R} fill="none" stroke="#4caf50" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={18} fontWeight="bold">R$</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Fonte Real</text>
            <text textAnchor="middle" fill="#888" fontSize={10} y={R + 34}>+R$1 / tick</text>
          </g>

          {/* Carteira (stockReal) */}
          <g transform={`translate(${NX.res},${NY.real})`}>
            <circle r={R} fill="#1a4a1a" stroke="#2e7d32" strokeWidth={2} />
            <text textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" y={-6}>{cumulativeReal}</text>
            <text textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} y={10}>acumulados</text>
            <text textAnchor="middle" fill="#ccc" fontSize={12} fontWeight="600" y={R + 18}>Carteira</text>
          </g>

          {/* Conversor Real → Lendário */}
          <g transform={`translate(${NX.gate},${NY.real})`}>
            <polygon points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill={convRealFired ? "#5a3a00" : "#2a1a00"} stroke={convRealFired ? "#ffa500" : "#7a5000"} strokeWidth={convRealFired ? 3 : 2} />
            {convRealFired && <polygon key={`glow-cReal-${animKey}`} points={`0,${-R} ${R},0 0,${R} ${-R},0`} fill="none" stroke="#ffa500" strokeWidth={2} style={{ animation: "nodeGlow 0.55s ease-out forwards" }} />}
            <text textAnchor="middle" fill={convRealFired ? "#ffd700" : "#aaa"} fontSize={9} fontWeight="bold" y={-4}>R$50</text>
            <text textAnchor="middle" fill={convRealFired ? "#ffd700" : "#aaa"} fontSize={9} fontWeight="bold" y={8}>→ 1</text>
            <text textAnchor="middle" fill="#ccc" fontSize={10} fontWeight="600" y={R + 16}>Real→Lend</text>
          </g>
        </svg>
      </div>

      {/* Seletor de Modo */}
      <div className="mode-section">
        <p className="mode-title">Modo do Gate:</p>
        <div className="mode-buttons">
          {MODES.map((m) => (
            <button key={m.id} className={`btn-mode ${gateMode === m.id ? "active" : ""}`} onClick={() => handleModeChange(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="mode-desc">{currentMode.desc}</p>
      </div>

      {/* Controle taxa Fonte */}
      <div className="mode-section">
        <p className="mode-title">Recursos gerados por tick (Fonte):</p>
        <div className="rate-row">
          <button className="rate-btn" onClick={() => handleSourceRate(-1)} disabled={sourceRate <= 1}>−</button>
          <span className="rate-value">{sourceRate}</span>
          <button className="rate-btn" onClick={() => handleSourceRate(1)} disabled={sourceRate >= 10}>+</button>
        </div>
        <p className="mode-desc">
          A Fonte gera <strong style={{ color: "#ffd700" }}>{sourceRate}</strong> recurso{sourceRate > 1 ? "s" : ""} por tick.
          {sourceRate > 1 && " Maior geração acelera o enchimento dos canais."}
        </p>
      </div>

      {/* Controles */}
      <div className="controls">
        <button className={`btn ${running ? "btn-pause" : "btn-play"}`} onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pausar" : "▶ Iniciar"}
        </button>
        <button className="btn btn-step" onClick={doTick} disabled={running}>⏭ Avançar 1 Tick</button>
        <button className="btn btn-reset" onClick={handleReset}>🔄 Reiniciar</button>
        <label className="speed-label">
          Velocidade:
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="speed-select">
            <option value={2000}>Lenta (2 s/tick)</option>
            <option value={1000}>Normal (1 s/tick)</option>
            <option value={500}>Rápida (0,5 s/tick)</option>
            <option value={200}>Turbo (0,2 s/tick)</option>
          </select>
        </label>
      </div>

      {/* Legenda */}
      <div className="legend">
        <LegendItem shape="circle"  color="#1a6b33" border="#4caf50" label="Fonte — gera recursos" />
        <LegendItem shape="circle"  color="#144a6e" border="#2980b9" label="Estoque — armazena" />
        <LegendItem shape="hex"     color="#0d5e6b" border="#00d4ff" label="Gate — distribui recursos" />
        <LegendItem shape="diamond" color="#2a1a00" border="#ffa500" label="Conversor — transforma recursos" />
        <LegendItem shape="circle"  color="#1a4a1a" border="#4caf50" label="Dinheiro Real — R$50 = 1 Lendário" />
      </div>
    </div>
  );
}

function LegendItem({ shape, color, border, label }: { shape: "circle" | "hex" | "diamond"; color: string; border: string; label: string }) {
  return (
    <div className="legend-item">
      <span className="legend-icon">
        <svg width={16} height={16} viewBox="0 0 16 16">
          {shape === "circle"  && <circle cx={8} cy={8} r={6.5} fill={color} stroke={border} strokeWidth={1.5} />}
          {shape === "hex"     && <polygon points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5" fill={color} stroke={border} strokeWidth={1.5} />}
          {shape === "diamond" && <polygon points="8,1 15,8 8,15 1,8" fill={color} stroke={border} strokeWidth={1.5} />}
        </svg>
      </span>
      <span>{label}</span>
    </div>
  );
}
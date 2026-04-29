import { Stock } from "./Stock";
import { Token } from "./Token";



export class Gate {
  id: string;
  sources: Stock []; 
  targets: Stock []; 
  resourceType: string; 
  transferAmount: number; 
  lastTargetIndex: number = 0; // Para controle de Round Robin
  lastSourceIndex: number = 0; // Para controle de Round Robin
  chanceDistribution: number[] = []; // Para modo Chance (ex: [0.5, 0.2, 0.3] para 3 targets)
  priorityList: number[] = []; // Para modo Prioridade (ex: [0, 2, 1] para 3 targets, onde 0 é o mais prioritário)
  // Moodo de operação: Round Robin (tenta transferir de cada gate a cada tick, se tiver recurso suficiente); Chance de transferência (ex: 50% de chance de transferir para o primeiro, 20% de transferir para o segundo, 30% para o terceiro); Dividir recursos igualmente entre os gates (se tiver 10 unidades para transferir e 2 gates, cada um tenta transferir 5 unidades); Prioridade (sempre tenta transferir para o gate de maior prioridade primeiro)
  mode: "roundRobin" | "chance" | "equalSplit" | "priority" = "roundRobin";

  constructor(
    id: string,
    sources: Stock [],
    targets: Stock [],
    resourceType: string,
    transferAmount: number = 1
  ) {
    this.id = id;
    this.sources = sources;
    this.targets = targets;
    this.resourceType = resourceType;
    this.transferAmount = transferAmount;
  }

  /* Abrir o gate (permite transferência)
  open() {
    this.isOpen = true;
  }

  // Fechar o gate (bloqueia transferência)
  close() {
    this.isOpen = false;
  }

  // Alternar estado (aberto ↔ fechado)
  toggle() {
    this.isOpen = !this.isOpen;
  }
  */

  tickRoundRobin(){
    // Tenta transferir do próximo stock de origem para o próximo stock de destino
    const source = this.sources[this.lastSourceIndex];
    const target = this.targets[this.lastTargetIndex];
    const tokenToTransfer = new Token(this.resourceType, this.transferAmount); 

    if (source.has(tokenToTransfer)) {
      source.remove(tokenToTransfer);
      target.add(tokenToTransfer);
    } 
    // Atualiza os índices para o próximo tick
    this.lastSourceIndex = (this.lastSourceIndex + 1) % this.sources.length;
    this.lastTargetIndex = (this.lastTargetIndex + 1) % this.targets.length;
    
  }

  // Executar transferência (chamado a cada tick)
  tick() {
    switch(this.mode) {
      case "roundRobin":
        this.tickRoundRobin();
        break;
      // Implementar outros modos (chance, equalSplit, priority) conforme necessário
    }
  }
}

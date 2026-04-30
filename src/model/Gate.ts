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

  tickChance(){
    // Implementar lógica de transferência baseada em chance
    const targetIndex = this.selectTargetByChance();
    const source = this.sources[0]; // Para simplicidade, sempre tenta transferir do primeiro stock de origem
    const target = this.targets[targetIndex];
    const tokenToTransfer = new Token(this.resourceType, this.transferAmount);
      
    if (source.has(tokenToTransfer)) {
      source.remove(tokenToTransfer);
      target.add(tokenToTransfer);
    }
  }

  selectTargetByChance(): number {
    const rand = Math.random();
    let cumulativeChance = 0; 
    for (let i = 0; i < this.chanceDistribution.length; i++) {
      cumulativeChance += this.chanceDistribution[i];
      if (rand < cumulativeChance) {
        return i;
      } 
    }
    return this.chanceDistribution.length - 1; // Retorna o último índice como fallback
  }

  tickEqualSplit(){
    // Implementar lógica de divisão igualitária dos recursos entre os targets
    const source = this.sources[0]; // Para simplicidade, sempre tenta transferir do primeiro stock de origem
    const totalTargets = this.targets.length;
    const tokenToTransfer = new Token(this.resourceType, Math.floor(this.transferAmount / totalTargets));

    if (source.has(tokenToTransfer)) {  
      source.remove(tokenToTransfer);
      this.targets.forEach(target => target.add(tokenToTransfer));
    } 
  }

  tickPriority(){
    // Implementar lógica de transferência baseada em prioridade
    const source = this.sources[0]; // Para simplicidade, sempre tenta transferir do primeiro stock de origem
    for (let i = 0; i < this.priorityList.length; i++) {
      const targetIndex = this.priorityList[i];
      const target = this.targets[targetIndex];
      const tokenToTransfer = new Token(this.resourceType, this.transferAmount);
      if (source.has(tokenToTransfer)) {
        source.remove(tokenToTransfer);
        target.add(tokenToTransfer);
        break; // Para após transferir para o primeiro target disponível na lista de prioridade
      }
    }
  }


  // Executar transferência (chamado a cada tick)
  tick() {
    switch(this.mode) {
      case "roundRobin":
        this.tickRoundRobin();
        break;
      case "chance":
        this.tickChance();
        break;
      case "equalSplit":
        this.tickEqualSplit();
        break;
      case "priority":
        this.tickPriority();
        break;
      default:
        this.tickRoundRobin(); // Padrão para Round Robin
    }
  }
}

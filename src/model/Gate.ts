import { Stock } from "./Stock";
import { Token } from "./Token";

export class Gate {
  id: string;
  sourceStock: Stock; 
  targetStock: Stock; 
  resourceType: string; 
  transferAmount: number; 
  isOpen: boolean; 

  constructor(
    id: string,
    sourceStock: Stock,
    targetStock: Stock,
    resourceType: string,
    transferAmount: number = 1
  ) {
    this.id = id;
    this.sourceStock = sourceStock;
    this.targetStock = targetStock;
    this.resourceType = resourceType;
    this.transferAmount = transferAmount;
    this.isOpen = true; // Por padrão, abre
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

  // Executar transferência (chamado a cada tick)
  tick() {
    /* Só transfere se estiver aberto
    if (!this.isOpen) {
      return;
    }
    */

    // Criar token com a quantidade a transferir
    const tokenToTransfer = new Token(this.resourceType, this.transferAmount);

    // Verificar se o stock de origem tem o recurso
    if (this.sourceStock.has(tokenToTransfer)) {
      // Remove do stock de origem
      this.sourceStock.remove(tokenToTransfer);
      // Adiciona ao stock de destino
      this.targetStock.add(tokenToTransfer);
    }
  }
}

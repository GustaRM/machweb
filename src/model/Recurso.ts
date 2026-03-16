// Classe que representa um recurso coletável
// Exemplos: madeira, minério, fibra (usados para craftar itens)
export class Recurso {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // tipo do recurso: madeira, minério, etc
  quantidade: number; // quantidade atual que o jogador tem
  limiteMaximo: number; // quantidade máxima que pode ter

  constructor(
    id: string,
    nome: string,
    tipo: string,
    quantidade: number = 0,
    limiteMaximo: number = 999,
    descricao: string = ''
  ) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.quantidade = quantidade;
    this.limiteMaximo = limiteMaximo;
    this.descricao = descricao;
  }

  // Adiciona quantidade do recurso
  adicionarQuantidade(valor: number): void {
    this.quantidade += valor;
    // Se ultrapassar o limite, ajusta para o máximo
    if (this.quantidade > this.limiteMaximo) {
      this.quantidade = this.limiteMaximo;
    }
  }

  // Remove quantidade do recurso
  removerQuantidade(valor: number): boolean {
    // Verifica se tem quantidade suficiente
    if (valor > this.quantidade) {
      return false;
    }
    this.quantidade -= valor;
    return true;
  }

  // Retorna a quantidade atual
  obterQuantidade(): number {
    return this.quantidade;
  }

  // Verifica se o estoque está cheio
  estaCheia(): boolean {
    return this.quantidade >= this.limiteMaximo;
  }

  // Verifica se o estoque está vazio
  estaVazia(): boolean {
    return this.quantidade === 0;
  }

  // Retorna o nome do recurso
  obterNome(): string {
    return this.nome;
  }
}

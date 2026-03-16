// Classe que representa um bem (item) no jogo
// Exemplos: armas, armaduras, itens cosméticos
export class Bem {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  raridade: string; // comum, incomum, raro, épico, lendário
  quantidade: number; // quantos itens o jogador tem

  constructor(
    id: string,
    nome: string,
    categoria: string,
    raridade: string = 'comum',
    quantidade: number = 1,
    descricao: string = ''
  ) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.raridade = raridade;
    this.quantidade = quantidade;
    this.descricao = descricao;
  }

  // Adiciona quantidade do item
  adicionarQuantidade(valor: number): void {
    this.quantidade += valor;
  }

  // Remove quantidade do item
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

  // Retorna o nome do item
  obterNome(): string {
    return this.nome;
  }

  // Retorna a raridade do item
  obterRaridade(): string {
    return this.raridade;
  }
}

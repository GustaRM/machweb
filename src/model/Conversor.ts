// Classe que representa um conversor
// Serve para TRANSFORMAR um tipo de coisa em outra
// Exemplos: crafting de itens, fusão, alquimia
export class Conversor {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // tipo de conversão: 'crafting', 'fusão', 'alquimia'
  ativa: boolean; // se está funcionando ou não
  totalConversoes: number; // quantas conversões foram feitas

  entradaRequisitada: string; // o que precisa para fazer a conversão
  saidaProduzida: string; // o que vai ser produzido

  constructor(
    id: string,
    nome: string,
    tipo: string = 'crafting',
    descricao: string = ''
  ) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.descricao = descricao;
    this.ativa = true; // começa ativada
    this.totalConversoes = 0;
    this.entradaRequisitada = '';
    this.saidaProduzida = '';
  }

  // Retorna o nome do conversor
  obterNome(): string {
    return this.nome;
  }

  // Retorna o tipo de conversão
  obterTipo(): string {
    return this.tipo;
  }

  // Ativa ou desativa o conversor
  definirAtiva(ativa: boolean): void {
    this.ativa = ativa;
  }

  // Verifica se está ativo
  estaAtivo(): boolean {
    return this.ativa;
  }

  // Define o que é necessário para converter
  definirEntrada(requisito: string): void {
    this.entradaRequisitada = requisito;
  }

  // Define o que vai ser produzido
  definirSaida(produto: string): void {
    this.saidaProduzida = produto;
  }

  // Executa a conversão
  converter(): boolean {
    // Só converte se estiver ativa
    if (!this.ativa) {
      return false;
    }
    this.totalConversoes += 1;
    return true;
  }

  // Retorna quantas conversões foram feitas
  obterTotalConversoes(): number {
    return this.totalConversoes;
  }
}

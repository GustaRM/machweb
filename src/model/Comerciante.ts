// Classe que representa um comerciante
// Serve para TROCAR itens entre jogadores ou com NPCs
// Não cria nem destrói nada, só redistribui (zero-sum)
// Exemplos: vendedor NPC, mercado entre jogadores
export class Comerciante {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // tipo de comerciante: 'npc', 'jogador', 'mercado'
  ativa: boolean; // se está funcionando ou não
  totalTrocas: number; // quantas trocas foram feitas
  taxaComissao: number; // percentual cobrado (0 a 100)

  oQueDa: string; // o que o comerciante vai dar
  oQueRecebe: string; // o que o comerciante quer receber

  constructor(
    id: string,
    nome: string,
    tipo: string = 'npc',
    taxaComissao: number = 0,
    descricao: string = ''
  ) {
    // Valida a taxa de comissão
    if (taxaComissao < 0 || taxaComissao > 100) {
      throw new Error('Taxa de comissão deve estar entre 0 e 100');
    }

    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.taxaComissao = taxaComissao;
    this.descricao = descricao;
    this.ativa = true; // começa ativado
    this.totalTrocas = 0;
    this.oQueDa = '';
    this.oQueRecebe = '';
  }

  // Retorna o nome do comerciante
  obterNome(): string {
    return this.nome;
  }

  // Retorna o tipo de comerciante
  obterTipo(): string {
    return this.tipo;
  }

  // Ativa ou desativa o comerciante
  definirAtiva(ativa: boolean): void {
    this.ativa = ativa;
  }

  // Verifica se está ativo
  estaAtivo(): boolean {
    return this.ativa;
  }

  // Define o que o comerciante vai dar
  definirOqueDa(oferta: string): void {
    this.oQueDa = oferta;
  }

  // Define o que o comerciante quer receber
  definirOqueRecebe(requisito: string): void {
    this.oQueRecebe = requisito;
  }

  // Retorna a taxa de comissão
  obterTaxaComissao(): number {
    return this.taxaComissao;
  }

  // Define a taxa de comissão
  definirTaxaComissao(taxa: number): void {
    // Valida antes de mudar
    if (taxa < 0 || taxa > 100) {
      throw new Error('Taxa de comissão deve estar entre 0 e 100');
    }
    this.taxaComissao = taxa;
  }

  // Executa uma troca
  trocar(): boolean {
    // Só troca se estiver ativo
    if (!this.ativa) {
      return false;
    }
    this.totalTrocas += 1;
    return true;
  }

  // Retorna quantas trocas foram feitas
  obterTotalTrocas(): number {
    return this.totalTrocas;
  }

  // Calcula quanto sera cobrado de comissão
  calcularComissao(valor: number): number {
    return (valor * this.taxaComissao) / 100;
  }
}

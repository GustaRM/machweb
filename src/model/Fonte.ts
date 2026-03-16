// Classe que representa uma fonte/torneira de recursos
// Exemplos: recompensa ao vencer um nível, bônus diário, loot de inimigos
// A Source CRIA recursos na economia
export class Fonte {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // que tipo de coisa ela gera: moeda, bem, recurso
  ativa: boolean; // se está funcionando ou não
  totalGerado: number; // rastreia quanto foi gerado até agora
  taxaGeracaoObjeto: string; // descrição do que vai ser gerado e quanto

  constructor(
    id: string,
    nome: string,
    tipo: string,
    descricao: string = ''
  ) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo; // 'moeda', 'bem', 'recurso'
    this.descricao = descricao;
    this.ativa = true; // começa ativada
    this.totalGerado = 0;
    this.taxaGeracaoObjeto = '';
  }

  // Retorna o nome da fonte
  obterNome(): string {
    return this.nome;
  }

  // Retorna o tipo de coisa que gera
  obterTipo(): string {
    return this.tipo;
  }

  // Ativa ou desativa a fonte
  definirAtiva(ativa: boolean): void {
    this.ativa = ativa;
  }

  // Verifica se está ativa
  estaAtiva(): boolean {
    return this.ativa;
  }

  // Define o que será gerado
  definirGerado(taxa: string): void {
    this.taxaGeracaoObjeto = taxa;
  }

  // Executa a geração de recursos
  gerar(): void {
    // Só gera se estiver ativa
    if (this.ativa) {
      this.totalGerado += 1;
    }
  }

  // Retorna quanto foi gerado no total
  obterTotalGerado(): number {
    return this.totalGerado;
  }
}

// Classe que representa um escoadouro/drenagem
// Serve para REMOVER permanentemente recursos da economia
// Exemplos: custo de manutenção, destruição de itens, taxa de imposto
// Isso ajuda a combater inflação
export class Escoadouro {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // que tipo de coisa ela remove
  ativa: boolean; // se está funcionando ou não
  totalRemovido: number; // rastreia quanto foi removido até agora
  requisito: string; // descrição do que vai ser removido e quanto

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
    this.totalRemovido = 0;
    this.requisito = '';
  }

  // Retorna o nome do escoadouro
  obterNome(): string {
    return this.nome;
  }

  // Retorna o tipo de coisa que remove
  obterTipo(): string {
    return this.tipo;
  }

  // Ativa ou desativa o escoadouro
  definirAtiva(ativa: boolean): void {
    this.ativa = ativa;
  }

  // Verifica se está ativa
  estaAtiva(): boolean {
    return this.ativa;
  }

  // Define o que será removido
  definirRemocao(requisito: string): void {
    this.requisito = requisito;
  }

  // Executa a remoção de recursos
  remover(): void {
    // Só remove se estiver ativa
    if (this.ativa) {
      this.totalRemovido += 1;
    }
  }

  // Retorna quanto foi removido no total
  obterTotalRemovido(): number {
    return this.totalRemovido;
  }
}

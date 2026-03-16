// Classe que representa uma moeda no jogo
// Pode ser moeda leve (obtida jogando) ou pesada (dinheiro real)
export class Moeda {
  id: string;
  nome: string;
  tipo: 'leve' | 'pesada';
  descricao: string;

  constructor(id: string, nome: string, tipo: 'leve' | 'pesada', descricao: string = '') {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.descricao = descricao;
  }

  // Retorna o ID da moeda
  obterID(): string {
    return this.id;
  }

  // Retorna o nome da moeda
  obterNome(): string {
    return this.nome;
  }

  // Retorna o tipo de moeda
  obterTipo(): string {
    return this.tipo;
  }

  // Retorna a descrição
  obterDescricao(): string {
    return this.descricao;
  }

  // Verifica se é moeda leve
  ehMoedaLeve(): boolean {
    return this.tipo === 'leve';
  }

  // Verifica se é moeda pesada
  ehMoedaPesada(): boolean {
    return this.tipo === 'pesada';
  }
}

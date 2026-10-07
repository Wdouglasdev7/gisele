/* Dados da loja. Fonte de cada um:
   - WhatsApp: passado pelo Washington (é o mesmo da bio do Instagram e da ficha do Google).
   - Endereço, CEP, horário e nota: ficha "Gisele Beatriz Acessórios" no Google (06/10/2026).
   - "Há mais de 14 anos": bio do Instagram.
   - Garantia de 1 ano e prata 925: descrição da própria loja na ficha do Google. */

export const config = {
  nome: 'Gisele Beatriz Acessórios',
  whatsapp: '5562991350635',
  instagram: 'giselebeatrizacessorios',
  endereco: 'Av. Tiradentes, 481, Loja 02',
  bairro: 'Centro',
  cidade: 'Anápolis, GO',
  cep: '75043-045',
  horarios: [
    { dias: 'Segunda a sexta', horas: '8h30 às 18h30' },
    { dias: 'Sábado', horas: '9h às 13h' },
  ],
  // perfil da loja no Google (link enviado pelo Washington)
  perfilGoogle: 'https://share.google/GdrLfPxRLNOi7oapB',
  rota: 'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Gisele Beatriz Acessórios, Av. Tiradentes, 481, Centro, Anápolis - GO, 75043-045'),
  nota: { valor: '5,0', avaliacoes: 77 },
  // false esconde todos os preços (aparece "Consultar valor")
  mostrarPrecos: true,
}

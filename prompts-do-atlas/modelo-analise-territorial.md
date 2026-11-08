# Modelo de prompt — análise territorial e detalhamento interno

Antes de enviar, preencher os campos abaixo e fornecer o arquivo `contexto-do-mapa-e-niveis-de-detalhe.md`, os dados atuais e as referências visuais pertinentes.

---

Você é um desenvolvedor sênior especializado em Three.js, TypeScript, cartografia digital e sistemas de informação geográfica.

Estamos desenvolvendo o **Atlas 3D do Mundo de Elarion**, um universo fictício de fantasia medieval. Leia o contexto e os arquivos anexados antes de responder.

## Território e objetivo

- **País ou território:** [NOME]
- **Continente:** [CONTINENTE]
- **ID existente, se conhecido:** [ID]
- **Escala a estudar:** [PAÍS / REGIÃO / LOCALIDADE]
- **Objetivo narrativo e territorial:** [EX.: REINO POPULOSO, MUITAS CASAS NOBRES E LOCALIDADES]
- **Proposta administrativa inicial:** [HIERARQUIA E QUANTIDADES, AINDA SUJEITAS À ANÁLISE]
- **Etapa deste pedido:** exclusivamente análise e recomendação, sem implementação.

## 1. Análise geográfica

Examine o polígono atual do território e os dados existentes. Apresente:

- Área territorial aproximada e unidade utilizada.
- Comprimento das fronteiras, identificando trechos terrestres e costeiros quando existirem.
- Países ou regiões vizinhas.
- Rios, lagos e bacias identificáveis.
- Cordilheiras, vales, passagens, florestas e áreas abertas.
- Áreas potencialmente habitáveis e adequadas a agricultura, abastecimento e comércio.
- Lacunas e divergências entre os dados vetoriais e a pintura.

Use a escala realmente configurada. Se não houver raio físico ou referência de distância aprovada, **não invente km² ou quilômetros**. Apresente medidas em unidades internas e explique como poderiam ser convertidas depois. Considere a projeção esférica ao medir a superfície do globo.

Não estime população, fertilidade, navegabilidade ou capacidade agrícola como fatos quando esses dados estiverem ausentes.

## 2. Avaliação administrativa

Avalie a proposta inicial considerando o tamanho relativo, a continuidade territorial, os obstáculos naturais e a necessidade de circulação e abastecimento.

Quando for uma monarquia feudal, considere a possibilidade de Rei → Duques → Condes → Barões, mas não imponha essa estrutura a sociedades que ainda não tenham tal organização aprovada.

Compare quantidades alternativas de divisões superiores e recomende quantidades de subdivisões. Informe as áreas médias, lembrando que níveis hierárquicos contêm os inferiores e não representam áreas adicionais somáveis.

Os números podem ser médias de planejamento, com distribuição desigual entre regiões. Avalie também um eventual domínio direto da Coroa.

## 3. Critérios para futuras fronteiras internas

Considere rios, bacias, divisores de relevo, desfiladeiros, vales, áreas férteis e possíveis rotas comerciais. Evite depender somente de linhas retas, células geométricas ou áreas iguais.

Não desenhe fronteiras nem crie ducados, condados, baronias ou nomes novos nesta etapa. Explique os critérios que orientariam sua distribuição depois da aprovação.

## 4. Espaço para localidades e zoom futuro

O território deverá poder receber, progressivamente, metrópoles, cidades de diferentes tamanhos, vilas, aldeias, castelos, fortalezas e propriedades rurais.

Avalie se as áreas propostas teriam espaço aberto e ligações territoriais para isso. Uma divisão pode conter muitas localidades. Não concentrar automaticamente as cidades em montanhas, florestas fechadas, água ou margens sem área útil.

Explique como esse planejamento poderia continuar da escala nacional até regiões, localidades, bairros, ruas e construções, preservando coordenadas e identidades existentes. Apresente somente orientações; não implemente níveis de detalhe ou funcionalidades.

## 5. Relatório esperado

1. Identificação e área do território, com unidade e metodologia.
2. Fronteiras, vizinhos e características geográficas.
3. Avaliação da estrutura administrativa proposta.
4. Quantidade recomendada de divisões e subdivisões.
5. Área média estimada de cada nível.
6. Possíveis dificuldades geográficas e de circulação.
7. Recomendações para cidades, povoamento, agricultura e comércio.
8. Informações ainda necessárias para confirmar a viabilidade.
9. Fontes do projeto consultadas e distinção entre dados, interpretação visual e proposta.

**Não altere o código ou a geografia. Não crie territórios, localidades ou funcionalidades. Aguarde minha aprovação antes de implementar.**

# Contexto do Atlas 3D do Mundo de Elarion

Use este contexto para compreender o projeto antes de analisar ou propor detalhes internos de um território. Consulte os arquivos atuais: este documento é um retrato do projeto em 7 de novembro de 2026.

## 1. Objetivo

O Atlas de Elarion representa o mundo de uma web novel de fantasia medieval. A experiência principal é um **globo 3D navegável**, com rotação, zoom, continentes, países, fronteiras e características naturais ilustradas.

O mundo deve ser detalhado progressivamente durante a escrita da história. O objetivo futuro é aproximar a câmera até explorar o interior dos países e, depois, localidades, bairros, ruas e construções. Cada etapa deve acrescentar detalhes associados às coordenadas e às identidades existentes.

## 2. Estado atual

Existem sete continentes e 94 nações cadastradas:

| Continente | Nações |
|---|---:|
| Aetheria | 18 |
| Varkhonia | 14 |
| Solméria | 16 |
| Eryndor | 12 |
| Drakmória | 11 |
| Namaris | 15 |
| Thal'Zor | 8 |

As nações têm nomes e identificadores estáveis, polígonos territoriais persistentes e um local proposto para cidade em cada país. Esses pontos são reservas de planejamento; não representam cidades já modeladas, nomeadas ou povoadas.

As fronteiras políticas atuais são propostas geradas com aleatoriedade determinística e posteriormente ajustadas em regiões específicas. Elas não mudam ao reiniciar o aplicativo.

Os contornos e as pinturas receberam revisões locais: ampliação de Eryndor e Namaris, ajustes de vegetação, rios, Drakmória habitável e correção da ligação terrestre entre Aetheria e Drakmória. A imagem original `mapa-mundi.png` continua sendo referência artística, mas não contém todas as alterações atuais.

## 3. Escala e coordenadas

- A referência global utiliza coordenadas normalizadas `[x, y]` de longitude e latitude.
- A longitude angular é `2πx`; a latitude é `π(0,5 − y)`. O norte fica acima na imagem.
- O raio visual configurado em `src/geography/coordinates.ts` é **1,8 unidades internas**.
- **O raio físico do planeta não está definido.** Não assumir dimensões terrestres nem inventar quilômetros ou quilômetros quadrados.
- Enquanto não existir escala física aprovada, apresentar medidas em unidades internas, informando se são medidas planas ou sobre a superfície esférica.
- Para converter comprimentos e áreas, é necessário um raio físico aprovado ou uma distância de referência que permita calibrá-lo.

## 4. Dados e aparência

A geografia possui representação própria em dados. A pintura cartográfica é composta de variantes regionais, com nomes e fronteiras renderizados separadamente.

Há rios, lagos e eixos de cordilheiras esquemáticos, mas o cadastro vetorial ainda não representa todos os elementos visíveis na pintura. Uma característica presente na imagem pode não possuir coordenadas detalhadas ou nome oficial.

O projeto ainda não possui um modelo físico detalhado de altitude, declividade, solos, fertilidade, clima, vazão dos rios, navegação, produção agrícola, população ou tempos de viagem. Inferências visuais devem ser apresentadas como hipóteses de planejamento, não como medições desses atributos.

## 5. Arquivos para consultar ou anexar

### Territórios e escala

- `src/data/world/nations.ts`: nomes e IDs das 94 nações.
- `src/data/world/political-map.json`: polígonos dos países e locais propostos de cidade.
- `src/data/world/coastlines.json`: contornos continentais e ilhas.
- `src/data/world/continents.ts`: cadastro continental, rios, lagos e cordilheiras esquemáticos.
- `src/data/world/terrain-revisions.json`: revisões locais de terreno e vegetação.
- `src/geography/coordinates.ts`: projeção e raio visual.
- `src/types/geography.ts`: estruturas de dados existentes.

### Revisões e renderização

- `src/data/world/polar-expansion.json`: terras acrescentadas a Eryndor e Namaris e suas regiões climáticas.
- `src/data/world/isthmus-repair.json`: correção do istmo Aetheria–Drakmória, afluente de Brenkar e lago de Mazdrin.
- `src/components/atlas/WorldScene.tsx`: composição das pinturas regionais atualmente usadas no globo.
- `public/assets/`: variantes de pintura; consultar a composição atual para escolher a referência correta.
- `README.md`: funcionamento, decisões de implementação e limitações.

### Universo e nomes

- `atlas_94_nacoes_webnovel.md`.
- `resumo_mundo_webnovel.md`.
- `sistema_poderes_webnovel.md`.
- `rascunho_religioes_webnovel.md`.

Para uma análise fora do ambiente do projeto, anexar os arquivos necessários ao chat. Não afirmar ter consultado arquivos locais aos quais o chat não tem acesso.

## 6. Desenvolvimento futuro por aproximação

| Escala planejada | Conteúdo |
|---|---|
| 0 — Mundo | Globo, continentes, oceanos e grandes características naturais. |
| 1 — Continente | Geografia regional e relações entre países. |
| 2 — País | Território nacional, grandes vias e principais localidades, quando aprovadas. |
| 3 — Divisões internas | Regiões e hierarquias como ducados, condados e baronias, conforme cada sociedade. |
| 4 — Localidade | Cidades, vilas, aldeias, castelos, fortalezas e propriedades rurais. |
| 5 — Bairro ou distrito | Organização interna das localidades. |
| 6 — Ruas e construções | Espaços urbanos e edificações individuais. |

Essa tabela é um plano de evolução. Os níveis detalhados ainda não estão implementados. A hierarquia feudal pode possuir vários graus dentro da escala regional; não precisa corresponder a uma única resolução gráfica.

Os detalhes novos devem manter os IDs existentes e usar uma relação de pertencimento: continente → país → região → sub-região → localidade → elementos locais. A implementação futura deverá permitir maior resolução local sem reconstruir o planeta inteiro, usando coordenadas consistentes e carregamento progressivo quando necessário.

## 7. Critérios para o interior dos países

- Divisões internas devem acompanhar rios, bacias, serras, desfiladeiros, vales, áreas abertas e ligações econômicas quando houver evidência suficiente.
- Os territórios podem ter tamanhos diferentes; terras férteis podem sustentar maior concentração de povoamento.
- Regiões montanhosas e florestais precisam ser avaliadas quanto a acesso e espaço útil. Não posicionar automaticamente uma cidade sobre picos, árvores, água ou faixas estreitas de terra.
- Cada território que deva receber uma cidade precisa ter uma área utilizável ao redor dela e possibilidade de abastecimento e circulação.
- Avaliar água, agricultura, travessias e rotas como requisitos de planejamento, deixando claras as informações ainda ausentes.
- O número de divisões administrativas não deve determinar, sozinho, o número de cidades e aldeias: um território pode conter muitas localidades.
- Uma capital pode ter um domínio direto da Coroa, quando essa organização for aprovada.

## 8. Regras de preservação e aprovação

Em pedidos de **análise**, não modificar código, fronteiras, costas, rios, lagos, montanhas ou nomes. Não criar divisões territoriais ou funcionalidades.

Apresentar separadamente os fatos presentes nos arquivos, as interpretações da imagem e as recomendações. Propostas ainda não aprovadas não devem ser tratadas como fatos do universo.

A implementação só deve começar quando o autor a solicitar explicitamente. Uma autorização para detalhar um território deve ser aplicada ao escopo indicado, preservando o restante do mundo.

## 9. Exemplo de planejamento ainda não aprovado

Para **Viremont, em Aetheria**, foi analisada a proposta de um reino com **6 ducados, 24 condados e 96 baronias**, na hierarquia Rei → Duques → Condes → Barões. A análise recomendou essa estrutura como ponto de partida flexível, condicionada ao detalhamento geográfico e à escala física futura.

Essa divisão não foi criada nem aprovada como definitiva. Os números não são uma regra geral para os outros países.

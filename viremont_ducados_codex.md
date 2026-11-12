# Viremont — Seis ducados e instruções para o Codex

> **Documento único do projeto. Estado: PROPOSTA EDITÁVEL.** Este arquivo reúne a proposta de organização feudal, a história curta de cada ducado e as instruções de implementação. O Codex deve mantê-lo no repositório como referência e não criar outros documentos de lore duplicados.

## 1. Contexto e fatos já identificados

- Viremont é uma nação de **Aetheria**; o projeto já possui seu polígono territorial (`aetheria-07`) e fronteiras nacionais.
- O levantamento técnico anterior identificou Viremont como a **3ª maior das 18 nações de Aetheria**, com cerca de **9,37% da área continental**. A área calculada foi **0,741 unidade interna²**, sem escala física em km² aprovada.
- Viremont é **interiorano, sem litoral**. Faz fronteira com **Helíria (norte), Aldéria (leste/nordeste), Arvend (leste/sudeste), Ordel (sudeste), Norvélia (sudoeste) e Serádia (oeste/noroeste)**.
- A arte atual mostra um corredor fluvial central e centro-ocidental, campos no norte e centro, bosques e uma região montanhosa ao sul/sudeste.
- **Atenção técnica:** o rio ilustrado ainda não corresponde a uma hidrografia vetorial cadastrada dentro de Viremont. Não o trate como linha geográfica precisa até que seja digitalizado e validado.
- Existe um **ponto de cidade proposto** no centro-norte; não foi definido se é capital.
- Modelo de planejamento: **1 reino → 6 ducados → 24 condados → 96 baronias**, como totais iniciais, e não uma obrigação de áreas iguais. A coroa pode possuir propriedades e direitos próprios dentro desses territórios, sem criar um sétimo ducado.

## 2. Seis ducados — nomes definidos e histórias provisórias

**Nomes definidos pelo autor:** Nortar, Valeris, Selvéria, Érdel, Montelur e Thargrund serão mantidos. Essa decisão aprova os nomes dos seis ducados; as histórias e demais detalhes propostos abaixo continuam sujeitos à revisão.

Os fatos históricos abaixo são **ficção proposta para o universo**, sujeitos à aprovação do autor. Não foram extraídos dos arquivos de geografia.

### 2.1 Ducado de Nortar — norte

**Paisagem:** campos abertos, vales de nascentes, bosques esparsos e acesso às rotas próximas de Helíria.

**Vocação:** cereais, criação de animais, celeiros e feiras rurais.

**História breve:** segundo a tradição local, Nortar cresceu quando famílias agricultoras construíram canais de drenagem e celeiros comunitários para sobreviver a uma sequência de invernos rigorosos. Seus duques ganharam influência não por conquistas militares, mas por fornecer mantimentos ao restante do reino. A memória dessas crises tornou a região cautelosa com guerras prolongadas.

### 2.2 Ducado de Valeris — centro e corredor fluvial

**Paisagem:** várzeas, confluências, campos cultivados e vias terrestres que acompanham os rios.

**Vocação:** mercados, transporte fluvial onde navegável, moinhos, cobrança de pedágios e oficinas.

**História breve:** Valeris nasceu da união de antigas feiras de travessia. Mercadores e proprietários disputavam pontes e portos interiores até que um acordo ducal padronizou pesos e taxas. A região tornou-se o coração comercial de Viremont, mas continua dependente da manutenção das pontes e do controle das cheias.

**Nota:** o local da cidade já proposta no mapa pode estar neste ducado, mas isso deverá ser verificado pelo Codex antes de ser registrado.

### 2.3 Ducado de Selvéria — oeste

**Paisagem:** florestas, colinas, clareiras cultiváveis e acessos a Serádia.

**Vocação:** madeira, resinas, caça regulamentada, carpintaria e comércio terrestre.

**História breve:** os primeiros senhores de Selvéria protegiam caminhos de floresta utilizados por caravanas. Ao longo de gerações, povoados cresceram ao redor de serrarias e postos de guarda. Um antigo pacto entre comunidades florestais e nobres locais restringiu o corte de certas matas, gerando conflitos periódicos com comerciantes de madeira.

### 2.4 Ducado de Érdel — leste e nordeste

**Paisagem:** florestas orientais, colinas e corredores de passagem para Aldéria e Arvend.

**Vocação:** comércio de fronteira, postos alfandegários, criação de animais e cultivo em clareiras.

**História breve:** Érdel se consolidou em torno de fortalezas de estrada e mercados de fronteira. Seus duques costumavam negociar acordos de passagem com os vizinhos, e a região aprendeu a prosperar mesmo em períodos de tensão diplomática. O comércio trouxe riqueza, mas também disputas sobre contrabando e tarifas.

### 2.5 Ducado de Montelur — sudoeste

**Paisagem:** vales, encostas, bosques e travessias em direção a Norvélia.

**Vocação:** agricultura de vale, criação de animais, pontes e hospedarias de rota.

**História breve:** Montelur começou como uma rede de povoados separados por colinas e cursos d'água. Uma família senhorial financiou caminhos e pontes para unir os vales, recebendo em troca direitos de passagem. A prosperidade local ainda depende de manter essas travessias abertas durante as chuvas.

### 2.6 Ducado de Thargrund — sul e sudeste

**Paisagem:** cordilheiras, sopés, desfiladeiros e pequenas áreas habitáveis entre montanhas.

**Vocação:** mineração quando houver jazidas confirmadas, pedreiras, forjas e defesa de passagens.

**História breve:** Thargrund surgiu de postos fortificados que protegiam os caminhos pelas serras. Pedreiros e ferreiros se estabeleceram junto às guarnições, formando cidades de montanha. A autoridade dos duques depende tanto das fortalezas quanto de manter abertas as rotas de abastecimento nos meses frios.

## 3. Organização feudal proposta

| Nível | Quantidade | Observação |
|---|---:|---|
| Reino de Viremont | 1 | Soberania nacional |
| Ducados | 6 | Nortar, Valeris, Selvéria, Érdel, Montelur e Thargrund |
| Condados | 24 | **Ainda sem nomes ou polígonos**; média de quatro por ducado |
| Baronias | 96 | **Ainda sem nomes ou polígonos**; média de quatro por condado |

As divisões administrativas **não são localidades**: cada ducado poderá conter muitas cidades, vilas, aldeias e propriedades. As fronteiras ducais devem ser contínuas, sem sobreposições nem lacunas dentro de Viremont. Não atribuir uma capital real definitiva nesta etapa. Caso o mapa mostre um domínio da Coroa, representar inicialmente como **camada de propriedade/jurisdição**, não como território adicional que diminua automaticamente os seis ducados.

### 3.1 Marquesados militares da Coroa

**Definido pelo autor:** Viremont terá marquesados concebidos como **pequenos territórios militares sob autoridade direta do rei**, com pessoal financiado pela Coroa. Essa é a função própria dos marquesados neste universo.

**Distribuição definida pelo autor:** serão **seis marquesados, um em cada ducado** — Nortar, Valeris, Selvéria, Érdel, Montelur e Thargrund —, cada um com um marquês. A autoridade direta do rei e o financiamento pela Coroa permanecem como base dessa organização.

**Área definida pelo autor:** o marquesado ocupará **10% da área do respectivo ducado**. Os 90% restantes ficam disponíveis para o planejamento dos demais territórios internos, respeitando a hierarquia entre condados e baronias. A distribuição detalhada dessas terras ainda será definida.

**Etapa atual definida pelo autor:** registrar a organização dos marquesados neste documento. A escolha da localização e do formato dessas áreas territoriais e sua implementação no mapa ficam para depois.

**Ainda em aberto:** nomes dos marquesados e dos marqueses, localização e formato da área de 10%, relação administrativa com ducados, condados e baronias e forma de escolha dos marqueses. Esta definição ainda não estabelece polígonos no mapa.

### 3.2 Divisões internas e níveis de visualização

**Definido pelo autor:** os seis ducados existentes continuam como base da organização territorial. O redesenho futuro tratará de suas divisões internas.

- **Mapa geral de Viremont:** mostrar a divisão entre os seis ducados. As fronteiras internas de marquesados, condados e baronias ficam ocultas nessa visão.
- **Ao entrar em um ducado:** apresentar o mapa interno do ducado e distinguir os terrenos do marquesado, dos condados, das baronias e das demais divisões que forem definidas, respeitando a hierarquia territorial.
- **Planejamento das áreas:** reservar 10% de cada ducado ao seu marquesado e definir os demais territórios na etapa de detalhamento interno.

**Etapa atual:** somente registro da diretriz. O desenho dos polígonos e a implementação dessas divisões e de sua visualização ocorrerão posteriormente.

### 3.3 Cidades, cards e travessias — objetivos posteriores

**Registro do autor em 11/11/2026:** os pontos abaixo ficam planejados para etapas posteriores. O estudo visual da cidade murada foi aprovado como referência de apresentação; as próximas funcionalidades e alterações geográficas ainda serão desenvolvidas.

- [ ] **Cidade de estudo em Valeris:** usar **0,30% da área do ducado** como proporção preferida pelo autor para o próximo detalhamento. A escala física, o nome e a localização oficial continuam pendentes.
- [ ] **Capitais:** acrescentar opções de **0,40% e 0,50%** ao estudo de proporções para comparar capitais. A escolha da capital e de sua proporção definitiva será feita posteriormente.
- [ ] **Formato aprovado:** preservar o ícone de cidade murada e o card que informa o local. Construir as cidades e evoluir o clique no ícone/card ou botão para permitir entrar no interior da cidade correspondente.
- [ ] **Pontes e rios:** escolher pontos específicos para afinar tanto pequenos cursos quanto o rio principal, criando locais adequados a pontes compatíveis com o contexto medieval. Planejar vãos e acessos quando houver escala física definida, preservando a continuidade dos rios e das confluências.

**Escopo deste registro:** guardar as preferências e a sequência de trabalho. A implementação de interiores, as novas opções para capitais e o redesenho dos trechos dos rios ficam para depois; este registro não define capitais, pontes, cidades oficiais ou novas divisões territoriais.

## 4. Prompt de implementação para o Codex

**Papel:** Você é um desenvolvedor experiente em React, TypeScript, Three.js, React Three Fiber, geometria esférica, cartografia e renderização de mapas interativos.

**Objetivo:** Implementar a **camada de seis ducados de Viremont**, preservando o atlas mundial já funcional. Este arquivo é a única fonte de lore para esta tarefa. Os polígonos reais e a geometria existente no repositório são a fonte de verdade geográfica.

### 4.1 Antes de codificar

1. Inspecione a estrutura do projeto e os dados do país `aetheria-07`, incluindo projeção, coordenadas, escala, seleção de países e zoom já implementados.
2. Verifique a imagem do mapa territorial de Viremont e a imagem conceitual dos seis ducados, **se disponíveis na pasta do projeto**. A imagem conceitual é orientação artística, **não** dado georreferenciado.
3. Identifique se já existe camada vetorial de rios e cordilheiras. Registre a discrepância entre o rio pintado e a ausência de vetor hidrológico de Viremont.
4. Reutilize componentes, materiais, controles e estilos existentes. Não substitua o atlas por uma nova aplicação.

### 4.2 Fronteiras dos seis ducados

- Criar **seis polígonos persistentes** inteiramente dentro do polígono nacional de Viremont.
- A união dos seis polígonos deve cobrir a área de Viremont, sem lacunas ou sobreposições significativas; fronteiras compartilhadas devem coincidir.
- Respeitar, na medida do possível, a leitura do terreno: Nortar ao norte; Valeris no centro e corredor fluvial; Selvéria a oeste; Érdel a leste/nordeste; Montelur a sudoeste; Thargrund no sul/sudeste montanhoso.
- **Não usar seis fatias radiais ou áreas iguais por padrão.** Propor áreas assimétricas, justificadas por relevo, bacias e rotas.
- Como a hidrografia é apenas pictórica, **não inventar coordenadas exatas de rios**. Onde a fronteira depender do curso de um rio ainda não vetorizado, sinalizar como provisória. Se necessário, criar um rascunho de linha vetorial separado para aprovação, sem alterar a arte original.
- Não modificar limites nacionais, países vizinhos, textura base, relevo nem os dados globais.
- Não definir distâncias em km, população ou cidades adicionais sem escala física e dados aprovados.

### 4.3 Dados persistentes

Armazenar os ducados em arquivos de dados estruturados (GeoJSON ou formato compatível com a geometria do projeto), com identificadores estáveis, por exemplo:

- `viremont-nortar`
- `viremont-valeris`
- `viremont-selveria`
- `viremont-erdel`
- `viremont-montelur`
- `viremont-thargrund`

Cada registro deve conter `id`, `name`, `parentNationId`, `region`, `description`, `economy`, `history`, `status: "provisional"` e geometria. Preserve caracteres acentuados nos nomes exibidos. Não duplique textos de lore em vários arquivos: **este Markdown é a referência editorial**; os dados de execução podem conter apenas os campos necessários à interface.

### 4.4 Interação e zoom

- **Visão mundial:** preservar o comportamento atual; não exibir todas as fronteiras ducais à distância.
- **Visão de Viremont:** ao aproximar ou selecionar o país, exibir seis fronteiras ducais com traços legíveis e nomes sem excesso de sobreposição.
- **Hover:** destacar suavemente o ducado sob o cursor.
- **Clique:** selecionar um ducado, centralizar a câmera e abrir painel com nome, paisagem, vocação e história curta deste documento.
- **Zoom dentro do ducado:** revelar progressivamente a textura e os detalhes geográficos que **já existem** no mapa (rios ilustrados, florestas, montanhas, lagos e relevo), sem apenas ampliar uma imagem borrada.
- Preparar estrutura para **6 marquesados, 24 condados, 96 baronias, cidades, vilas e aldeias**, mas **não gerar nem desenhar essas subdivisões nesta etapa**. Na implementação futura, seguir a separação entre mapa geral e mapa interno definida na seção 3.2.
- Implementar transições suaves e retorno ao país ou ao planeta.
- Preferir níveis de detalhe (LOD), tiles ou resolução progressiva compatíveis com a arquitetura existente; não prometer detalhes inexistentes na fonte original.

### 4.5 Camadas e aparência

- Alternância de camada **Fronteiras ducais**.
- Destaque de seleção distinto de fronteiras nacionais.
- Estilo cartográfico medieval ilustrado, coerente com o atlas aprovado.
- Os ducados não precisam de preenchimento opaco; usar bordas finas e um realce translúcido discreto.
- Os rótulos devem manter legibilidade e não cobrir rios ou montanhas importantes quando possível.

### 4.6 Verificação técnica

- Testar que há exatamente seis ducados com IDs únicos.
- Validar que os polígonos estão dentro de Viremont e cobrem seu território sem sobreposição relevante.
- Validar que o clique em um ducado não seleciona indevidamente o país vizinho.
- Testar hover, zoom, painel e retorno à visão mundial.
- Garantir que a geografia permaneça idêntica após reiniciar a aplicação.
- Confirmar que não houve alteração no restante de Aetheria ou nos outros continentes.
- Executar build e verificações disponíveis no projeto.

### 4.7 Entrega e limites

**Implemente somente os seis ducados e sua exploração visual.** Não crie ainda os 24 condados, 96 baronias, famílias nobres, cidades ou vilarejos. Não acrescente novos eventos à história.

Ao concluir, informe quais arquivos foram alterados, como os limites foram calculados, quais trechos são provisórios por falta de dados vetoriais e como testar a seleção e o zoom. Preserve este documento como o registro único de planejamento da divisão ducal.

## 5. Questões pendentes para o autor

- Aprovar ou revisar as histórias propostas dos seis ducados.
- Aprovar a geometria proposta pelo Codex após visualizar as fronteiras.
- Definir posteriormente a capital real, a sede de cada ducado e as casas nobres.
- Definir nomes, localização e formato da área de 10%, escolha dos marqueses e relação dos seis marquesados militares da Coroa com as demais divisões territoriais.
- Vetorizar e revisar os rios ilustrados antes de usá-los como fronteiras definitivas.
- Definir a escala física do planeta antes de calcular km², tempos de viagem e densidades populacionais.

# Atlas Interativo de Elarion

Primeira versão local do mapa-múndi 3D da web novel. Requer Node.js 20.19+.

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. `npm run build` verifica o TypeScript e cria `dist/`.

## Estrutura geográfica

- `src/data/world/continents.ts`: sete continentes com IDs estáveis, contornos, centros, cordilheiras, rios e lagos em coordenadas normalizadas de longitude/latitude.
- `src/data/world/nations.ts`: cadastro das 94 nações, sem fronteiras propostas.
- `src/geography/coordinates.ts`: projeção dos dados sobre a esfera e seleção por polígono.
- `src/rendering/mapTexture.ts`: ilustração cartográfica determinística gerada dos dados persistentes. Os nomes são rótulos independentes da textura.
- `src/types/geography.ts`: tipos e campo de nível de detalhe para futuras entidades.

A imagem `mapa-mundi.png` orientou a composição. Os contornos são uma interpretação provisória, não uma vetorização exata. Os cinco nomes oceânicos aparecem apenas na imagem e não estão definidos nos Markdown; os rótulos no aplicativo são, portanto, provisórios. O raio da esfera é uma unidade visual configurável, sem equivalência em quilômetros.

A exploração local atualmente cobre os seis ducados de Viremont, conforme a seção de terreno explorável. Os demais continentes continuam na representação mundial; condados, baronias, ruas e construções ainda não foram implementados. Novos dados deverão usar os IDs existentes, mantendo contornos globais estáveis.

## Revisão visual e territorial

O globo agora usa uma pintura sem rótulos, derivada da referência por edição com a ferramenta integrada de geração de imagens. Os nomes permanecem elementos independentes e legíveis. As ilhas e costas de seleção ficam em `src/data/world/coastlines.json`, vetorizadas e persistidas; não são calculadas da imagem durante a execução. A aproximação da borda foi simplificada e ainda admite revisão manual.

O modo ilustrado integra relevo, florestas e hidrografia na pintura. Seus controles individuais ficam desabilitados nesse modo. Desative **Ilustração original** para usar a representação construída das camadas geográficas independentes.

As alterações solicitadas pelo autor estão em `src/data/world/terrain-revisions.json`: metade da densidade florestal em Eryndor e Varkhonia; cordilheira reduzida, planícies e dois rios em Thal'Zor; dois rios atravessando o deserto e passagens montanhosas em Solméria. A redução florestal na pintura é aproximada; na camada gerada o multiplicador é 0,5.

As imagens originais e as variantes são preservadas em `public/assets`. A edição artística pediu, em sequência: remover textos e ornamentos da referência; naturalizar o litoral; abrir planícies e rios em Thal'Zor e inserir dois rios no deserto; reduzir pela metade as florestas de Eryndor e Varkhonia. A referência original `mapa-mundi.png` foi preservada.

A pintura de base é `public/assets/elarion-terrain-soft-rivers.png`. A revisão inicial dos rios foi feita pela ferramenta integrada de edição de imagens com a orientação: afinar os quatro rios adicionados, remover contornos duplos e faixas verdes uniformes e igualar o tratamento à hidrografia pintada de Aetheria. Os cursos e identificadores geográficos continuam nos mesmos dados.

O autor forneceu depois a referência visual `references/river-style.png`: água azul com margens assimétricas, trechos largos e estreitos e ramificações. A correção atual se concentra nos quatro rios artificiais de Thal'Zor e Solméria; os rios já naturais dos demais continentes devem ser preservados. A camada gerada usa superfícies preenchidas de largura variável nesses quatro cursos (`src/rendering/riverShape.ts`), sem mudar o desenho dos outros rios.

A variante `public/assets/elarion-terrain-reference-rivers.png` foi editada com essa referência pelo gerador integrado. Orientação final: substituir apenas os quatro traços artificiais por leitos azuis de largura irregular, conservar os demais rios e o terreno aprovado. O material ilustrado compõe essa variante apenas dentro dos polígonos de Thal'Zor e Solméria; fora deles usa os pixels da pintura de base.

Namaris também recebeu redução de aproximadamente metade das árvores na pintura, com campos e clareiras entre os bosques restantes. A edição integrada de imagens usa a orientação: reduzir somente as árvores do arquipélago inferior central em 50%, mantendo montanhas, águas e litoral. Essa variante é composta apenas nos polígonos de Namaris; a densidade da camada geográfica independente também passa a `0.5`.

## Divisão política proposta

As 94 nações agora possuem territórios provisórios e um ponto reservado para cidade por país. As fronteiras usam uma divisão de Voronoi com semente fixa, recortada pelos contornos continentais e ilhas. O arquivo `src/data/world/political-map.json` é persistente: abrir ou reiniciar o atlas não gera outro mapa. Os IDs e nomes do cadastro existente são mantidos, inclusive as seis nações propostas como integrantes do Império de Valdória; as fronteiras não estabelecem novas relações políticas.

O gerador procura pontos de aparência aberta na pintura de cada continente: manchas de campo ou areia com baixa variação, sem água e com pouca cobertura escura de árvores ou rochas. Cada país é construído em torno de um desses pontos. É reservada uma área circular de cinco pixels da referência ao redor do local, integralmente dentro de terra e do próprio país. Isso é uma margem cartográfica de planejamento, sem equivalência física em quilômetros. Terrenos desérticos abertos também são candidatos; ainda não há simulação de água potável, solo, declividade, agricultura ou capacidade populacional. A avaliação por cores da ilustração é aproximada e requer revisão do autor antes de definir cidades canônicas.

No globo, clique em um território para ver seu nome. Selecione um continente para visualizar seus locais de cidade e sua lista de nações. O menu **Nações** e as camadas **Fronteiras das nações**, **Locais de cidades** e **Nomes das nações** estão disponíveis. Os pontos são locais propostos; não são modelos de cidades ou construções.

Comandos de manutenção (Node.js 24):

```sh
npm run geography:generate
npm run geography:validate
```

A geração lê as pinturas locais e usa apenas dependências de desenvolvimento (`d3-delaunay`, `polygon-clipping`, `pngjs`); o aplicativo carrega os polígonos prontos. A validação verifica as 94 identidades, a quantidade por continente, os pontos e suas margens dentro do país, a cobertura completa das terras e a ausência de sobreposições. Execute a geração somente quando quiser recalcular a proposta; mudanças nos arquivos de referência podem mudar o resultado.

### Drakmória habitável

A variante `public/assets/elarion-terrain-drakmoria.png` foi editada pelo gerador integrado com a orientação de remover toda lava, fogo e erupções do continente sudoeste e substituí-los por montanhas inativas, vales, campos e cursos de água. A pintura é aplicada apenas nos polígonos de Drakmória. A camada geográfica independente passa a usar bioma temperado e símbolos de montanhas comuns.

Os 11 locais de cidade foram revistos contra a nova pintura. Cinco pontos precisaram de ajuste local dentro dos próprios países; as fronteiras e identidades das 94 nações foram preservadas. A validação agora confere também a adequação visual dos locais na versão ativa da pintura. Depois de uma edição de terreno, use `npm run geography:review-sites -- drakmoria` para revisar apenas seus pontos, sem recalcular fronteiras. A adequação continua sendo uma estimativa pela ilustração, sem simulação física de solo, água ou relevo.

### Ampliações de Eryndor e Namaris

Eryndor ganhou terras a noroeste, com a nova área dividida aproximadamente em metade neve e metade tundra. Namaris ganhou uma extensão meridional, com transição fria e neve no extremo sul. As variantes do gerador integrado ficam em `public/assets/elarion-terrain-eryndor-expanded.png` e `public/assets/elarion-terrain-namaris-expanded.png`. As orientações de edição foram ampliar somente esses dois locais, preservar os demais continentes e manter o estilo cartográfico aprovado. O material aplica cada variante apenas à sua região geográfica.

As extensões têm representação própria em `src/data/world/polar-expansion.json`, incluindo polígonos das terras acrescentadas e regiões climáticas. `coastlines.json` inclui as novas costas sem retirar as terras anteriores. Os arquivos em `references/polar-expansion-*` guardam o estado anterior e os contornos usados para conferir a preservação dos outros cinco continentes.

Conforme solicitado, foram redistribuídas as 12 nações de Eryndor e as 15 de Namaris sobre seus territórios ampliados. As 67 nações dos outros continentes mantêm exatamente os mesmos territórios e locais de cidade. As 27 nações redistribuídas mantêm IDs e nomes e recebem novamente um local aberto para cidade com margem livre dentro do próprio país. Neve não é considerada área de implantação automática de cidade por este método visual.

Para refazer somente esses dois continentes, use `npm run geography:generate -- eryndor namaris`. Depois execute `npm run geography:validate` e `npm run geography:validate-expansion`. A geração parcial usa sementes locais estáveis e preserva os dados dos continentes não solicitados.

### Correção do istmo e afluente de Mazdrin

A pintura `public/assets/elarion-terrain-isthmus.png` foi editada pelo gerador integrado para alargar a conexão terrestre Aetheria–Drakmória, deixar margens amplas ao redor do rio e acrescentar um afluente das montanhas de Brenkar ao lago de Mazdrin. Uma segunda edição preservou o lago como uma superfície de água reconhecível, com entrada ocidental do afluente e saída conectada ao curso existente. O material aplica essa pintura apenas no recorte definido em `src/data/world/isthmus-repair.json`, preservando as ampliações polares e as demais revisões.

A costa e as fronteiras dentro desse recorte foram alinhadas à terra ilustrada. As partes antigas dos países fora da correção foram preservadas; a terra acrescentada foi incorporada às nações vizinhas, sem criar países adicionais. O afluente e o contorno do lago também têm dados próprios para a camada geográfica. Os 94 locais de cidade foram validados; somente o local de Mazdrin precisou se afastar da nova água para outro ponto aberto no próprio país.

A verificação `npm run geography:validate-isthmus` confere continuidade terrestre, nascente em Brenkar, chegada ao lago de Mazdrin e preservação da geografia fora do recorte. Os arquivos `references/isthmus-repair-*` guardam o estado anterior e os contornos usados na correção. A revisão continua cartográfica: o atlas não simula vazão ou altitude física.

## Exploração dos ducados de Viremont

`viremont_ducados_codex.md` é a única fonte editorial dos nomes, paisagens, vocações e histórias. O aplicativo importa esse documento e combina seus textos com os seis polígonos persistentes de `src/data/viremont/duchies.json`. Os limites são curvas assimétricas recortadas pelo polígono nacional existente, com bordas compartilhadas coincidentes. A proposta incorpora os ajustes do autor: Thargrund alcança campos de sopé; Nortar cede terreno principalmente a Valeris e uma faixa menor a Selvéria, aproximando-a do corredor fluvial pintado. O rio não tem vetor hidrológico aprovado; essas aproximações permanecem provisórias.

Use **Reino de Viremont** na barra lateral. Clique no terreno, nos rótulos ou na lista para selecionar um ducado e ler seu painel. A roda aproxima, o arraste move a visão local e os botões **Viremont** e **Planeta** retornam aos níveis anteriores. **Fronteiras ducais** alterna a camada, oculta na visão mundial. O destaque ao passar o cursor e a seleção usam os mesmos polígonos persistentes.

O detalhe local é carregado sob demanda sobre a esfera, com transição por distância. `scripts/generate-viremont-detail.mjs` recorta os pixels da pintura existente e limita sua aplicação ao país, sem alterar os arquivos de origem. O recorte disponível contém apenas 196 × 188 pixels: não permite revelar novas cidades, construções, rios menores ou relevo em grande aproximação. Será necessária arte local de maior resolução e geografia aprovada para esses níveis. As fronteiras vetoriais continuam nítidas. Os tipos reservam referências para futuras subdivisões; não foram criados condados, baronias, cidades ou domínio da Coroa.

```sh
npm run viremont:generate
npm run viremont:detail
npm run viremont:validate
npm run build
```

A geração é uma operação explícita de manutenção; reiniciar o aplicativo apenas carrega os arquivos persistentes. A validação confere os seis IDs, conectividade, contenção nacional, cobertura, ausência de sobreposição, cidade proposta em Valeris e exclusão de países vizinhos na seleção. Também confere os ajustes territoriais solicitados e compara os hashes dos dados globais, pinturas originais e documento editorial com `references/viremont-duchies-baseline.json`.

## Terreno explorável dos seis ducados

Selecionar qualquer ducado abre uma vista local tridimensional, com relevo, água e vegetação, orientada pela referência artística `references/duchy-terrain-reference.png`. **Ver no globo** retorna à representação ilustrada. O globo, as fronteiras e a fonte editorial permanecem preservados; não foram criados condados, baronias, cidades, estradas ou novos nomes.

Use **Panorama**, **Vista aérea** e **Explorar de perto** para alternar o enquadramento. A roda e os botões **+ / −** permitem continuar aproximando até perto do solo, com distância mínima de quatro unidades locais. Arraste para orbitar; botão direito para deslocar; no toque, um dedo gira e dois deslocam/aproximam. O minimapa conserva a relação com os seis polígonos e permite reenquadrar. **Fronteira** mostra o limite do ducado sobre o relevo. Os controles da antiga pintura no painel direito afetam a visão do globo; a vista local possui seus próprios controles.

A cena usa um campo comum de 8192 unidades de largura para os seis ducados, em vez de seis paisagens sem relação espacial. `TerrainField.ts` converte as coordenadas normalizadas do atlas em coordenadas locais e permite o caminho inverso. Essa escala é de renderização, sem equivalência em metros ou quilômetros. Condados e baronias futuros deverão continuar usando as coordenadas normalizadas e referenciar a mesma superfície, sem ampliar ou redefinir o país para obter espaço.

`scripts/generate-terrain-fields.mjs` gera um campo persistente de 257 × 257 amostras com altura de 16 bits, máscara florestal e máscara de água. As florestas e a água derivam das cores da pintura ativa. As altitudes são **interpretação artística provisória** de cristas posicionadas junto às montanhas pintadas; não são medições, nem uma reconstrução automática da luminosidade da imagem. A fonte não permite recuperar altitudes reais. Não há simulação hidrológica: a água utiliza um nível ilustrativo comum, ainda sem direções de fluxo ou cotas aprovadas. O arquivo `hydrology-draft.json` contém contornos estruturados de água extraídos da máscara, explicitamente pendentes de revisão; não é uma rede topológica de rios concluída.

A representação local é plana e registrada no atlas, com câmera própria e abertura por transição de opacidade. Não há ainda uma transição geométrica contínua entre a esfera e o terreno. A região inclui contexto ao redor dos limites políticos; o relevo não termina na fronteira de um ducado.

O módulo da cena e o campo binário são carregados sob demanda. A superfície é dividida em 144 parcelas com quatro densidades de malha (16, 32, 64 e 128 segmentos por lado), escolhidas conforme a proximidade da câmera. Normais usam a mesma função de altura e saias nas bordas escondem diferenças entre densidades. Vegetação usa instâncias; perto do solo, uma distribuição determinística mais fina é carregada em torno do alvo da câmera. O detalhe não altera as posições geográficas ao mudar a resolução. Ainda não há streaming de arquivos por parcela, quadtree com erro de tela, física de caminhada ou cadastro das subdivisões feudais.

Depois da primeira abertura, a cena do terreno e o globo permanecem montados. Apenas a cena visível renderiza; a outra usa `frameloop="never"`. Os rótulos geográficos também conservam suas raízes DOM e alternam visibilidade, evitando desmontagem de portais durante a troca entre as cenas. Isso preserva os recursos carregados e permite alternar entre os ducados sem recriar o contexto WebGL a cada clique.

A textura `public/assets/terrain/painted-meadow.png` foi criada com o gerador de imagens integrado, usando a referência do autor exclusivamente para estilo. Especificação usada: textura de solo quadrada, vista ortográfica superior, repetível, pinceladas de grama verde-musgo e palha dourada, sem sombras direcionais, rios, árvores, montanhas, construções, rótulos ou bordas. Ela fornece acabamento de superfície; não define geografia. O gerador de terreno e a renderização são determinísticos, independentes desse acabamento.

O prompt completo do acabamento está em `references/terrain-texture-prompt.txt`. A imagem `references/terrain-masks-review.png` é uma visualização de diagnóstico das máscaras (água em azul, mata em verde, demais áreas em ocre). As superfícies de água da cena são trianguladas dos contornos estruturados, com suavização limitada à precisão da pintura.

```sh
npm run terrain:generate
npm run terrain:validate
npm run viremont:validate
npm run build
```

A validação do terreno verifica integridade do binário, cobertura dos seis ducados, transformação reversível de coordenadas, áreas acessíveis, variação de relevo, continuidade das amostras compartilhadas entre densidades, normais finitas e preservação do local de cidade. A validação de Viremont continua protegendo os arquivos globais e a pintura original por hash.

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

O mapa interno ocupa a tela e oferece um seletor **Explorar ducado** para alternar entre os seis territórios. **Informações do ducado** abre o guia editorial; **Fechar informações** devolve a área à paisagem. **Ver no globo** restaura a navegação mundial com as barras laterais.

Use **Panorama**, **Vista aérea** e **Explorar de perto** para alternar o enquadramento. O panorama de Valeris enquadra o corredor fluvial e a serra de Thargrund como contexto, seguindo a composição aprovada. A roda e os botões **+ / −** permitem continuar aproximando até perto do solo, com distância mínima de quatro unidades locais. Arraste para orbitar; botão direito para deslocar; no toque, um dedo gira e dois deslocam/aproximam. O minimapa conserva a relação com os seis polígonos e permite reenquadrar. **Fronteira** mostra o limite do ducado sobre o relevo. Os controles da antiga pintura no guia afetam a visão do globo; a vista local possui seus próprios controles.

A cena usa um campo comum de 8192 unidades de largura para os seis ducados, em vez de seis paisagens sem relação espacial. `TerrainField.ts` converte as coordenadas normalizadas do atlas em coordenadas locais e permite o caminho inverso. Essa escala é de renderização, sem equivalência em metros ou quilômetros. Condados e baronias futuros deverão continuar usando as coordenadas normalizadas e referenciar a mesma superfície, sem ampliar ou redefinir o país para obter espaço.

`scripts/generate-terrain-fields.mjs` gera um campo persistente de **513 × 513 amostras** com altura de 16 bits, máscara florestal e máscara de água. A vegetação parte das cores da pintura ativa, com clareiras junto das águas e das planícies. As altitudes são **interpretação artística provisória** de cristas posicionadas junto às montanhas pintadas, não medições nem uma reconstrução automática da luminosidade da imagem.

A hidrografia local usa `src/data/terrain/hydrology-source.json`: **um rio principal, 12 riachos, uma nascente serrana e seis lagos de baixada**, com conexões explícitas e perfis de altura descendentes. Os lagos possuem entrada e saída; há uma área aberta de planejamento em cada ducado, sem cidades novas cadastradas. A nascente substitui o lago que aparecia no alto da montanha no conceito. As posições são uma proposta cartográfica para a cena local, em coordenadas do atlas. Não há simulação de vazão, enchentes, água potável ou aptidão urbana, nem escala física aprovada. A imagem de referência de estilo está em `references/valeris-atlas-strategico.png`; sua perspectiva artística não é usada para inferir coordenadas.

O relevo parte de `src/data/terrain/ridge-source.json`: dez linhas de crista, incluindo uma serra principal ramificada em Thargrund, e quatro incisões de vale. `RidgeField` mantém selas elevadas entre os picos, alarga os sopés e varia o traçado das encostas com sulcos de aparência. Esses dados substituem os picos isolados da primeira versão; continuam sendo uma proposta artística em unidades locais.

As passagens entre picos alternam cotas menores e maiores, e o ramo sul continua em contrafortes baixos no primeiro plano. Fraturas com interpolação triangular acrescentam faces planas à rocha. As baixadas recebem ondulação suave, preservando os leitos e as seis áreas abertas definidas. Fora do campo registrado, colinas de cenário suavizam o horizonte; não cadastram novas feições geográficas.

`TerrainHydrology` fornece os mesmos leitos e margens à superfície do terreno e às malhas de água. Os cursos têm cotas locais variáveis, os lagos têm superfície nivelada e os riachos são mais estreitos que o rio principal. `TerrainWater` acrescenta cores de profundidade, margens e pequenas ondulações de aparência, sem deformar a geografia. O antigo `hydrology-draft.json` é mantido como registro da extração por cores e não alimenta mais a cena.

As duas margens variam de largura independentemente. Nas curvas do rio principal, a margem interna recebe faixas de sedimento mais largas; os riachos mantêm bordas menores. As mesmas larguras são usadas para abrir o leito no terreno, evitando desencontro entre água e encosta. Essa assimetria é acabamento visual, sem simulação de erosão.

O vale faz uma transição de até 220 unidades locais entre a margem e a cota original, conservando as planícies de planejamento secas. A água tem bordas claras interrompidas, arbustos em grupos e pedras nas margens. Pedras avulsas não são distribuídas nas faces íngremes da serra.

Uma pequena faixa submersa sob a margem evita que os triângulos da versão menos detalhada do terreno cubram alternadamente a água. A validação amostra também a altura interpolada desses triângulos nas bordas, além da função contínua de elevação.

A representação local é plana e registrada no atlas, com câmera própria e abertura por transição de opacidade. Não há ainda uma transição geométrica contínua entre a esfera e o terreno. A região inclui contexto ao redor dos limites políticos; o relevo não termina na fronteira de um ducado.

O módulo da cena e o campo binário são carregados sob demanda. A região central é dividida em 144 parcelas com densidades de 32, 64 e 128 segmentos por lado, escolhidas conforme a proximidade da câmera. Quatro superfícies de baixa densidade prolongam o entorno para manter a borda retangular fora do panorama, com menos chamadas de desenho. Normais usam a mesma função de altura e saias nas bordas escondem diferenças entre densidades. A geração dessas malhas acontece em um Web Worker: a resolução anterior permanece visível até a próxima ficar pronta. Uma base completa de oito segmentos por parcela é preparada antes da primeira abertura. Os resultados transferem seus buffers para a cena, com cache por parcela/resolução e orçamento de 48 MiB para geometria; recursos em uso são protegidos contra descarte, mesmo se excederem temporariamente o orçamento. Pedidos duplicados são unidos, trabalhos pendentes obsoletos são cancelados e a fila pausa quando a vista local fica oculta.

O acabamento segue uma composição **2.5D de atlas ilustrado**: relevo e água continuam em geometria 3D, enquanto árvores são recortes desenhados com transparência, instanciados e orientados à câmera, com raízes fixas no terreno. O atlas de oito árvores inclui seis variações de copa e duas coníferas. A distribuição cria bosques densos com bordas e clareiras, em vez de árvores igualmente espalhadas. A vegetação regional é calculada uma vez no worker e reutilizada entre posições da câmera e ducados. Perto do solo, uma camada independente fornece vegetação menor, com resultados guardados para até doze áreas recentes. Há pedras nas margens e sopés. As cristas têm detalhes de relevo em múltiplas frequências; a rocha usa projeção de textura em três eixos e a grama usa pinceladas de superfície. A água tem acabamento de desenho, largura local variável e ondulações discretas, com lagos de contorno irregular. O detalhe não altera as posições geográficas ao mudar a resolução. Ainda não há streaming de arquivos por parcela, quadtree com erro de tela, física de caminhada ou cadastro das subdivisões feudais.

As superfícies de rios e lagos agora são unidas geometricamente antes da triangulação. As margens são a diferença entre o contorno externo e essa água unificada. Nas confluências não há faixas sobrepostas, tampas retas ou margens internas atravessando o curso receptor. As cores de profundidade usam a distância à margem externa unificada, evitando degraus de cor onde mudam as larguras dos cursos. As cotas usam a mesma rede de hidrografia; os caminhos e locais dos lagos continuam preservados.

O material separa a pigmentação da rocha da cor do solo: a textura cinza não recebe a multiplicação ocre dos vértices. Faces rochosas usam iluminação com contraste e traços de fenda; a planície combina pinceladas, curvas interrompidas e escurecimento sob as copas. Uma textura de grama mais fina aparece na aproximação. As árvores têm mais variação de altura e mistura de coníferas. Esse acabamento continua ligado ao terreno navegável, sem substituir a cena por uma imagem estática.

Depois da primeira abertura, a cena do terreno e o globo permanecem montados. Apenas a cena visível renderiza; a outra usa `frameloop="never"`. Os rótulos geográficos também conservam suas raízes DOM e alternam visibilidade, evitando desmontagem de portais durante a troca entre as cenas. Isso preserva os recursos carregados e permite alternar entre os ducados sem recriar o contexto WebGL a cada clique.

A textura anterior `public/assets/terrain/painted-meadow.png` foi preservada. O acabamento atual usa três materiais criados pelo gerador integrado a partir da referência aprovada: `public/assets/terrain/atlas-grass.webp` (grama desenhada), `public/assets/terrain/atlas-rock.webp` (rocha estratificada) e `public/assets/terrain/atlas-trees.webp` (oito árvores com fundo transparente). Os originais PNG são preservados com os mesmos nomes; as versões WebP usam compressão sem perdas, com igualdade dos pixels RGBA verificada, e reduzem o volume transferido em cerca de um terço. Os prompts completos estão em `references/atlas-material-prompts.json`. Esses materiais fornecem acabamento e não definem a geografia. O gerador de terreno e a distribuição da vegetação são determinísticos, independentes das imagens de estilo.

O prompt completo do acabamento está em `references/terrain-texture-prompt.txt`. A imagem `references/terrain-masks-review.png` registra o diagnóstico das máscaras anteriores (água em azul, mata em verde, demais áreas em ocre). A rede atual é definida nos dados de autoria, em vez de depender dos recortes de cores dessa máscara.

```sh
npm run terrain:generate
npm run terrain:validate
npm run terrain:validate-resources
npm run viremont:validate
npm run build
```

A validação do terreno verifica integridade do binário, cobertura dos seis ducados, transformação reversível de coordenadas, áreas acessíveis, variação de relevo, continuidade das amostras compartilhadas entre densidades, normais finitas e preservação do local de cidade. Também verifica conexões e cotas das junções, perfis descendentes, lagos nos ducados correspondentes e nas baixadas, nascente elevada, planícies secas e superfície da água livre do terreno. A validação de Viremont protege os arquivos globais e as pinturas originais por hash. O snapshot editorial foi atualizado para as decisões aprovadas pelo autor em 11/11/2026; seu hash normaliza apenas quebras de linha, mantendo os 16 hashes de geografia e arte sem alterações.

### Diagnóstico de desempenho local

Abra `http://localhost:5173/?terrainProfile=1` e entre em um ducado para mostrar o painel de diagnóstico. Cada coleta usa 0,5 s de aquecimento e aproximadamente 8 s de medição. O painel registra intervalos entre quadros, tempo de submissão da renderização na CPU, chamadas de desenho, triângulos e geração síncrona de vegetação/blocos do terreno. As caixas ocultam temporariamente vegetação, água ou as quatro malhas do cenário externo para comparação; a opção de animação apenas congela o relógio da água. O modo normal, sem o parâmetro, não mostra o painel nem coleta tempos.

`node --experimental-strip-types scripts/benchmark-terrain.mjs` mede no Node a mesma geração determinística de vegetação usada pelo aplicativo, sem a reutilização do cache. Não representa FPS nem tempo de GPU. Os arquivos `references/terrain-performance-baseline.json` e `references/terrain-browser-performance-baseline.json` guardam as primeiras medições, incluindo hashes da vegetação e os tempos individuais dos blocos. A divisão em camadas em `src/geography/terrain/vegetation.ts` preserva os cinco hashes de posições/espécies da referência. O teste `terrain:validate-resources` também compara todos os atributos de uma malha gerada no worker com a geração síncrona, exercita cancelamento, deduplicação, pausa, falha e descarte seguro do cache, e confere cobertura única da água em todas as junções.

Na coleta local de 11/11/2026 (Vite em desenvolvimento, navegador visível, 1280 × 720, DPR 1), o panorama estático ficou em cerca de 60 FPS, inclusive com a água congelada. Duas aproximações tiveram pausas máximas de 4,8 s e 5,9 s. A geração síncrona dos blocos de relevo acumulou vários segundos por percurso, enquanto cada recálculo da vegetação consumiu aproximadamente 0,6 s. São medidas deste ambiente, sem temporização isolada da GPU; atingir o limite de 60 FPS não significa que uma camada tenha custo zero.

Após a otimização, `references/terrain-browser-performance-optimized.json` registra as mesmas medições locais: a primeira aproximação ficou em 59,9 FPS (intervalo máximo de 17,9 ms) e a repetição em 59,9 FPS (máximo de 29,6 ms). A camada regional não foi regenerada durante esses percursos; a camada próxima levou 16,8 ms no worker na primeira aproximação e foi reutilizada na repetição. O cálculo de relevo continua consumindo CPU, porém fora da linha da interface. O orçamento do cache não representa a memória total do navegador nem uma medida isolada de GPU. Os arquivos de baseline permanecem preservados para comparação. O botão de diagnóstico **Ver confluência** permite revisar uma junção de perto; **Fechar diagnóstico** oculta o painel sem alterar a câmera.

### Cidade murada: estudo de proporção em Valeris

`src/data/terrain/city-scale-preview.json` coloca um símbolo vetorial provisório na planície de planejamento já existente em Valeris. Não é uma cidade nomeada, capital aprovada, nova divisão territorial nem alteração do ponto de cidade reservado no globo. O pedido atual autoriza este estudo visual, preservando as demais pendências editoriais.

O ícone murado é ampliado em tela para leitura; o **contorno dourado no chão** representa a área proposta na projeção local. A prévia inicial abre em **0,05% da área de Valeris** (1/2.000), com comparações de 0,15% e 0,30%. O autor escolheu **0,30% como preferência para o próximo detalhamento**, conforme os objetivos posteriores registrados abaixo. A área do polígono de oito lados é calculada a partir dos limites reais do ducado e ajustada matematicamente a cada porcentagem, sem atribuir quilômetros ou população. Um marquesado com 10% do ducado teria 200 vezes a área urbana da proposta padrão; a comparação não posiciona a cidade dentro de um marquesado.

Clique no ícone, em **Cidade murada** ou em **Ver área de perto** para aproximar. As três opções mantêm a mesma câmera para permitir comparar os contornos. Fechar o painel conserva o marcador, que permite reabri-lo. O estudo aparece somente na vista interna de Valeris. `npm run terrain:validate-city` confere as razões de área e verifica que todas as opções ficam dentro de Valeris, em terreno plano e seco. O desenho é SVG e o contorno acrescenta apenas duas chamadas de desenho; a geração do relevo e a vegetação continuam reutilizando os recursos do worker.

### Objetivos posteriores registrados pelo autor — 11/11/2026

A seção 3.3 de `viremont_ducados_codex.md` guarda as próximas etapas:

- [ ] Adotar 0,30% como proporção preferida da cidade de estudo em Valeris no próximo detalhamento.
- [ ] Acrescentar comparações de 0,40% e 0,50% para capitais.
- [ ] Preservar o formato aprovado do ícone/card de localização e desenvolver o acesso ao interior das cidades pelo clique correspondente.
- [ ] Escolher trechos para estreitar riachos e o rio principal, preparando travessias com pontes compatíveis com o contexto medieval e com a futura escala física.

Esses itens são planejamento posterior. O comportamento atual da prévia e as larguras dos rios permanecem como no estudo já entregue. A cidade oficial, as capitais, as pontes e as subdivisões territoriais ainda serão detalhadas.

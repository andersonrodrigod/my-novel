# Prompt original — análise de Viremont

Pedido preservado como referência. Seu conteúdo é uma solicitação de análise, não uma autorização de implementação.

---

Você é um desenvolvedor sênior especializado em Three.js, TypeScript, cartografia digital e sistemas de informação geográfica.

Estamos desenvolvendo o **Atlas 3D do Mundo de Elarion**, um universo fictício de fantasia medieval.

O mapa-múndi já está implementado, com continentes, países, fronteiras e características geográficas.

**Sua tarefa agora é analisar exclusivamente o território do país de Viremont, localizado no continente de Aetheria.**

### 1. Análise geográfica

Examine os dados geográficos existentes no projeto e identifique:

- A área territorial aproximada de Viremont em km².
- O comprimento aproximado de suas fronteiras.
- Os países vizinhos.
- Os principais rios e lagos.
- As regiões montanhosas.
- As planícies e áreas potencialmente habitáveis.
- As regiões adequadas para agricultura e comércio.

**Importante:** utilize a escala geográfica já configurada no projeto.

Caso o planeta não possua uma escala física definida, não invente valores em quilômetros quadrados.

Nesse caso, apresente a área em unidades internas do mapa e explique quais informações seriam necessárias para convertê-la em km².

### 2. Análise da divisão feudal

Queremos desenvolver Viremont como um reino medieval bastante populoso, com numerosas famílias nobres.

Nossa proposta inicial é:

| Divisão territorial | Quantidade |
| ------------------- | ---------- |
| Reino               | 1          |
| Ducados             | 6          |
| Condados            | 24         |
| Baronias            | 96         |

A estrutura política proposta é:

**Rei → Duques → Condes → Barões**

Cada ducado conteria, inicialmente, quatro condados.

Cada condado conteria quatro baronias.

Entretanto, esses números ainda não são definitivos.

Analise se essa divisão é geograficamente plausível considerando o tamanho de Viremont.

Avalie também se seis ducados oferecem uma distribuição territorial adequada ou se seria melhor utilizar quatro, cinco, sete ou oito.

Considere que o reino deverá possuir muitas cidades, vilas, aldeias, propriedades agrícolas e famílias nobres.

### 3. Distribuição territorial

Considere os seguintes critérios para uma futura divisão:

- Os ducados não precisam possuir áreas iguais.
- Rios podem funcionar como fronteiras naturais.
- Cordilheiras podem separar territórios.
- Regiões férteis podem concentrar mais população.
- Regiões montanhosas podem possuir territórios extensos e pouco habitados.
- Rotas comerciais podem influenciar a importância econômica dos ducados.
- A capital real poderá constituir um território administrado diretamente pela Coroa.

Não distribua os territórios utilizando apenas linhas retas ou divisões geométricas artificiais.

### 4. Preparação para cidades e vilarejos

O objetivo futuro é desenvolver um reino populoso.

Posteriormente, cada território poderá conter:

- Metrópoles.
- Cidades grandes.
- Cidades médias.
- Cidades pequenas.
- Vilas.
- Aldeias.
- Castelos.
- Fortalezas.
- Propriedades rurais.

A divisão territorial precisa ser compatível com a futura criação dessas localidades.

Não é necessário gerar cidades nesta etapa.

### 5. Preservação do mapa

**Não altere a geografia existente.**

Não modifique rios, montanhas, lagos, fronteiras nacionais ou nomes estabelecidos.

Não crie novos ducados, condados ou baronias ainda.

Não implemente novas funcionalidades.

Nesta etapa, quero exclusivamente uma análise técnica e uma recomendação de divisão territorial.

### 6. Resultado esperado

Apresente um relatório contendo:

1. Área territorial de Viremont, com a unidade e a metodologia utilizada.
2. Principais características geográficas.
3. Avaliação da proposta de seis ducados.
4. Quantidade recomendada de ducados.
5. Quantidade recomendada de condados.
6. Quantidade recomendada de baronias.
7. Área média estimada de cada divisão.
8. Possíveis dificuldades geográficas.
9. Recomendações para a futura distribuição das cidades.

**Não execute nenhuma alteração no código sem minha autorização.**

Aguarde minha aprovação antes de implementar a divisão feudal.

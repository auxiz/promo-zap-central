
# Shopee Affiliate Client

Este módulo fornece uma interface simplificada para interagir com a API GraphQL de Afiliados da Shopee.

## Requisitos

Para utilizar este módulo, você precisa das seguintes credenciais do programa de afiliados da Shopee:

- App ID (também chamado de client_id)
- Secret Key

Obtenha essas credenciais no [Portal de Afiliados da Shopee](https://affiliate.shopee.com.br).

## Variáveis de Ambiente

O módulo pode utilizar as seguintes variáveis de ambiente:

```
SHOPEE_APP_ID=seu_app_id_aqui
SHOPEE_SECRET_KEY=sua_secret_key_aqui
```

Se não configuradas, você pode passar essas credenciais diretamente nas chamadas de função.

## Instalação

```bash
npm install --save shopee-affiliate-client
```

## Uso

### Converter Links para Links de Afiliado

```javascript
const { convertToAffiliateLink } = require('shopee-affiliate-client');

// Usando credenciais explícitas
const result = await convertToAffiliateLink(
  'https://shopee.com.br/product/123456789/987654321',
  'seu_app_id',
  'sua_secret_key'
);

console.log(result);
// {
//   status: 'success',
//   original_url: 'https://shopee.com.br/product/123456789/987654321',
//   affiliate_url: 'https://shope.ee/abcdefghijk'
// }
```

### Buscar Ofertas da Shopee

```javascript
const { fetchOffers } = require('shopee-affiliate-client');

// Usando credenciais explícitas com paginação
const offers = await fetchOffers(
  { page: 1, limit: 20 },
  'seu_app_id',
  'sua_secret_key'
);

console.log(offers);
// {
//   status: 'success',
//   total: 100,
//   offers: [ ... array de ofertas ... ],
//   page: 1,
//   limit: 20
// }
```

### Utilização de Cache e Política de Retry

O módulo suporta opções de cache e retry para otimizar o desempenho e lidar com falhas transitórias:

```javascript
const result = await convertToAffiliateLink(
  'https://shopee.com.br/product/123456789/987654321',
  'seu_app_id',
  'sua_secret_key',
  {
    maxRetries: 3,        // Número máximo de tentativas em caso de erro
    retryDelay: 1000,     // Atraso inicial entre tentativas (ms)
    timeout: 5000         // Timeout da requisição (ms)
  }
);
```

## API Interna

### makeShopeeGraphQLRequest(query, variables, appId, secretKey, options)

Função de baixo nível para fazer requisições GraphQL autenticadas para a API da Shopee.

- **query**: String da consulta GraphQL
- **variables**: Variáveis da consulta (objeto)
- **appId**: ID da aplicação Shopee
- **secretKey**: Chave secreta da aplicação
- **options**: Opções adicionais (timeout, maxRetries, retryDelay)

### generateGraphQLSignature(appId, timestamp, payload, secretKey)

Gera a assinatura SHA256 para autenticação na API.

## Tratamento de Erros

O módulo inclui tratamento robusto de erros para problemas comuns:

- Erros de autenticação (credenciais inválidas)
- Erros de taxa limite (rate limiting)
- Respostas inesperadas da API
- Erros de rede e timeout

Todas as funções retornam um objeto com a propriedade `status` que pode ser `'success'` ou `'error'`.

## Considerações de Segurança

- Nunca compartilhe suas credenciais da API
- Armazene as credenciais como variáveis de ambiente ou em um gerenciador seguro de segredos
- Evite committar as credenciais em repositórios de código

## Suporte

Para suporte ou contribuições, por favor abra uma issue no repositório GitHub.

# CIM-RJ · Central de Inteligência de Mercado

Site institucional e área de assinantes da **Central de Inteligência de Mercado** focada no Norte e Noroeste Fluminense.

## Status atual (Novembro 2026)

- Site estático (HTML + CSS + JS)
- Login de assinantes via Supabase (RPC `cimrj_verify_login`)
- Pagamentos via Stripe
- Preparado para deploy no Netlify (arquivo `_redirects`)
- Infraestrutura de automação (n8n) pronta em `infra/n8n`

## Estrutura principal

```
├── index.html                  # Landing page
├── area-restrita.html          # Área do assinante (login Supabase)
├── acesso-restrito.html        # Painel do administrador
├── dossie-*.html               # Estratégias / dossiês
├── radar-*.html                # Radares setoriais
├── municipios/                 # Páginas dos municípios
├── style.css                   # Estilos compartilhados (base)
├── busca-global.js
├── infra/n8n/                  # Docker Compose + setup para VM
└── _redirects                  # Rotas limpas (Netlify)
```

## Segurança (importante)

1. A página `/acesso-restrito` usa proteção **apenas client-side**.  
   **Recomendação forte**: proteja a rota no Netlify (Password Protection) ou Cloudflare Access.

2. A senha temporária do administrador deve ser trocada imediatamente após o deploy.

3. O login de assinantes usa Supabase. Mantenha a função `cimrj_verify_login` bem protegida (RLS + validação de senha no lado do servidor).

## Deploy (custo zero)

### Opção recomendada: Netlify

1. Conecte o repositório no Netlify
2. Build command: (deixe vazio — site estático)
3. Publish directory: `.`
4. Domínio personalizado (opcional)

### Alternativa: Cloudflare Pages

Também gratuito e excelente performance.

## Automação (opcional — baixo custo)

A pasta `infra/n8n` contém:

- `docker-compose.yml` (n8n + Uptime Kuma)
- `setup.sh` (para VM Google Cloud e2-micro)
- `.env.example`

Custo estimado de uma VM pequena: R$ 0–50/mês.

## Histórico de melhorias (branch melhoria-fase1-fase2)

- **Segurança**: removida senha hardcoded antiga, isolada chave de sessão do admin, avisos de segurança adicionados.
- Documentação criada.
- Próximos passos planejados: consolidação de CSS, atualização de conteúdo, painel de gestão simples.

## Contato

contato@cim-rj.com.br

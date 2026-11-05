# RoxterJs Domains

**Vários sites. Um projeto Next.js. Um repositório. Um deploy.**

O **RoxterJs Domains** é um framework para Next.js (App Router) que permite criar vários sites no mesmo projeto. Cada domínio tem suas próprias páginas e SEO, e todos compartilham componentes, estilos e helpers.

## Por que usar?

Em vez de manter 5 projetos, 5 repositórios e 5 deploys, você mantém **um só**:

```text
src/domains/
    ├── site1.com.br/
    ├── site2.com.br/
    └── site3.com.br/
```

| Recurso                   | Resultado      |
| ------------------------- | -------------- |
| Repositórios              | 1              |
| Projetos Next.js          | 1              |
| Contas na Vercel          | 1              |
| Domínios                  | Ilimitados\*   |
| Páginas e SEO por domínio | Independentes  |
| Componentes e estilos     | Compartilhados |
| `params` e `searchParams` | Preservados    |

\*Limitado apenas pela infraestrutura utilizada.

## Como funciona (em 3 linhas)

1. Cada site é uma pasta em `src/domains/`.
2. As rotas do Next.js (`app/`) chamam o `RoxterJs` informando um `pageName` (ex.: `"home"`).
3. A cada requisição, o RoxterJs detecta o domínio acessado e renderiza a página `pageName` **daquele domínio**. Nenhum `if` necessário.

---

## Início rápido

```bash
npx create-next-app@latest my-project   # use App Router (e, de preferência, diretório src)
cd my-project
npm install @packrd/roxterjs-domains    # ou: yarn add @packrd/roxterjs-domains
```

Ao instalar, o pacote cria automaticamente:

- `next-domains.js`
- `src/helpers/roxterjs.js`
- `src/domains/example.com/` (domínio de exemplo)

---

## Passo a passo

### 1. Crie a pasta do domínio

Cada site é uma pasta em `src/domains/` com o nome do domínio:

```text
src/domains/example.com/
            ├── index.js        # exporta páginas e metadados
            ├── metadata.js     # SEO (título, descrição...)
            └── pages/
                ├── home.js
                └── blog.js
```

> O `next-domains.js` é atualizado automaticamente sempre que você cria ou altera uma pasta em `domains/`. Não é preciso editá-lo à mão.

### 2. Defina o SEO do domínio

```js
// src/domains/example.com/metadata.js
const Metadata = {
  title: "Example - Meu site",
  description: "Descrição exclusiva do meu site.",
};

export default Metadata;
```

Aceita qualquer propriedade de metadados suportada pelo Next.js.

### 3. Crie as páginas e registre no `index.js`

Páginas são componentes React comuns:

```jsx
// src/domains/example.com/pages/home.js
export default function Home() {
  return (
    <main>
      <h1>Bem-vindo ao Example!</h1>
    </main>
  );
}
```

```jsx
// src/domains/example.com/pages/blog.js
export default async function Blog({ params }) {
  const { slug } = await params;
  return (
    <main>
      <h1>Blog: {slug}</h1>
    </main>
  );
}
```

Registre tudo em `index.js`. A chave de cada página (`home`, `blog`) é o **`pageName`**, usado no próximo passo:

```js
// src/domains/example.com/index.js
import HOME from "./pages/home";
import BLOG from "./pages/blog";
import Metadata from "./metadata";

export default {
  metadata: Metadata,
  pages: {
    home: HOME,
    blog: BLOG,
  },
};
```

### 4. Conecte as rotas do Next.js

Em cada `page.js`, chame o `RoxterJs` com o `pageName` desejado:

```jsx
// src/app/page.js  → rota /
import RoxterJs from "@/helpers/roxterjs";

export default async function Page(props) {
  return await RoxterJs({ ...props, pageName: "home" });
}
```

```jsx
// src/app/blog/[slug]/page.js  → rota /blog/[slug]
import RoxterJs from "@/helpers/roxterjs";

export default async function Page(props) {
  return await RoxterJs({ ...props, pageName: "blog" });
}
```

O `...props` repassa `params`, `searchParams` e demais propriedades do Next.js para a sua página.

### 5. Configure o SEO global no layout

Faça isso uma única vez para que cada domínio use seus próprios metadados:

```jsx
// src/app/layout.js
import RoxterJs from "@/helpers/roxterjs";

export async function generateMetadata() {
  const rx = await RoxterJs();
  const { host } = rx;

  return rx[host]?.metadata || null;
}

export default async function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

---

## Testando domínios em ambiente local

O `localhost` não é um domínio real, então o RoxterJs não sabe qual site exibir. Para resolver, **simule** o domínio com uma variável de ambiente.

**1.** Crie (ou edite) o arquivo `.env.local` na raiz do projeto:

```bash
ROXTER_DOMAIN_LOCAL=site1.com
```

**2.** Rode o projeto:

```bash
npm run dev
```

Agora o `localhost` será tratado como `site1.com`.

**Para testar outro domínio:** troque o valor da variável e **reinicie o servidor** (o Next.js só lê o `.env.local` ao iniciar).

```bash
ROXTER_DOMAIN_LOCAL=site2.com
```

> O valor deve ser igual ao nome da pasta em `src/domains/`.

---

## Deploy na Vercel

1. Conecte o repositório GitHub à Vercel.
2. Adicione os domínios em **Settings → Domains** do projeto.
3. Configure o DNS de cada domínio conforme as instruções da Vercel.
4. Confirme que cada domínio tem sua pasta em `src/domains/`.
5. Faça o deploy.

Pronto: todos os sites são servidos pelo mesmo projeto.

---

## Trabalhando em equipe (opcional)

Uma boa prática é criar uma branch por domínio:

1. Crie uma branch com o nome do domínio (ex.: `loja.com.br`).
2. Desenvolva as páginas daquele site.
3. Abra um pull request para revisão.
4. Após aprovado, faça o merge na `main`.
5. O deploy de produção sai da `main`.

---

## Estrutura final de exemplo

```text
my-project/
├── .env.local                  # ROXTER_DOMAIN_LOCAL (apenas em desenvolvimento)
├── next-domains.js
└── src/
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   └── blog/[slug]/page.js
    ├── helpers/
    │   └── roxterjs.js
    └── domains/
        ├── example.com/
        │   ├── index.js
        │   ├── metadata.js
        │   └── pages/{home.js, blog.js}
        └── meusite.com.br/
            ├── index.js
            ├── metadata.js
            └── pages/{home.js, blog.js}
```

| Arquivo / Pasta       | Função                                             |
| --------------------- | -------------------------------------------------- |
| `next-domains.js`     | Registro dos domínios (atualizado automaticamente) |
| `helpers/roxterjs.js` | Função principal do framework                      |
| `domains/<dominio>/`  | Páginas e SEO de cada site                         |
| `app/`                | Rotas do Next.js que chamam o `RoxterJs`           |
| `.env.local`          | Define o domínio simulado no `localhost`           |

---

## Licença

MIT.

## Autor

**Rodrigo V. Buttura** — GitHub: [@packrd](https://github.com/packrd)

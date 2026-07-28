# 🧩 @packrd/roxterjs-domains

> Um framework para rodar **vários sites (multi-domínio)** dentro de um **único projeto Next.js**.

Se você já precisou manter 3, 5 ou 10 sites parecidos — cada um em seu próprio repositório, seu próprio deploy na Vercel e seu próprio conjunto de componentes duplicados — este pacote resolve exatamente esse problema.

Com o `roxterjs-domains`, todos os seus domínios vivem **dentro do mesmo projeto Next.js**, compartilhando componentes e estilos, mas mantendo páginas, SEO e conteúdo totalmente independentes.

```
empresa.com     → institucional
loja.com.br     → e-commerce
blog.uk         → blog
landing.app     → landing page
```

Todos rodando a partir do **mesmo código-fonte**, do **mesmo deploy** e da **mesma conta Vercel**.

---

## 📌 Por que usar?

| Sem o pacote                                | Com o pacote                                           |
| ------------------------------------------- | ------------------------------------------------------ |
| 1 repositório por site                      | 1 repositório para todos                               |
| 1 deploy/conta por site                     | 1 único deploy                                         |
| Componentes duplicados                      | Componentes compartilhados                             |
| Manutenção multiplicada                     | Manutenção centralizada                                |
| SEO configurado manualmente em cada projeto | SEO isolado por domínio, mas organizado em um só lugar |

---

## 🧠 Como funciona (visão geral)

A ideia central é simples: **cada domínio é uma pasta**, e dentro dela ficam suas páginas e metadados.

Quando alguém acessa `loja.com.br`, o framework:

1. Identifica qual domínio foi acessado (pelo host da requisição);
2. Busca a pasta correspondente a esse domínio;
3. Renderiza a página certa, com o SEO e os componentes daquele domínio.

Tudo isso acontece automaticamente — você só precisa organizar as pastas e registrar os domínios.

---

## 🚀 Instalação

```bash
npm install @packrd/roxterjs-domains
```

ou, se preferir Yarn:

```bash
yarn add @packrd/roxterjs-domains
```

Assim que instalado, o pacote cria automaticamente a estrutura inicial de pastas e arquivos no seu projeto:

```
src/
├── helpers/
│   └── roxterjs.js               ← função principal do framework
│
└── roxterjs-domains/
    ├── index.js                  ← registro central de todos os domínios
    └── example.com/              ← exemplo de domínio já configurado
        ├── index.js
        ├── metadata.js
        └── pages/
            └── home.js
```

> 💡 Use a pasta `example.com` como modelo para criar seus próprios domínios.

---

## 📁 Anatomia de um domínio

Cada site do seu projeto é representado por **uma pasta com o nome do domínio**, por exemplo:

```
roxterjs-domains/example.com/
```

Dentro dela, três peças fazem tudo funcionar:

| Arquivo       | Para que serve                                                       |
| ------------- | -------------------------------------------------------------------- |
| `metadata.js` | Título, descrição, SEO e demais metadados do domínio                 |
| `pages/`      | Onde ficam os componentes de cada página do site                     |
| `index.js`    | "Junta tudo": exporta páginas, metadados e componentes desse domínio |

### Exemplo do `index.js` de um domínio

```js
// roxterjs-domains/example.com/index.js

import PageHomeExampleCom from "./pages/home";
import PageBlogExampleCom from "./pages/blog";
import MetadataExampleCom from "./metadata";

export default {
  metadata: MetadataExampleCom,
  pages: {
    home: PageHomeExampleCom, // rota "home"
    blog: PageBlogExampleCom, // rota "blog"
  },
};
```

Cada chave dentro de `pages` vira um **identificador de rota** (`pageName`), que você usa nas suas rotas do Next.js para dizer "renderize esta página aqui".

---

## 🛣️ Conectando as rotas do Next.js

No App Router do Next.js, cada `page.js` chama o `RoxterJs`, informando **qual página quer renderizar** através do `pageName`:

```jsx
// app/page.js  → rota "/"
import RoxterJs from "@/helpers/roxterjs";

export default async function Page(props) {
  return await RoxterJs({
    ...props,
    pageName: "home", // deve bater com a chave definida em pages: {}
  });
}
```

```jsx
// app/blog/[slug]/page.js  → rota "/blog/algum-slug"
import RoxterJs from "@/helpers/roxterjs";

export default async function Page(props) {
  return await RoxterJs({
    ...props,
    pageName: "blog",
  });
}
```

O framework identifica sozinho **qual domínio foi acessado** e busca, dentro dele, a página correspondente ao `pageName` informado. Você não precisa escrever lógica de "se o domínio for X, mostre Y" — isso já é feito internamente.

---

## 🗂️ Registrando os domínios

Existe um arquivo especial na raiz da pasta `roxterjs-domains`, que **não pode ser removido**:

```
roxterjs-domains/index.js
```

É nele que você lista **todos os domínios ativos** do projeto, associando cada domínio (string) à pasta correspondente:

```js
// roxterjs-domains/index.js

import Site1 from "@/roxterjs-domains/site1.com";
import Site2 from "@/roxterjs-domains/site2.com";

export default {
  "site1.com": Site1,
  "site2.com": Site2,
};
```

> ⚠️ Se um domínio não estiver registrado aqui, o framework não vai encontrá-lo — mesmo que a pasta exista.

---

## 🎨 Layout compartilhado (metadados)

No `app/layout.js`, você define a estrutura que envolve todas as páginas — mas cada domínio pode ter seu próprio metadados de SEO:

```jsx
// app/layout.js
import RoxterJs from "@/helpers/roxterjs";

export async function generateMetadata() {
  const domain = await RoxterJs();
  return domain.pmd[domain.host].metadata; // SEO específico do domínio atual
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Com isso, automaticamente cada domínio passa a ter:

- ✅ Suas próprias páginas
- ✅ Seus próprios metadados/SEO
- ✅ Componentes compartilhados do restante do projeto

---

## ➕ Criando um novo domínio (passo a passo)

**1.** Duplique a pasta de exemplo (ou uma pasta de domínio existente):

```
roxterjs-domains/
├── site1.com/
├── site2.com/
├── site3.com/   ← novo domínio
└── index.js
```

**2.** Ajuste o `metadata.js` e as páginas dentro de `site3.com/pages`.

**3.** Registre o novo domínio no `roxterjs-domains/index.js`:

```js
import Site1 from "@/roxterjs-domains/site1.com";
import Site2 from "@/roxterjs-domains/site2.com";
import Site3 from "@/roxterjs-domains/site3.com";

export default {
  "site1.com": Site1,
  "site2.com": Site2,
  "site3.com": Site3,
};
```

Pronto — o domínio já está ativo no projeto.

---

## 💻 Testando domínios em ambiente local

Como o `localhost` não é um domínio real, você pode "simular" qual domínio deseja testar através de uma variável de ambiente.

No arquivo `.env.local`:

```
ROXTER_DOMAIN_LOCAL=site1.com
```

Dessa forma, ao rodar `npm run dev`, o `localhost` será tratado como se fosse `site1.com`. Para testar outro domínio, basta trocar o valor dessa variável e reiniciar o servidor.

---

## 📋 Requisitos

| Tecnologia | Versão mínima |
| ---------- | ------------- |
| Node.js    | 18+           |
| Next.js    | 14+           |
| React      | 18+           |

---

## 🛠️ Contribuindo / rodando localmente

Se você quer contribuir com o pacote ou testá-lo antes de publicar:

```bash
# 1. Clone o repositório
git clone https://github.com/packrd/roxterjs-domains.git
cd roxterjs-domains

# 2. Instale as dependências
npm install

# 3. Crie o link local do pacote
npm link
```

No projeto onde você quer testar o pacote:

```bash
npm link @packrd/roxterjs-domains
```

Agora qualquer alteração feita no pacote será refletida no projeto que o consome.

---

## ❓ Perguntas frequentes

**Um domínio pode ter páginas que outros não têm?**
Sim. As páginas são definidas individualmente dentro de `pages: {}` de cada domínio — não há obrigatoriedade de todos terem as mesmas rotas.

**O que acontece se eu esquecer de registrar um domínio no `index.js`?**
O framework não conseguirá localizá-lo, mesmo que a pasta exista fisicamente no projeto.

**Como a Vercel identifica o domínio?**
Basta você registrar os nomes dos domínios em `Setting` dentro da Vercel e apontar os DNSs para ele.

---

## 📄 Licença

Distribuído sob a licença **MIT**.

Desenvolvido por **Rodrigo V. Buttura** • [github.com/packrd](https://github.com/packrd)

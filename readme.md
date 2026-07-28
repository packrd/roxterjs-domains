# 🧩 @packrd/roxterjs-domains

### Multi-domain framework para projetos **Next.js**

Imagine administrar vários projetos front-end diferentes, cada um em uma conta separada da _Vercel_, com seus próprios domínios e configurações no GitHub. Agora imagine fazer tudo isso dentro de um único projeto **_Next.js_**.

Com este _micro-framework_, você organiza **_múltiplos sites_** — cada um com seu próprio domínio — dentro da mesma base de código. Basta separar cada aplicação em pastas específicas (por domínio) e o framework cuida do restante: roteamento, carregamento de componentes, metadados e a estrutura necessária para cada site funcionar de forma independente.

**O resultado?**

- Um único repositório,
- Uma única conta na Vercel,
- Vários domínios, cada um servindo sua própria aplicação.

Perfeito para projetos multi-domínio como:
example.com, example-2.com, example-3.com — todos mantidos e versionados no mesmo lugar, com máxima organização e zero dor de cabeça.

_Para executar o projeto localmente utilizando um domínio específico, basta definir o ambiente de desenvolvimento local no arquivo **.env.local**:_

```
ROXTER_DOMAIN_LOCAL=example.com
```

---

## 🚀 Instalação

```bash
npm install @packrd/roxterjs-domains
```

ou

```bash
yarn add @packrd/roxterjs-domains
```

---

## ⚙️ Inicialização

Após instalar será gerado automaticamente a estrutura base do PMD (Project Multi Domain), adicionando um exemplo de domínio no seu projeto:

Isso criará a seguinte estrutura no seu projeto:

```
src/
└── roxterjs-domains/
    ├── main.js
    └── example.com/
        ├── index.js
        ├── metadata.js
        └── pages/
            └── home.js
```

Cada domínio terá:

- **metadata.js** → Metadados e SEO do domínio
- **pages/** → Páginas específicas do domínio
- **components/** → Componentes do domínio
- **index.js** → Arquivo principal que exporta as rotas e metadados

**Importante:**

- O arquivo `main.js`, localizado na pasta `/roxterjs-domains`, não deve ser excluído. Todos os domínios devem ser atribuídos a ele. A seguir, apresentamos um exemplo de uso:

---

## 🧩 Configuração do domínio

No arquivo `src/roxterjs-domains/main.js` você define quais domínios estão ativos:

```js
import ExampleCom from "@/pmd/domains/example.com";
import Example2Com from "@/pmd/domains/example2.com";

export default {
  "example.com": ExampleCom,
  "example-2.com": Example2Com,
};
```

---

No seu projeto **Next.js**, nos arquivos onde normalmente seriam criadas as páginas renderizadas, basta importar e utilizar o módulo **RoxterJsDomain** dentro de um Server Component.

Por exemplo, na rota `app/page.js`:

```
src/
└── app/
    └── page.js
```

```jsx
import RoxterJsDomain from "@packrd/roxterjs-domains";

export default async function Page(props) {
  return await RoxterJsDomain({ ...props, pageName: "home" });
}
```

Isso fará com que o framework:

- Detecte automaticamente o domínio (`example.com`, `example-2.com`, etc.)
- Retorne o componente correto com os `props` e `searchParams` necessários

---

Utilize o módulo `RoxterJsDomain` na rota `app/layout.js`:

```
src/
└── app/
    └── layout.js
```

```jsx
import RoxterJsDomain from "@packrd/roxterjs-domains";

export async function generateMetadata() {
  const domain = await RoxterJsDomain();
  return domain.pmd[domain?.host]?.metadata;
}

export default async function RootLayout({ children }) {
  const domain = await RoxterJsDomain();
  const footer = domain.pmd[domain?.host]?.components?.footer;
  const header = domain.pmd[domain?.host]?.components?.header;

  return (
    <html lang="en">
      <body>
        {header ? <header>{header}</header> : ""}
        {children}
        {footer ? <footer>{footer}</footer> : ""}
      </body>
    </html>
  );
}
```

Isso fará com que o framework:

- Carregue a página e metadados correspondentes
- Detecte automaticamente o domínio (`example.com`, `example-2.com`, etc.)

---

## 🪄 Personalização

Você pode criar novos domínios duplicando a pasta `example.com`:

```
src/
└── roxterjs-domains/
    ├── main.js
    └── example.com/
        ├── index.js
        ├── metadata.js
        └── pages/
            └── home.js
    └── example-2.com/
        ├── index.js
        ├── metadata.js
        └── pages/
            └── home.js
    └── example-3.com/
        ├── index.js
        ├── metadata.js
        └── pages/
            └── home.js

```

E editar o `metadata.js` de cada domínio, por exemplo:

```js
export default {
  title: {
    template: "%s | Meu Domínio",
    default: "Página inicial - Meu Domínio",
  },
  description: "Projeto multi-domínio com Next.js",
};
```

## ⚠️ Requisitos

- Node.js `>=18`
- Next.js `>=14`
- React `>=18`

---

## 💡 Dica

Se estiver em ambiente de desenvolvimento local, defina no `.env.local`:

```
ROXTER_DOMAIN_LOCAL=example.com
```

Assim, o domínio `localhost` será tratado como `example.com`, `example-2.com`, `example-3.com` ou com o `nome do domínio do seu projeto` para simular o ambiente real no modo de desenvolvimento.

---

## 📦 Scripts disponíveis

| Comando       | Descrição                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| `npm run dev` | Inicie seu projeto Next.js normalmente (o módulo se integra automaticamente) |

---

## 🛠️ Desenvolvimento

Para contribuir com o projeto:

```bash
git clone https://github.com/packrd/roxterjs-domains.git
cd roxterjs-domains
npm install
npm link
```

Depois, no seu projeto Next.js:

```bash
npm link @packrd/roxterjs-domains
```

Isso permite testar localmente o módulo durante o desenvolvimento.

---

## 📜 Licença

[MIT License](./LICENSE)  
Desenvolvido por **Rodrigo V Buttura** • [@packrd](https://github.com/packrd)

---

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROXTER_DOMAIN_PATH = "src/roxterjs-domain";
const ROXTER_DOMAIN_PATH_ROOT = "@/roxterjs-domain";

/**
 * Diretório do projeto que está instalando o pacote (não o diretório do
 * próprio pacote dentro de node_modules). O npm expõe isso via INIT_CWD.
 * Fallback para process.cwd() cobre execuções manuais/debug do script.
 */
const projectRoot = process.env.INIT_CWD || process.cwd();

/**
 * Evita rodar o scaffold quando o próprio repositório do pacote está sendo
 * instalado/desenvolvido (ex: `npm install` dentro do repo do
 * roxterjs-domain, ou `npm link`). Só executa quando o script está mesmo
 * dentro de um node_modules — ou seja, instalado como dependência de outro
 * projeto.
 */
const isInstalledAsDependency = __dirname
  .split(path.sep)
  .includes("node_modules");

/**
 * Sinaliza ambiente de CI/build/deploy (Vercel, Netlify, GitHub Actions,
 * GitLab CI, Railway, Render, etc.). Nesses casos, o npm install roda como
 * parte do pipeline de produção/build, e o pacote deve apenas ser lido —
 * nunca escrever no filesystem.
 */
const isCiOrDeployEnvironment = Boolean(
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.GITHUB_ACTIONS ||
  process.env.GITLAB_CI ||
  process.env.RENDER ||
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.NOW_BUILDER,
);

/** Permite ao usuário do pacote desligar o scaffold explicitamente. */
const isScaffoldDisabledByUser =
  process.env.ROXTER_DOMAIN_SKIP_SCAFFOLD === "true";

const createFolder = (relativePath) => {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Folder created: ${relativePath}`);
  }
};

const createFile = (relativePath, template) => {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, template);
    console.log(`✓ File created: ${relativePath}`);
  }
};

function scaffold() {
  if (!fs.existsSync(`${ROXTER_DOMAIN_PATH}/main.js`)) {
    createFolder(`${ROXTER_DOMAIN_PATH}/example.com/pages`);

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/metadata.js`,
      `export default {
      title: { template: "%s | RoxterJs Domain", default: "Example.com - RoxterJs Domain" },
      description: "Project RoxterJs Domain",
      keywords: ["roxterjs domain"],
      icons: {},
      robots: "index, follow",
      openGraph: {},
    };
    `,
    );

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/pages/home.js`,
      `import React from "react";
    
    export default function HomeExampleCom() {
      return <>Hello World, page Example.com</>;
    }
    `,
    );

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/index.js`,
      `import HomeExampleCom from "./pages/home";
    import MetadataExample from "./metadata";
    
    export default {
      metadata: MetadataExample,
      pages: {
        home: HomeExampleCom,
      },
      components: {},
    };
    `,
    );
  }

  createFile(
    `${ROXTER_DOMAIN_PATH}/main.js`,
    `import DomainExampleCom from "${ROXTER_DOMAIN_PATH_ROOT}/example.com";

export default {
  "example.com": DomainExampleCom,
};
`,
  );

  console.log("✓ RoxterJs Domain: scaffold concluído em", projectRoot);
}

function main() {
  if (!isInstalledAsDependency) {
    // rodando dentro do próprio repo do pacote — não faz nada
    return;
  }

  if (isScaffoldDisabledByUser) {
    console.log(
      "RoxterJs Domain: scaffold desabilitado via ROXTER_DOMAIN_SKIP_SCAFFOLD.",
    );
    return;
  }

  if (isCiOrDeployEnvironment) {
    // build/deploy: apenas leitura, nunca escreve no filesystem
    return;
  }

  try {
    scaffold();
  } catch (err) {
    // Nunca deixa uma falha de scaffold quebrar o `npm install` do usuário
    console.log("RoxterJs Domain: erro ao criar arquivos de exemplo:", err);
  }
}

main();

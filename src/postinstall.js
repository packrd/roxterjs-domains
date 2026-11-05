import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const projectRoot = process.env.INIT_CWD || process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasSrcDir = fs.existsSync(path.join(projectRoot, "src"));
const ROOT_SRC = hasSrcDir ? "src/helpers" : "helpers";

const ROXTER_DOMAIN_PATH = hasSrcDir ? "src/domains" : "domains";
const ROXTER_DOMAIN_PATH_ROOT = "@/domains";
const ROXTER_NEXT_DOMAINS = "next-domains.js";

function warnIfAliasMissing() {
  const configPath = ["jsconfig.json", "tsconfig.json"]
    .map((file) => path.join(projectRoot, file))
    .find((p) => fs.existsSync(p));

  const expectedTarget = hasSrcDir ? "./src/*" : "./*";

  if (!configPath) {
    console.log(
      `⚠ RoxterJs Domains: não encontrei jsconfig.json nem tsconfig.json na raiz do projeto.\n` +
        `  Crie um jsconfig.json com:\n` +
        `  { "compilerOptions": { "paths": { "@/*": ["${expectedTarget}"] } } }`,
    );
    return;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const paths = parsed?.compilerOptions?.paths?.["@/*"];
    const hasCorrectAlias =
      Array.isArray(paths) && paths.includes(expectedTarget);

    if (!hasCorrectAlias) {
      console.log(
        `⚠ RoxterJs Domains: o alias "@/*" em ${path.basename(configPath)} ` +
          `não aponta para "${expectedTarget}" (o esperado para este projeto).\n` +
          `  Ajuste compilerOptions.paths para:\n` +
          `  { "@/*": ["${expectedTarget}"] }\n` +
          `  Sem isso, "@/domains/index" não será encontrado em runtime.`,
      );
    }
  } catch {
    // só deixamos de validar silenciosamente.
  }
}

const isInstalledAsDependency = __dirname
  .split(path.sep)
  .includes("node_modules");

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

export const createFile = (relativePath, template, subscribe = false) => {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath) || subscribe) {
    fs.writeFileSync(fullPath, template);
    console.log(`✓ File created: ${relativePath}`);
  }
};

const copyFile = (sourceRelativePath, destinationRelativePath) => {
  const sourcePath = path.join(__dirname, sourceRelativePath);
  const destinationPath = path.join(projectRoot, destinationRelativePath);

  if (!fs.existsSync(destinationPath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`✓ File copied: ${destinationRelativePath}`);
  }
};

function scaffold() {
  if (!fs.existsSync(`${ROXTER_DOMAIN_PATH}/index.js`)) {
    createFolder(`${ROXTER_DOMAIN_PATH}/example.com/pages`);

    createFolder(`${ROOT_SRC}`);
    copyFile("index.js", `${ROOT_SRC}/roxterjs.js`);

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/metadata.js`,
      `export default {
  title: { template: "%s | RoxterJs Domains", default: "Example.com - RoxterJs Domains" },
  description: "Project RoxterJs Domains",
  keywords: ["roxterjs domains"],
  icons: {},
  robots: "index, follow",
  openGraph: {},
};
    `,
    );

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/pages/home.js`,
      `import React from "react";
    
  export default function PageHomeExampleCom() {
    return <>Hello RoxterJs Domains, page Example.com</>;
  }
    `,
    );

    createFile(
      `${ROXTER_DOMAIN_PATH}/example.com/index.js`,
      `import PageHomeExampleCom from "./pages/home";
import MetadataExampleCom from "./metadata";

export default {
  metadata: MetadataExampleCom,
  pages: {
    home: PageHomeExampleCom,
  }
};
    `,
    );
  }

  createFile(
    `${ROXTER_NEXT_DOMAINS}`,
    `import ExampleCom from "${ROXTER_DOMAIN_PATH_ROOT}/example.com";

export default {
  "example.com": ExampleCom,
};
`,
  );

  console.log("✓ RoxterJs Domains: scaffold concluído em", projectRoot);
}

function main() {
  /*  if (!isInstalledAsDependency) {
    // rodando dentro do próprio repo do pacote — não faz nada
    //return;
  }

  if (isScaffoldDisabledByUser) {
    console.log(
      "RoxterJs Domains: scaffold desabilitado via ROXTER_DOMAIN_SKIP_SCAFFOLD.",
    );
    //return;
  }

  if (isCiOrDeployEnvironment) {
    // build/deploy: apenas leitura, nunca escreve no filesystem
    //return;
  } */

  try {
    scaffold();
    warnIfAliasMissing();
  } catch (err) {
    // Nunca deixa uma falha de scaffold quebrar o `npm install` do usuário
    console.log("RoxterJs Domains: erro ao criar arquivos de exemplo:", err);
  }
}

main();

import { headers } from "next/headers";
import path from "node:path";
import fs from "node:fs";

const NODE_ENV = process.env.NODE_ENV;
const PROJECT_ROOT = process.env.INIT_CWD || process.cwd();
const DIR_DOMAINS = path.join(PROJECT_ROOT, "src/domains");
const DIR_NEXT_DOMAINS = "next-domains.js";

function MappingDomains() {
  const DOMAIN_REGEX =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  const DOMAINS = [];

  for (const entry of fs.readdirSync(DIR_DOMAINS, {
    withFileTypes: true,
  })) {
    if (entry.isDirectory() && DOMAIN_REGEX.test(entry.name)) {
      DOMAINS.push(entry.name);
    }
  }

  const ImportRoutes = DOMAINS.map((it) => {
    const name = it
      .replace(/(^|[^a-z])([a-z])/gi, (_, s, l) => l.toUpperCase())
      .replace(/[^a-z]/gi, "");
    return {
      name,
      domain: it,
    };
  });

  ImportRoutes.map(({ name, domain }) => {
    const isFileIndex = path.join(DIR_DOMAINS, `${domain}/index.js`);
    if (!fs.existsSync(isFileIndex) && domain) {
      fs.writeFileSync(
        isFileIndex,
        `export default {
  metadata: "",
  pages: {},
};`,
      );
    }
  });

  const fullPath = path.join(PROJECT_ROOT, DIR_NEXT_DOMAINS);

  fs.writeFileSync(
    fullPath,
    `${ImportRoutes.map(({ name, domain }) => `import ${name} from "@/domains/${domain}";\n`).join("")}
  
export default {
  ${ImportRoutes.map(({ name, domain }) => `"${domain}": ${name}`).join(",\n")}
};`,
  );
}

if (NODE_ENV == "development" && fs.existsSync(DIR_DOMAINS)) {
  fs.watch(DIR_DOMAINS, { recursive: true }, (_, file) => {
    if (file) MappingDomains();
  });
}

const isLocalHost = (host) =>
  /localhost/.test(host)
    ? process.env.ROXTER_DOMAIN_LOCAL || "example.com"
    : host;

const PageDomainNotFound = async () => {
  try {
    const NotFoundModule = await import("@/app/not-found");
    const Component = NotFoundModule.default || NotFoundModule;
    return <Component />;
  } catch {
    return <main id="page-not-found">Page Not Found</main>;
  }
};

const ImportModuleApp = async () => {
  try {
    const appModule = await import("../../next-domains.js");
    return appModule.default || appModule;
  } catch (Err) {
    console.log("RoxterJs error:", Err);
    return null;
  }
};

export default async function RoxterJs(data) {
  try {
    const serverHeaders = await headers();
    const moduleApp = await ImportModuleApp();

    const {
      params = {},
      searchParams = {},
      pageName,
      ...props
    } = (await data) || {};

    const rawHost = serverHeaders.get("host") || "";
    const host = isLocalHost(rawHost)
      .replace(/^www\./, "")
      .toLowerCase();

    const properties = {
      pageName,
      params,
      searchParams,
      host,
      ...props,
      ...moduleApp,
    };

    if (!pageName) return properties;

    const Page = moduleApp?.[host]?.pages?.[pageName];
    if (Page) return <Page {...properties} />;

    const ErrorPage = moduleApp?.[host]?.pages?.error;
    if (ErrorPage) return <ErrorPage {...properties} />;

    return await PageDomainNotFound();
  } catch (Err) {
    console.log("RoxterJs Server error: ", Err);
    return null;
  }
}

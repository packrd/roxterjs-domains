import { headers } from "next/headers";

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
    return <>Page Not Found</>;
  }
};

const ImportModuleApp = async () => {
  try {
    const appModule = await import("@/roxterjs-domain/main");
    return appModule.default || appModule;
  } catch (Err) {
    console.log("PMD Import module app error:", Err);
    return null;
  }
};

export default async function NextJsDomain(data) {
  try {
    const serverHeaders = await headers();
    const App = await ImportModuleApp();

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

    const ComponentRender =
      pageName && App?.[host]?.pages?.[pageName]
        ? App[host].pages[pageName]
        : (App?.[host]?.pages?.error ?? (await PageDomainNotFound()));

    const properties = {
      pageName,
      ...props,
      params,
      searchParams,
      host,
      pmd: App,
    };

    if (pageName) return <ComponentRender {...properties} />;

    return properties;
  } catch (Err) {
    console.log("Nextjs Domain Server error: ", Err);
    return null;
  }
}

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
    return <main id="page-not-found">Page Not Found</main>;
  }
};

const ImportModuleApp = async () => {
  try {
    const appModule = await import("@/roxterjs-domains");
    return appModule.default || appModule;
  } catch (Err) {
    console.log("RoxterJs error:", Err);
    return null;
  }
};

export default async function RoxterJs(data) {
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

    const properties = {
      pageName,
      ...props,
      params,
      searchParams,
      host,
      pmd: App,
    };

    if (!pageName) return properties;

    const Page = App?.[host]?.pages?.[pageName];
    if (Page) return <Page {...properties} />;

    const ErrorPage = App?.[host]?.pages?.error;
    if (ErrorPage) return <ErrorPage {...properties} />;

    return await PageDomainNotFound();
  } catch (Err) {
    console.log("RoxterJs Server error: ", Err);
    return null;
  }
}

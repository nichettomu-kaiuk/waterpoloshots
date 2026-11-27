import { display, body, mono } from "@/lib/fonts";

// The <html>/<body> shell shared by the app's root layouts (public
// tournament pages, the tournament chooser, the admin panel). The site has
// several root layouts because the theme class on <html> depends on the
// tournament being viewed.
export default function RootHtml({
  themeClass = "",
  brandVars,
  children,
}: {
  themeClass?: string;
  brandVars?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable} ${themeClass}`.trim()}>
      <body className="font-body min-h-screen antialiased" style={brandVars}>
        {children}
      </body>
    </html>
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
// react18-json-view ships its own CSS separate from the JS. We load it HERE
// (at the dev-harness entry point) rather than inside JsonViewer.tsx because:
//   1. Extensions load this CSS via `?inline` in content.tsx (it needs to be
//      injected into the shadow DOM at runtime, not the page's document).
//      If JsonViewer.tsx also imported it normally, Vite would emit an extra
//      dist/content.css file that's dead code — the manifest never loads it.
//   2. CSS side-effects in component files are fragile: any importer of
//      JsonViewer would get the CSS whether they want it or not. Entry-point
//      imports make the CSS-loading contract explicit per consumer.
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ContentScriptApp } from "@jsonly/extension-ui";

import tailwindCss from "./content.css?inline";
import jsonViewCss from "react18-json-view/src/style.css?inline";
import jsonViewDarkCss from "react18-json-view/src/dark.css?inline";

function bootstrap() {
  const host = document.createElement("div");
  host.id = "jsonly-root";
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.overflow = "visible";
  host.style.zIndex = "2147483647";

  // Block host-page keyboard shortcuts from firing while the viewer is
  // focused. Attach on `host` (light DOM) in bubble phase so the event
  // fully propagates through the shadow tree first — React handlers and
  // contentEditable default actions (typing, backspace, selection-replace)
  // run normally, and only then do we cut off propagation to
  // documentElement/document/window.
  //
  // Don't attach this inside the shadow DOM (on `container`): a descendant
  // bubble-phase stopPropagation during shadow dispatch breaks
  // contentEditable editing on Firefox (and on Chrome in combination with
  // certain React/shadow-DOM timings). Don't use { capture: true } here
  // either — capture phase runs BEFORE the event enters the shadow tree.
  for (const eventType of ["keydown", "keyup", "keypress"] as const) {
    host.addEventListener(eventType, (e) => e.stopPropagation());
  }

  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  // Concatenate the three CSS chunks that will be injected into the shadow DOM.
  //
  // Order matters: library CSS first, Tailwind+our CSS second.
  //
  // Our highlight rules in extension.css are scoped as `.json-view
  // .jsonly-search-hit` to MATCH the specificity of react18-json-view's
  // `.json-view .json-view--string { color: ... }` (both 0,2,0). With equal
  // specificity, source order decides — so we need our rules (inside
  // tailwindCss) to come AFTER the library's. That makes highlighted-value
  // text turn black as intended.
  //
  // Don't try to "fix" this by wrapping jsonViewCss in `@layer library { ... }`.
  // That would demote ALL library rules below Tailwind's `@layer base`,
  // and Tailwind's preflight includes `svg, img, video, ... { display: block }`.
  // The library's `.json-view .json-view--copy { display: inline-block }` for
  // copy/edit icons would lose, stacking them vertically.
  style.textContent = [jsonViewCss, jsonViewDarkCss, tailwindCss].join("\n");
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.id = "jsonly-react-root";
  shadow.appendChild(container);

  createRoot(container).render(
    <StrictMode>
      <ContentScriptApp />
    </StrictMode>,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

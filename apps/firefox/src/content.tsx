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
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = [tailwindCss, jsonViewCss, jsonViewDarkCss].join("\n");
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

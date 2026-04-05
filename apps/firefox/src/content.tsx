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

  // Firefox-only workaround: Firefox's contentEditable editor engine inside
  // a shadow root does not process Backspace / Delete / select-then-delete
  // natively — character insertion works, but deletion silently no-ops.
  // Confirmed repro: typing appends characters, backspace doesn't remove
  // them; clicking to reposition the caret doesn't help; execCommand('delete')
  // doesn't help either (it delegates to the same broken editor path).
  //
  // Workaround: intercept Backspace/Delete in capture phase and perform
  // the deletion by directly mutating the text node under the caret.
  //
  // Caret position: we read it from `window.getSelection()`. In current
  // Firefox, the document-level selection IS populated for shadow-root
  // contentEditable focus (that's how the editor can insert characters at
  // the caret on keypress). We then mutate the Text node's `data` directly
  // and re-collapse the range to the new caret offset. A synthetic `input`
  // event is dispatched so react18-json-view's `onChange` wiring sees the
  // update — the library reads `valueRef.current.innerText` at "done" time
  // regardless, but firing `input` keeps behavior consistent with native.
  //
  // Fallback: if the selection isn't inside the target (shouldn't happen
  // given typing works, but defensive), drop the last char of innerText
  // for Backspace so the user at least sees something happen.
  shadow.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const target = e.target;
      if (!(target instanceof HTMLElement) || !target.isContentEditable) return;
      e.preventDefault();

      const sel = window.getSelection();
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      const rangeInTarget =
        range != null &&
        target.contains(range.startContainer) &&
        target.contains(range.endContainer);

      if (!rangeInTarget) {
        // Fallback — can't locate caret. Strip the last character so
        // backspace isn't a total no-op. Delete key is ignored in this
        // branch because "last char" isn't meaningful for forward-delete.
        if (e.key === "Backspace") {
          const text = target.innerText;
          if (text.length > 0) target.innerText = text.slice(0, -1);
          target.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
      }

      if (!range.collapsed) {
        // Selection-delete: just remove the selected content.
        range.deleteContents();
        sel!.removeAllRanges();
        sel!.addRange(range);
        target.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // Caret is collapsed — delete one character, forward or backward.
      const node = range.startContainer;
      const offset = range.startOffset;
      if (node.nodeType !== Node.TEXT_NODE) {
        // Caret is between nodes, not inside a text node. Rare for this
        // library's simple `"<value>"` single-text-node content, but handle
        // it by deferring to the sibling text node if present.
        const el = node as Element;
        const candidate =
          e.key === "Backspace"
            ? el.childNodes[offset - 1]
            : el.childNodes[offset];
        if (candidate?.nodeType === Node.TEXT_NODE) {
          const textNode = candidate as Text;
          const data = textNode.data;
          if (e.key === "Backspace") {
            textNode.data = data.slice(0, -1);
            range.setStart(textNode, textNode.data.length);
          } else {
            textNode.data = data.slice(1);
            range.setStart(textNode, 0);
          }
          range.collapse(true);
          sel!.removeAllRanges();
          sel!.addRange(range);
          target.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
      }

      const textNode = node as Text;
      const data = textNode.data;
      if (e.key === "Backspace" && offset > 0) {
        textNode.data = data.slice(0, offset - 1) + data.slice(offset);
        range.setStart(textNode, offset - 1);
      } else if (e.key === "Delete" && offset < data.length) {
        textNode.data = data.slice(0, offset) + data.slice(offset + 1);
        range.setStart(textNode, offset);
      } else {
        return;
      }
      range.collapse(true);
      sel!.removeAllRanges();
      sel!.addRange(range);
      target.dispatchEvent(new Event("input", { bubbles: true }));
    },
    { capture: true },
  );

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

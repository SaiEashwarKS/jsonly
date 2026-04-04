import { useState } from "react";
import { JsonViewer } from "./components/JsonViewer";

const SAMPLE_JSON = JSON.stringify(
  {
    name: "jsonly",
    version: "0.1.0",
    features: ["detect", "format", "search", "edit"],
    config: {
      theme: "auto",
      collapsed: 2,
      nested: {
        deep: {
          value: true,
          items: [1, 2, 3],
        },
      },
    },
    count: 42,
    active: true,
    nullable: null,
  },
  null,
  2,
);

export function App() {
  const [showViewer, setShowViewer] = useState(true);
  const [json, setJson] = useState(SAMPLE_JSON);

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-gray-50 p-8 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        jsonly — JsonViewer Demo
      </h1>
      <button
        type="button"
        onClick={() => setShowViewer((v) => !v)}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        {showViewer ? "Hide Viewer" : "Show Viewer"}
      </button>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="h-64 w-full max-w-lg rounded border border-gray-300 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        spellCheck={false}
      />
      {showViewer && <JsonViewer json={json} onClose={() => setShowViewer(false)} />}
    </div>
  );
}

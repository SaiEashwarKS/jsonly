import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import { useDrag } from "../hooks/useDrag";
import { useSystemTheme } from "../hooks/useSystemTheme";
import { JsonToolbar } from "./JsonToolbar";

export interface JsonViewerProps {
  json: string;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
}

export function JsonViewer({
  json,
  onClose,
  defaultPosition,
}: JsonViewerProps) {
  const { isDark } = useSystemTheme();
  const { position, titleBarRef } = useDrag({
    initialPosition: defaultPosition,
  });

  const [collapseDepth, setCollapseDepth] = useState<number | boolean>(2);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapseKey, setCollapseKey] = useState(0);
  const [isRaw, setIsRaw] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const originalData = useRef<any>(null);

  const parsed = useMemo(() => {
    try {
      return { data: JSON.parse(json), error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [json]);

  // Keep an untouched deep clone of the original for raw view & reset
  if (parsed.data !== null && originalData.current === null) {
    originalData.current = structuredClone(parsed.data);
  }

  // The library's working copy that gets mutated in-place
  const editedData = useRef<any>(null);
  if (parsed.data !== null && editedData.current === null) {
    editedData.current = parsed.data;
  }

  const handleChange = useCallback(() => {
    setIsModified(true);
    forceUpdate();
  }, []);

  function handleToggleCollapse() {
    if (isCollapsed) {
      setCollapseDepth(false);
      setIsCollapsed(false);
    } else {
      setCollapseDepth(1);
      setIsCollapsed(true);
    }
    setCollapseKey((k) => k + 1);
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(
        JSON.stringify(editedData.current, null, 2),
      );
    } catch {
      // clipboard API may be blocked
    }
  }

  function handleToggleRaw() {
    setIsRaw((r) => !r);
  }

  function handleReset() {
    editedData.current = structuredClone(originalData.current);
    setIsModified(false);
    setCollapseDepth(2);
    setIsCollapsed(false);
    setCollapseKey((k) => k + 1);
  }

  return (
    <div
      className="fixed z-2147483647 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      style={{
        left: position.x,
        top: position.y,
        width: 400,
        height: 500,
        minWidth: 320,
        minHeight: 200,
        resize: "both",
      }}
    >
      <JsonToolbar
        dragHandleRef={titleBarRef}
        onClose={onClose}
        onToggleCollapse={handleToggleCollapse}
        isCollapsed={isCollapsed}
        onCopy={handleCopy}
        onToggleRaw={handleToggleRaw}
        isRaw={isRaw}
        isModified={isModified}
        onReset={handleReset}
      />
      <div className="flex-1 overflow-auto p-3 text-sm">
        {parsed.error ? (
          <div className="text-red-500">Invalid JSON: {parsed.error}</div>
        ) : isRaw ? (
          <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 dark:text-gray-200">
            {JSON.stringify(originalData.current, null, 2)}
          </pre>
        ) : (
          <JsonView
            key={collapseKey}
            src={editedData.current}
            collapsed={collapseDepth}
            dark={isDark}
            editable
            onChange={handleChange}
            enableClipboard
            displaySize="collapsed"
            collapseStringsAfterLength={80}
          />
        )}
      </div>
    </div>
  );
}

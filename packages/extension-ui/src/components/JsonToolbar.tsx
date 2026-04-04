import {
  Braces,
  Check,
  ChevronsDown,
  ChevronsUp,
  Code,
  Copy,
  RotateCcw,
  X,
} from "lucide-react";
import { type RefObject, useState } from "react";

interface JsonToolbarProps {
  onClose: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  onCopy: () => void;
  onToggleRaw: () => void;
  isRaw: boolean;
  isModified: boolean;
  onReset: () => void;
  dragHandleRef: RefObject<HTMLDivElement | null>;
}

function stopDrag(e: React.MouseEvent) {
  e.stopPropagation();
}

export function JsonToolbar({
  onClose,
  onToggleCollapse,
  isCollapsed,
  onCopy,
  onToggleRaw,
  isRaw,
  isModified,
  onReset,
  dragHandleRef,
}: JsonToolbarProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    stopDrag(e);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      ref={dragHandleRef}
      className="flex items-center gap-1 border-b border-gray-200 px-3 py-2 dark:border-gray-700"
      style={{ cursor: "grab" }}
    >
      <span className="flex-1 text-sm font-semibold text-gray-800 select-none dark:text-gray-200">
        jsonly
        {isModified && (
          <span
            className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500"
            title="Modified"
          />
        )}
      </span>

      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onToggleCollapse}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={isCollapsed ? "Expand all" : "Collapse all"}
        aria-label={isCollapsed ? "Expand all" : "Collapse all"}
      >
        {isCollapsed ? <ChevronsDown size={16} /> : <ChevronsUp size={16} />}
      </button>

      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onToggleRaw}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={isRaw ? "Tree view" : "Raw view"}
        aria-label={isRaw ? "Tree view" : "Raw view"}
      >
        {isRaw ? <Braces size={16} /> : <Code size={16} />}
      </button>

      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={handleCopy}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={copied ? "Copied!" : "Copy JSON"}
        aria-label={copied ? "Copied!" : "Copy JSON"}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>

      {isModified && (
        <button
          type="button"
          onMouseDown={stopDrag}
          onClick={(e) => {
            stopDrag(e);
            onReset();
          }}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          title="Reset to original"
          aria-label="Reset to original"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onClose}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Close"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

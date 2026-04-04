import { type RefObject, useState } from "react";

interface JsonToolbarProps {
  onClose: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  onCopy: () => void;
  onToggleRaw: () => void;
  isRaw: boolean;
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
        JSON Viewer
      </span>

      {/* Collapse/Expand All */}
      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onToggleCollapse}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={isCollapsed ? "Expand all" : "Collapse all"}
        aria-label={isCollapsed ? "Expand all" : "Collapse all"}
      >
        {isCollapsed ? (
          // expand icon (chevrons-down)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 6 5 5 5-5" />
            <path d="m7 13 5 5 5-5" />
          </svg>
        ) : (
          // collapse icon (chevrons-up)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m17 18-5-5-5 5" />
            <path d="m17 11-5-5-5 5" />
          </svg>
        )}
      </button>

      {/* Raw Toggle */}
      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onToggleRaw}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={isRaw ? "Tree view" : "Raw view"}
        aria-label={isRaw ? "Tree view" : "Raw view"}
      >
        {isRaw ? (
          // tree icon (braces)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
            <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
          </svg>
        ) : (
          // raw icon (code)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        )}
      </button>

      {/* Copy */}
      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={handleCopy}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title={copied ? "Copied!" : "Copy JSON"}
        aria-label={copied ? "Copied!" : "Copy JSON"}
      >
        {copied ? (
          // checkmark
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          // clipboard
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>

      {/* Close */}
      <button
        type="button"
        onMouseDown={stopDrag}
        onClick={onClose}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Close"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

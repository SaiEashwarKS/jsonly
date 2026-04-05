import { Braces } from "lucide-react";

interface JsonOverlayIconProps {
  rect: DOMRect;
  isActive: boolean;
  onClick: () => void;
}

export function JsonOverlayIcon({
  rect,
  isActive,
  onClick,
}: JsonOverlayIconProps) {
  // Hide when off-screen
  if (
    rect.bottom < 0 ||
    rect.top > window.innerHeight ||
    rect.right < 0 ||
    rect.left > window.innerWidth
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "fixed",
        top: rect.top + 4,
        left: rect.right - 36,
        zIndex: 2147483646,
      }}
      className={`flex items-center justify-center rounded p-1 shadow-sm transition-colors ${
        isActive
          ? "bg-teal-600 text-white"
          : "bg-white/90 text-gray-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-teal-900 dark:hover:text-teal-400"
      } border border-gray-200 backdrop-blur-sm dark:border-gray-600`}
      title="View with jsonly"
      aria-label="View with jsonly"
    >
      <Braces size={16} />
    </button>
  );
}

import { Check, ChevronRight, ExternalLink, Users } from "lucide-react";
import { useRef, useEffect } from "react";

export function UserProfileCard({ identity, isOpen, onClose, onSignOut }) {
  const cardRef = useRef(null);

  // Close card when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={cardRef}
      className="absolute right-0 top-full mt-3 w-80 rounded-lg border border-gray-200 bg-white shadow-xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">Personal</span>
        <button
          onClick={onSignOut}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Account Section */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-300 font-semibold text-gray-700 flex-shrink-0">
            {identity.displayName.split(" ").map(n => n.charAt(0)).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900">
              {identity.displayName}
            </p>
            <p className="text-xs text-gray-600 break-words">
              {identity.email}
            </p>
            {/* <button className="mt-1 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors">
              <span>My Microsoft account</span>
              <ExternalLink className="size-3" />
            </button> */}
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="border-b border-gray-100 px-6 py-3">
        <button className="flex w-full items-center justify-between py-2 hover:opacity-75 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
              <Check className="size-3.5 text-green-600" />
            </div>
            <span className="text-sm text-gray-900 font-medium">Available</span>
          </div>
          <ChevronRight className="size-5 text-gray-400" />
        </button>
      </div>

      {/* Set Status Message */}
      <div className="border-b border-gray-100 px-6 py-3">
        <button className="flex w-full items-center justify-between py-2 hover:opacity-75 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-sm text-gray-900 font-medium">Set status message</span>
          </div>
          <ChevronRight className="size-5 text-gray-400" />
        </button>
      </div>

      {/* Add Another Account */}
      {/* <div className="px-6 py-4">
        <button className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 hover:bg-gray-200 transition-colors">
          <Users className="size-5 text-gray-700" />
          <span className="text-sm text-gray-900 font-medium">Add another account</span>
        </button>
      </div> */}
    </div>
  );
}

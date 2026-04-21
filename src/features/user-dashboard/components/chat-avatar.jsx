export function ChatAvatar({ name, online, size = "size-10" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-amber-500"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full font-bold text-sm text-white shadow-sm ${size} ${color}`}
    >
      {initials}
      {online ? (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-400" />
      ) : null}
    </div>
  );
}

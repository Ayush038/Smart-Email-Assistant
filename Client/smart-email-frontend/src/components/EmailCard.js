export default function EmailCard({
  sender,
  subject,
  preview,
  time,
  badge,
  category,
  priorityScore = 0,

  // NEW — optional props (safe defaults)
  mode = "inbox",
  onClick,
}) {
  const priorityColor =
    priorityScore >= 7
      ? "bg-red-600/30 text-red-300 border-red-500/30"
      : priorityScore >= 5
      ? "bg-yellow-600/30 text-yellow-300 border-yellow-500/30"
      : "bg-green-600/30 text-green-300 border-green-500/30";

  return (
    <div
      onClick={onClick}
      className={onClick ? "cursor-pointer hover:bg-white/5 transition rounded-xl" : ""}
    >
      <div className="p-4 space-y-2">

        {/* Top row — Subject + Priority */}
        <div className="flex justify-between items-start gap-3">
          <p className="font-semibold text-white line-clamp-1 flex-1">
            {subject}
          </p>

          {badge && (
            <span
              className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${priorityColor}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Category chip */}
        {category && (
          <span className="inline-block text-xs px-2 py-1 rounded-md bg-purple-600/20 text-purple-300 border border-purple-500/20">
            {category}
          </span>
        )}

        {/* Meta */}
        <p className="text-sm text-zinc-400">
          {sender} • {time}
        </p>

        {/* Preview */}
        <p className="text-sm text-zinc-500 line-clamp-2">
          {preview}
        </p>

      </div>
    </div>
  );
}
export default function InsightCard({ title, children }) {
  return (
    <div
      className="
        relative flex flex-col
        glass glass-hover
        rounded-xl p-5
        overflow-hidden
        min-h-[140px]
        group
        transition
        hover:scale-[1.01]
      "
    >
      {/* accent gradient glow */}
      <div className="
        absolute inset-0
        opacity-20
        bg-gradient-to-br
        from-purple-500/30
        via-transparent
        to-blue-500/20
        pointer-events-none
      " />

      {/* subtle glass highlight */}
      <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" />

      {/* content */}
      <div className="relative z-10 flex flex-col gap-4 h-full">

        <h3 className="
          text-xs uppercase tracking-wider
          text-zinc-400
          font-semibold
        ">
          {title}
        </h3>

        <div className="
          text-sm text-zinc-200
          leading-relaxed
          flex-1
        ">
          {children}
        </div>

      </div>
    </div>
  );
}
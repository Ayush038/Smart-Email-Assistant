export default function StatsCard({ title, value, gradient }) {
  return (
    <div
      className={`
        relative h-28 rounded-xl p-4
        glass glass-hover
        overflow-hidden
        flex flex-col justify-between
        text-white
        group
      `}
    >
      {/* Gradient glow layer */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-r ${gradient}
          opacity-40 group-hover:opacity-60
          transition duration-300
        `}
      />

      {/* Glass highlight overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <p className="text-xs uppercase tracking-wide text-zinc-300">
          {title}
        </p>

        <p className="text-3xl font-semibold leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
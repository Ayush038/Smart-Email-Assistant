export default function AIOverviewCard({ title, children }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/10 animate-fade-in">
      <h3 className="text-sm font-semibold text-white mb-2">
        {title}
      </h3>

      <div className="text-sm text-zinc-300 space-y-2">
        {children}
      </div>
    </div>
  );
}
const DirectingProjectCard = ({ project }) => {
  const progress = Math.min(100, Math.max(0, Number(project.progress || 0)));
  const statusLabel = project.replacementRequired
    ? "Needs Replacement"
    : project.status || "DIRECTING";

  return (
    <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-[#0f172a] via-[#111827] to-[#0b1120] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
            Directing Project
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            {project.scriptTitle || project.movieName}
          </h3>
        </div>

        <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200">
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex justify-between">
          <span>Director</span>
          <span className="font-semibold text-white">{project.directorName}</span>
        </div>

        <div className="flex justify-between">
          <span>Script</span>
          <span className="font-semibold text-white">{project.scriptTitle}</span>
        </div>

        <div className="flex justify-between">
          <span>Start Week</span>
          <span>{project.startWeek}</span>
        </div>

        <div className="flex justify-between">
          <span>Completion Week</span>
          <span>{project.completionWeek}</span>
        </div>

        <div className="flex justify-between">
          <span>Quality Penalty</span>
          <span className="text-amber-300">-{project.qualityPenalty || 0}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {project.replacementRequired && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          This project is paused until a replacement director is assigned.
        </p>
      )}
    </div>
  );
};

export default DirectingProjectCard;

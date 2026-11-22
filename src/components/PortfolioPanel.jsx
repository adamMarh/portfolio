export default function PortfolioPanel() {
  return (
    <div id="panel">
      <div className="scanlines" />
      <div className="panel-topbar" />
      <div className="panel-inner">
        <div className="eyebrow" id="p-cat">Projet</div>
        <h1 className="proj-title" id="p-title">—</h1>
        <div className="proj-sub" id="p-sub">—</div>
        <div className="divider" />
        <div className="proj-desc" id="p-desc">—</div>
        <div className="project-links" id="p-links" aria-label="Project links" />
        <div className="tags" id="p-tags" />
        <button id="btn-back">◄ Retour au système</button>
      </div>
    </div>
  );
}

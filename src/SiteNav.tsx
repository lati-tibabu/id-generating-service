export default function SiteNav() {
  const path = window.location.pathname;
  const linkClass = (href: string) => `text-xs font-bold uppercase tracking-widest transition ${path === href ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`;

  return <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
    <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-8">
      <a href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center bg-emerald-400 font-black text-slate-950">ID</span>
        <span className="font-black tracking-tight text-white">ID-Link <span className="text-emerald-400">Studio</span></span>
      </a>
      <nav className="flex items-center gap-4 sm:gap-7" aria-label="Primary navigation">
        <a href="/" className={linkClass('/')}>Home</a>
        <a href="/docs" className={linkClass('/docs')}>Docs</a>
        <a href="/contact" className={linkClass('/contact')}>Contact</a>
      </nav>
    </div>
  </header>;
}

import { ArrowRight, FileDown, KeyRound, LockKeyhole, Workflow } from 'lucide-react';
import SiteNav from './SiteNav';

export default function LandingPage() {
  return <div className="min-h-screen bg-slate-950 text-white">
    <SiteNav />
    <main>
      <section className="relative overflow-hidden border-b border-slate-800 px-4 py-20 sm:px-8 lg:py-28">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(52,211,153,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,.08)_1px,transparent_1px)] [background-size:42px_42px]"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold tracking-widest text-emerald-300"><LockKeyhole className="h-4 w-4"/> PASSWORD-PROTECTED DELIVERY</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl">Send an ID card as an encrypted link.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Generate a two-part credential—an encrypted URL and a separate password. The recipient unlocks, previews, and downloads the two-sided PDF directly in their browser.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="/docs" className="flex items-center gap-2 bg-emerald-400 px-6 py-3.5 font-black text-slate-950 transition hover:bg-emerald-300">Open interactive docs <ArrowRight className="h-5 w-5"/></a><a href="/docs#playground" className="border border-slate-700 px-6 py-3.5 font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">Try the link builder</a></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 bg-emerald-400/10 blur-3xl"/>
            <div className="relative border border-slate-700 bg-slate-900 p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold tracking-widest text-slate-500">WORKFLOW OUTPUT</span><span className="text-xs font-bold text-emerald-400">AES-256-GCM</span></div>
              <div className="space-y-4"><div><div className="mb-2 text-[10px] font-bold tracking-widest text-slate-500">ENCRYPTED URL</div><div className="break-all border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-300">/card?data=V8uN4x...hWQ5pA</div></div><div><div className="mb-2 text-[10px] font-bold tracking-widest text-slate-500">SEPARATE PASSWORD</div><div className="border border-emerald-400/30 bg-emerald-400/10 p-4 text-center font-mono text-xl font-black tracking-[.22em] text-emerald-300">K7DM-WQ9P-3HXR-V6AT</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8"><div className="mb-10 max-w-2xl"><div className="text-xs font-bold tracking-[.2em] text-emerald-400">FROM WORKFLOW TO WALLET</div><h2 className="mt-3 text-3xl font-black sm:text-4xl">A small, inspectable delivery pipeline.</h2></div><div className="grid gap-px bg-slate-800 md:grid-cols-3">
        {[{icon:Workflow,title:'1. Submit card data',text:'Call one JSON endpoint from Flowable, JavaScript, cURL, or any HTTP client.'},{icon:KeyRound,title:'2. Deliver two credentials',text:'Send the encrypted URL and its generated password together for demos or separately for stronger protection.'},{icon:FileDown,title:'3. Unlock and download',text:'The recipient decrypts locally, previews both card faces, and downloads the PDF.'}].map(({icon:Icon,title,text}) => <article key={title} className="bg-slate-950 p-8"><Icon className="h-7 w-7 text-emerald-400"/><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></article>)}
      </div></section>
    </main>
    <footer className="border-t border-slate-800 px-4 py-8 text-center text-xs text-slate-500">ID-Link Studio · Browser-side ID preview and PDF delivery</footer>
  </div>;
}

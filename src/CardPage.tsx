import { useState, type FormEvent } from 'react';
import { Download, LockKeyhole, ShieldCheck, UnlockKeyhole } from 'lucide-react';
import { decryptCardLink } from './encryptedLink';
import { isClientIdCardData, normalizeClientCardData, type ClientIdCardData } from './cardData';
import { downloadIdCardPdf } from './clientPdf';

function Avatar({ data }: { data: ClientIdCardData }) {
  const initials = data.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return data.photoUrl ? (
    <img src={data.photoUrl} alt="Card holder" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
  ) : <span>{initials}</span>;
}

function CardPreview({ data, back = false }: { data: ClientIdCardData; back?: boolean }) {
  const vertical = data.layout === 'vertical';
  const dimensions = vertical ? 'aspect-[5/8] max-w-[300px]' : 'aspect-[8/5] max-w-[560px]';
  if (back) return (
    <article className={`relative w-full ${dimensions} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl`}>
      <div className="flex h-[18%] items-center px-[7%] text-[clamp(9px,1.5vw,14px)] font-black tracking-[0.16em]" style={{ background: data.themeColor, color: data.themeTextColor }}>CARD HOLDER INFORMATION</div>
      <div className={`grid ${vertical ? 'grid-cols-1 gap-3 px-[9%] py-[9%]' : 'grid-cols-2 gap-x-8 gap-y-4 px-[7%] py-[6%]'}`}>
        {([['ORGANIZATION', data.orgName], ['EMAIL', data.email || '—'], ['PHONE', data.phone || '—'], ['ISSUED', data.issuedDate], ['EXPIRES', data.expiryDate]] as const).map(([label, value]) => (
          <div key={label}><div className="text-[clamp(6px,1vw,9px)] font-bold tracking-widest text-slate-400">{label}</div><div className="mt-1 truncate text-[clamp(9px,1.6vw,14px)] font-semibold text-slate-800">{value}</div></div>
        ))}
      </div>
      <div className="absolute bottom-[8%] right-[7%] text-right"><div className="h-8 w-32 bg-[repeating-linear-gradient(90deg,#0f172a_0_2px,transparent_2px_5px)]"/><span className="font-mono text-[8px] text-slate-500">{data.idNumber}</span></div>
    </article>
  );
  return (
    <article className={`relative w-full ${dimensions} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl`}>
      <div className={`${vertical ? 'h-[27%] text-center' : 'h-[24%]'} px-[7%] py-[5%]`} style={{ background: data.themeColor, color: data.themeTextColor }}>
        <div className="truncate text-[clamp(12px,2vw,20px)] font-black tracking-wide">{data.orgName.toUpperCase()}</div>
        <div className="mt-1 text-[clamp(6px,1vw,9px)] tracking-[0.25em] opacity-75">SECURE IDENTIFICATION</div>
      </div>
      <div className={`${vertical ? '-mt-[14%] flex-col text-center' : 'absolute inset-x-[7%] top-[31%] flex-row'} flex items-center gap-[7%]`}>
        <div className={`${vertical ? 'h-24 w-24' : 'h-28 w-28'} shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-2xl font-black`} style={{ color: data.themeColor }}><Avatar data={data}/></div>
        <div className={`${vertical ? 'mt-3' : 'min-w-0 flex-1'}`}><div className="truncate text-[clamp(16px,3vw,26px)] font-black text-slate-900">{data.name}</div><div className="mt-1 truncate text-[clamp(8px,1.4vw,12px)] font-bold tracking-widest" style={{ color: data.themeColor }}>{data.role.toUpperCase()}</div></div>
      </div>
      <div className={`${vertical ? 'mx-[10%] mt-[7%] grid-cols-1 gap-3' : 'absolute bottom-[10%] left-[42%] right-[7%] grid-cols-[1.5fr_0.8fr_1fr] gap-3'} grid`}>
        {([['ID NUMBER', data.idNumber], ['BLOOD GROUP', data.bloodGroup || '—'], ['VALID UNTIL', data.expiryDate]] as const).map(([label, value]) => <div key={label} className="min-w-0"><div className="text-[clamp(6px,1vw,8px)] font-bold tracking-widest text-slate-400">{label}</div><div className="mt-1 truncate text-[clamp(8px,1.35vw,12px)] font-bold text-slate-800" title={value}>{value}</div></div>)}
      </div>
    </article>
  );
}

export default function CardPage() {
  const [data, setData] = useState<ClientIdCardData | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setUnlocking(true);
    try {
      const value = await decryptCardLink(window.location, password);
      if (!isClientIdCardData(value)) throw new Error('The decrypted card data is not valid.');
      setData(normalizeClientCardData(value));
      setPassword('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to unlock this ID card.');
    } finally {
      setUnlocking(false);
    }
  };

  if (!data) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white">
    <div className="w-full max-w-md border border-slate-700 bg-slate-900 p-8 shadow-2xl">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><LockKeyhole className="h-6 w-6"/></div>
      <div className="text-xs font-bold tracking-[0.2em] text-emerald-300">ENCRYPTED ID CARD</div>
      <h1 className="mt-2 text-3xl font-black">Enter your password</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Use the separate password supplied with this link. Decryption happens only inside your browser.</p>
      <form onSubmit={unlock} className="mt-7">
        <label htmlFor="card-password" className="mb-2 block text-xs font-bold tracking-widest text-slate-300">CARD PASSWORD</label>
        <input id="card-password" type="password" value={password} onChange={(event) => setPassword(event.target.value.toUpperCase())} autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} autoFocus placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full border border-slate-600 bg-slate-950 px-4 py-3 font-mono tracking-widest text-white outline-none transition focus:border-emerald-400"/>
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={unlocking || !password.trim()} className="mt-5 flex w-full items-center justify-center gap-2 bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"><UnlockKeyhole className="h-5 w-5"/>{unlocking ? 'Unlocking…' : 'Unlock ID Card'}</button>
      </form>
    </div>
  </main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-300"><LockKeyhole className="h-4 w-4"/> LOCALLY DECRYPTED</div><h1 className="text-3xl font-black">Your digital ID card</h1><p className="mt-2 max-w-xl text-sm text-slate-400">The encrypted link was opened and rendered in this browser. No personal card data was sent to the PDF API.</p></div>
      <button type="button" disabled={downloading} onClick={async () => { setDownloading(true); try { await downloadIdCardPdf(data); } finally { setDownloading(false); } }} className="flex items-center gap-2 bg-emerald-400 px-6 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"><Download className="h-5 w-5"/>{downloading ? 'Preparing PDF…' : 'Download PDF'}</button></header>
      <section className="grid items-start gap-8 lg:grid-cols-2"><div><div className="mb-3 text-xs font-bold tracking-widest text-slate-500">FRONT</div><CardPreview data={data}/></div><div><div className="mb-3 text-xs font-bold tracking-widest text-slate-500">BACK</div><CardPreview data={data} back/></div></section>
      <div className="mt-8 flex items-start gap-3 border border-slate-700 bg-slate-900 p-4 text-xs text-slate-400"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400"/><p>This card was unlocked locally. The password was not placed in the URL or sent to the server.</p></div>
    </div>
  </main>;
}

import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import SiteNav from './SiteNav';

const contacts = [
  { icon: Mail, label: 'Product and business', value: 'hello@latitibabu.com', href: 'mailto:hello@latitibabu.com' },
  { icon: Mail, label: 'Direct email', value: 'latitibabu2018@gmail.com', href: 'mailto:latitibabu2018@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+251 979 586 697', href: 'tel:+251979586697' },
  { icon: MapPin, label: 'Location', value: 'Addis Ababa, Ethiopia' },
];

export default function ContactPage() {
  return <div className="min-h-screen bg-slate-950 text-white"><SiteNav/><main className="mx-auto max-w-6xl px-4 py-20 sm:px-8"><div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
    <div><div className="text-xs font-bold tracking-[.2em] text-emerald-400">CONTACT</div><h1 className="mt-3 text-5xl font-black leading-tight">Let’s build a better workflow.</h1><p className="mt-6 text-lg leading-8 text-slate-400">Questions about the ID-card API, Flowable integration, deployment, or a custom workflow? Reach out to Lati Tibabu.</p><a href="https://www.latitibabu.com/" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-emerald-300">Visit latitibabu.com <ExternalLink className="h-4 w-4"/></a></div>
    <div className="grid gap-px bg-slate-800 sm:grid-cols-2">{contacts.map(({icon:Icon,label,value,href}) => { const content = <><Icon className="h-6 w-6 text-emerald-400"/><div className="mt-6 text-xs font-bold tracking-widest text-slate-500">{label.toUpperCase()}</div><div className="mt-2 break-words font-bold text-slate-100">{value}</div></>; return href ? <a key={label} href={href} className="bg-slate-900 p-7 transition hover:bg-slate-800">{content}</a> : <div key={label} className="bg-slate-900 p-7">{content}</div>; })}</div>
  </div><div className="mt-14 border border-slate-800 bg-slate-900/50 p-5 text-xs leading-6 text-slate-500">Contact details are sourced from the public contact section of <a className="text-slate-300 underline" href="https://www.latitibabu.com/" target="_blank" rel="noreferrer">latitibabu.com</a>.</div></main></div>;
}

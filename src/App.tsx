/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Code2, 
  Terminal, 
  Check, 
  Copy, 
  Layers, 
  Settings, 
  ShieldCheck, 
  BookOpen,
  HeartHandshake,
  Cpu,
  RefreshCw,
  Upload
} from 'lucide-react';

// Recommended predefined presets for ease of card building
const BRAND_COLORS = [
  { name: 'Cosmic Slate', hex: '#1E293B', text: '#FFFFFF' },
  { name: 'Emerald Peak', hex: '#059669', text: '#FFFFFF' },
  { name: 'Royal Sapphire', hex: '#1D4ED8', text: '#FFFFFF' },
  { name: 'Crimson Alert', hex: '#DC2626', text: '#FFFFFF' },
  { name: 'Autumn Amber', hex: '#D97706', text: '#FFFFFF' },
  { name: 'Cyber Violet', hex: '#7C3AED', text: '#FFFFFF' },
  { name: 'Vibrant Magenta', hex: '#DB2777', text: '#FFFFFF' },
];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

export default function App() {
  const defaultIssuedDate = formatDate(new Date());
  const defaultExpiryDate = formatDate(addYears(new Date(defaultIssuedDate), 2));

  // 1. App State for Interactive Documentation Playground
  const [formData, setFormData] = useState({
    name: 'Jane Smith',
    role: 'Staff Engineer',
    orgName: 'Hyperion Tech',
    idNumber: '',
    email: '',
    phone: '+1 (555) 392-0941',
    bloodGroup: 'O+',
    issuedDate: defaultIssuedDate,
    expiryDate: defaultExpiryDate,
    photoUrl: '', // url or base64
    themeColor: '#1E293B',
    themeTextColor: '#FFFFFF',
    layout: 'horizontal' as 'vertical' | 'horizontal',
  });

  const [activeTab, setActiveTab] = useState<'endpoints' | 'playground' | 'curl'>('endpoints');
  const [copiedText, setCopiedText] = useState<'curl' | 'curl-minimum' | 'js' | 'python' | 'link' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customHex, setCustomHex] = useState('#1E293B');

  // Sync color pickers
  useEffect(() => {
    setFormData((prev) => ({ ...prev, themeColor: customHex }));
  }, [customHex]);

  // Read developer info
  const appUrl = (typeof window !== 'undefined' ? window.location.origin : '') || 'https://ais-dev-gxidif2it24jlpgovnbt4m-608083615985.europe-west2.run.app';
  
  // Construct dynamic download GET link for testing in the client
  const queryParams = new URLSearchParams();
  queryParams.set('name', formData.name);
  queryParams.set('role', formData.role);
  queryParams.set('orgName', formData.orgName);
  if (formData.idNumber) queryParams.set('idNumber', formData.idNumber);
  if (formData.email) queryParams.set('email', formData.email);
  if (formData.phone) queryParams.set('phone', formData.phone);
  if (formData.bloodGroup) queryParams.set('bloodGroup', formData.bloodGroup);
  if (formData.issuedDate) queryParams.set('issuedDate', formData.issuedDate);
  if (formData.expiryDate) queryParams.set('expiryDate', formData.expiryDate);
  if (formData.photoUrl) queryParams.set('photoUrl', formData.photoUrl);
  queryParams.set('themeColor', formData.themeColor);
  queryParams.set('themeTextColor', formData.themeTextColor);
  queryParams.set('layout', formData.layout);

  const dynamicDownloadUrl = `${appUrl}/api/id-card/download?${queryParams.toString()}`;
  const downloadFileStem = formData.idNumber ? formData.idNumber.toLowerCase() : 'generated';

  // Helper code copy snippet trigger
  const handleCopy = (text: string, type: 'curl' | 'curl-minimum' | 'js' | 'python' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Image File Uploader to convert target files to local base64 on-the-fly
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setFormData((prev) => ({ ...prev, photoUrl: event.target!.result as string }));
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Pre-coded implementation snippets to document endpoints
  const jsCodeSnippet = `// ⚡ Standard client-side JS implementation
async function downloadIdCard() {
  const payload = {
    name: "${formData.name}",
    role: "${formData.role}",
    orgName: "${formData.orgName}",
    idNumber: "${formData.idNumber}",
    email: "${formData.email}",
    phone: "${formData.phone}",
    bloodGroup: "${formData.bloodGroup}",
    issuedDate: "${formData.issuedDate}",
    expiryDate: "${formData.expiryDate}",
    themeColor: "${formData.themeColor}",
    themeTextColor: "${formData.themeTextColor}",
    layout: "${formData.layout}",
    photoUrl: "${formData.photoUrl ? formData.photoUrl.substring(0, 30) + '...' : ''}"
  };

  try {
    const response = await fetch('${appUrl}/api/id-card/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Generation failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'id-card-' + (payload.idNumber || 'generated') + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Extraction error:', err);
  }
}`;

  const pythonCodeSnippet = `import requests

# ⚡ Rapid python card download
payload = {
    "name": "${formData.name}",
    "role": "${formData.role}",
    "orgName": "${formData.orgName}",
    "idNumber": "${formData.idNumber}",
    "email": "${formData.email}",
    "phone": "${formData.phone}",
    "bloodGroup": "${formData.bloodGroup}",
    "issuedDate": "${formData.issuedDate}",
    "expiryDate": "${formData.expiryDate}",
    "themeColor": "${formData.themeColor}",
    "themeTextColor": "${formData.themeTextColor}",
    "layout": "${formData.layout}",
    "photoUrl": "${formData.photoUrl ? formData.photoUrl.substring(0, 30) + '...' : ''}"
}

url = "${appUrl}/api/id-card/generate"
response = requests.post(url, json=payload)

if response.status_code == 200:
    with open(f"id_card_{payload.get('idNumber') or 'generated'}.pdf", "wb") as f:
        f.write(response.content)
    print("Success! PDF card generated and saved locally.")
else:
    print(f"Failed with status: {response.status_code}")`;

  const curlSnippet = `curl -X POST "${appUrl}/api/id-card/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${formData.name}",
    "role": "${formData.role}",
    "orgName": "${formData.orgName}",
    "idNumber": "${formData.idNumber}",
    "email": "${formData.email}",
    "phone": "${formData.phone}",
    "bloodGroup": "${formData.bloodGroup}",
    "issuedDate": "${formData.issuedDate}",
    "expiryDate": "${formData.expiryDate}",
    "themeColor": "${formData.themeColor}",
    "themeTextColor": "${formData.themeTextColor}",
    "layout": "${formData.layout}"
  }' \\
  --output id_card.pdf`;

  const minimumCurlSnippet = `curl -X POST "${appUrl}/api/id-card/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${formData.name}",
    "role": "${formData.role}",
    "orgName": "${formData.orgName}"
  }' \\
  --output id_card.pdf`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 border-8 border-slate-200 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP HEADER - GEOMETRIC BALANCE DESIGN STYLE */}
      <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90 flex items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold text-xl shadow-sm">
            ID
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                ID-Gen <span className="text-indigo-600">API</span>
              </h1>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </div>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 font-mono mt-0.5">
              CR80 Compliant Double-Sided PDF Printer Module
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-slate-400 text-xs sm:text-sm font-mono">
          <span className="hidden md:inline">STABLE V1.0.4</span>
          <div className="hidden md:block h-4 w-px bg-slate-200" />
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="hover:text-slate-600 transition-colors flex items-center gap-1 font-bold text-slate-700"
          >
            <Code2 className="w-3.5 h-3.5" /> SOURCE CODE
          </a>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-8 flex-grow">
        {/* UPPER ANNOUNCEMENT ZONE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-sm border border-slate-200 hover:border-indigo-300 shadow-sm transition-all flex gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-none h-fit border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Privacy Secured</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We possess zero persistence layers. No personal identifiers or uploaded images are saved or tracking cookies stored. Generation is on-the-fly and runs in memory.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm border border-slate-200 hover:border-emerald-300 shadow-sm transition-all flex gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-none h-fit border border-emerald-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">CR80 Compliant Layout</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cards meet CR80 standard specifications (85.6mm x 54mm equivalent ratio). Integrates customizable thematic accents and automatic font spacing.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm border border-slate-200 hover:border-purple-300 shadow-sm transition-all flex gap-4">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-none h-fit border border-purple-100">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Open Source & Free</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Open source deployment under standard MIT licensing permits arbitrary enterprise extension, backend custom wrappers, and public client implementation.
              </p>
            </div>
          </div>
        </div>

        {/* CORE INTERACTIVE WORKSPACE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* LEFT CONTAINER: DYNAMIC DOCUMENTATION & PARAMETERS GUIDE */}
          <div className="lg:col-span-7 bg-white rounded-sm border-2 border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {/* Nav Headers */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-1 bg-slate-200 p-1 rounded-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('endpoints')}
                  className={`px-4 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeTab === 'endpoints'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> API Guidelines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('playground')}
                  className={`px-4 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeTab === 'playground'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" /> Scheme Reference
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('curl')}
                  className={`px-4 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeTab === 'curl'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Integration Code
                </button>
              </div>

              <div className="text-right text-[10px] font-mono text-slate-400">
                HOST: <span className="text-indigo-600 font-bold">{appUrl.replace('https://', '')}</span>
              </div>
            </div>

            <div className="p-6">
              {/* TAB 1: ENDPOINT SCHEMALESS DIRECTIONS */}
              {activeTab === 'endpoints' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Endpoint Specifications</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Developers can interact with this engine through two distinct routes. We support clean <b>POST</b> payloads structured in JSON, or a fast-track <b>GET</b> route returning an immediate file download attachment.
                    </p>
                  </div>

                  {/* Endpoint Block 1 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-emerald-600 text-white font-mono font-bold px-2.5 py-0.5 rounded-none text-[10px] tracking-wider uppercase">
                        POST
                      </span>
                      <code className="text-slate-800 font-mono font-bold text-sm bg-slate-100 px-2 py-0.5 rounded-none border border-slate-200">
                        /api/id-card/generate
                      </code>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3 font-medium">
                      Accepts application/json payloads to generate and display or process a secure double-sided ID card layout dynamically on-the-fly.
                    </p>
                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Header: Content-Type: application/json</span>
                      <span>Response: application/pdf (inline)</span>
                    </div>
                  </div>

                  {/* Endpoint Block 2 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-600 text-white font-mono font-bold px-2.5 py-0.5 rounded-none text-[10px] tracking-wider uppercase">
                        GET
                      </span>
                      <code className="text-slate-800 font-mono font-bold text-sm bg-slate-100 px-2 py-0.5 rounded-none border border-slate-200">
                        /api/id-card/download
                      </code>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4 font-medium">
                      Accepts web standardized query flags directly within any URL. Ideal for standard HTML anchor tags, download hyperlinks, or direct browser redirect links.
                    </p>
                    <code className="block bg-slate-100 border border-slate-200 p-2.5 rounded-none text-slate-600 font-mono text-[10.5px] overflow-x-auto whitespace-pre-wrap select-all">
                      {`${appUrl}/api/id-card/download?name=John+Doe&role=Security&orgName=Acme`}
                    </code>
                    <div className="border-t border-slate-200 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Header: None Required</span>
                      <span>Response: application/pdf (attachment)</span>
                    </div>
                  </div>

                  {/* Connection Steps */}
                  <div className="pt-2 border-t border-slate-100">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Integration Workflow Steps</h2>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm font-mono">
                          1
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 uppercase">Construct Payload Schema</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                            Formulate a structured JSON envelope matching our strict validation schema. Base64 profile picture attachments are supported natively up to 4MB.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm font-mono">
                          2
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 uppercase">Transmit Dispatch Payload</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                            Submit a POST request to our isolated API host. Receives a pristine, compliant PDF binary content buffer directly back in the pipeline.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm font-mono">
                          3
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 uppercase">Render or Print File</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                            Stream the document down to any local thermal printer. Opt for CR80 card paper sizing for hardware compliance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extra Instructions Panel */}
                  <div className="bg-indigo-50 rounded-none p-4 border border-indigo-100">
                    <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      Print Specifications Compliance
                    </h4>
                    <p className="text-xs text-indigo-950/80 leading-relaxed">
                      The generated PDF features an output resolution tuned for CR80 card margins. When printing via physical media, ensure your local document setup does not employ absolute page sizing wrappers (choose "Actual Size" in your system PDF print dialog for a perfect 3.375" x 2.125" output dimension!).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED SCHEMAS */}
              {activeTab === 'playground' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Payload Interface Blueprint</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Detailed structural definition used for card validation and parsing during generation.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-none">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Field Key</th>
                          <th className="p-3">Data Type</th>
                          <th className="p-3">Required</th>
                          <th className="p-3">Default Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">name</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-emerald-600 font-bold">Yes</td>
                          <td className="p-3">"John Doe"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">role</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-emerald-600 font-bold">Yes</td>
                          <td className="p-3">"Card Holder"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">orgName</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-emerald-600 font-bold">Yes</td>
                          <td className="p-3">"Acme Corporation"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">idNumber</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">Generated when omitted</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">email</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">phone</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">bloodGroup</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">issuedDate</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">Current date</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">expiryDate</td>
                          <td className="p-3 text-purple-700">string</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">Issue date + 2 years</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">photoUrl</td>
                          <td className="p-3 text-purple-700 text-[10px]">string (url/base64)</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">themeColor</td>
                          <td className="p-3 text-purple-700">string (hex)</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">"#1E293B"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">layout</td>
                          <td className="p-3 text-blue-700">"vertical" | "horizontal"</td>
                          <td className="p-3 text-slate-400">No</td>
                          <td className="p-3">"horizontal"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: INTEGRATION SNIPPETS */}
              {activeTab === 'curl' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Developer Implementation Guides</h2>
                    <p className="text-xs text-slate-500">
                      Copy standard robust requests codeblocks to immediately embed ID generation capabilities into your microservices.
                    </p>
                  </div>

                  {/* cURL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">Minimum cURL Payload</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(minimumCurlSnippet, 'curl-minimum')}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText === 'curl-minimum' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedText === 'curl-minimum' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="relative">
                      {/* Terminal window dots */}
                      <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-sm p-4 font-mono text-[10.5px] overflow-x-auto select-all shadow-inner leading-relaxed border border-slate-800">
                        {minimumCurlSnippet}
                      </pre>
                    </div>
                  </div>

                  {/* cURL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">Full cURL Payload</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(curlSnippet, 'curl')}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedText === 'curl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="relative">
                      {/* Terminal window dots */}
                      <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-sm p-4 font-mono text-[10.5px] overflow-x-auto select-all shadow-inner leading-relaxed border border-slate-800">
                        {curlSnippet}
                      </pre>
                    </div>
                  </div>

                  {/* JavaScript */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">JavaScript / TypeScript Fetch</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(jsCodeSnippet, 'js')}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedText === 'js' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-sm p-4 font-mono text-[10.5px] overflow-x-auto select-all shadow-inner leading-relaxed border border-slate-800">
                        {jsCodeSnippet}
                      </pre>
                    </div>
                  </div>

                  {/* Python */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">Python HTTP requests</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(pythonCodeSnippet, 'python')}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedText === 'python' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-sm p-4 font-mono text-[10.5px] overflow-x-auto select-all shadow-inner leading-relaxed border border-slate-800">
                        {pythonCodeSnippet}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTAINER: INTERACTIVE CARD CREATOR PLAYGROUND */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="bg-white rounded-sm border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-none border border-indigo-200">
                    <Settings className="w-4 h-4" />
                  </span>
                  API Payload Customizer
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: 'Jane Smith',
                      role: 'Staff Engineer',
                      orgName: 'Hyperion Tech',
                      idNumber: '',
                      email: '',
                      phone: '+1 (555) 392-0941',
                      bloodGroup: 'O+',
                      issuedDate: defaultIssuedDate,
                      expiryDate: defaultExpiryDate,
                      photoUrl: '',
                      themeColor: '#1E293B',
                      themeTextColor: '#FFFFFF',
                      layout: 'horizontal',
                    });
                    setCustomHex('#1E293B');
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Dynamic form */}
              <div className="space-y-4">
                {/* 1. Name & Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Organization Name & ID Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.orgName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, orgName: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Extended Data: Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 4. Blood group & dates */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Blood Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. O+"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Issued Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YYYY"
                      value={formData.issuedDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, issuedDate: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YYYY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 5. Custom Card Photo Loader */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Card Profile Image
                  </label>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Paste picture HTTP URL..."
                      value={formData.photoUrl.startsWith('data:') ? 'Local Image File Selected' : formData.photoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, photoUrl: e.target.value }))}
                      disabled={formData.photoUrl.startsWith('data:')}
                      className="col-span-8 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <div className="col-span-4 relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="local-avatar-file"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="local-avatar-file"
                        className="cursor-pointer border border-dashed border-slate-300 hover:border-indigo-400 text-[10.5px] flex items-center justify-center gap-1 font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl transition-all"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        {isUploading ? 'Loading' : 'Upload File'}
                      </label>
                    </div>
                  </div>
                  {formData.photoUrl && (
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                      <span className="text-emerald-600 font-semibold font-mono">✓ Image custom loading active</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                        className="text-red-550 text-red-600 hover:underline font-semibold font-mono"
                      >
                        Reset Picture
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. Layout Orientation */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Layout Configuration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, layout: 'vertical' }))}
                      className={`text-xs p-2.5 rounded-xl border mt-0.5 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.layout === 'vertical'
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3.5 h-4.5 border-2 border-current rounded-sm inline-block" /> Vertical Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, layout: 'horizontal' }))}
                      className={`text-xs p-2.5 rounded-xl border mt-0.5 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.layout === 'horizontal'
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-4.5 h-3.5 border-2 border-current rounded-sm inline-block" /> Horizontal Card
                    </button>
                  </div>
                </div>

                {/* 7. Theme colors */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Accent Color Theme
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {BRAND_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setCustomHex(color.hex);
                          setFormData((prev) => ({ ...prev, themeTextColor: color.text }));
                        }}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all ${
                          formData.themeColor === color.hex
                            ? 'border-black scale-110 shadow'
                            : 'border-white hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Custom Color Hex</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={customHex}
                          onChange={(e) => setCustomHex(e.target.value)}
                          className="w-10 h-7 border border-slate-200 rounded cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData.themeColor}
                          onChange={(e) => {
                            if (e.target.value.startsWith('#') && e.target.value.length <= 7) {
                              setCustomHex(e.target.value);
                            }
                          }}
                          className="font-mono text-xs w-20 px-2 py-1 border border-slate-200 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Header Text Theme</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, themeTextColor: '#FFFFFF' }))}
                          className={`text-[11px] font-bold py-1 border rounded transition-all cursor-pointer ${
                            formData.themeTextColor === '#FFFFFF'
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, themeTextColor: '#111827' }))}
                          className={`text-[11px] font-bold py-1 border rounded transition-all cursor-pointer ${
                            formData.themeTextColor === '#111827'
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* DYNAMIC GET DOWNLOAD LINK PREPARATION PANEL */}
            <div className="bg-indigo-950 text-white rounded-none border-2 border-indigo-900 p-6 shadow-xl space-y-4">
              <div className="border-b border-indigo-900 pb-3">
                <h4 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-indigo-300">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Live Code Link Creator
                </h4>
                <p className="text-[11px] text-indigo-200/90 leading-relaxed mt-1 font-medium">
                  Clicking the download connection invokes our direct GET API, prompting the server's PDF printer streaming buffer directly to your native client downloads.
                </p>
              </div>

              {/* Real URL block */}
              <div className="space-y-1.5 border border-indigo-900/60 p-3 rounded-none bg-indigo-950/70">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300">GET ENDPOINT DOWNLOAD REFLINK:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(dynamicDownloadUrl, 'link')}
                    className="text-[10px] uppercase font-mono tracking-wider hover:text-indigo-200 flex items-center gap-1 transition-colors cursor-pointer text-indigo-400 font-bold"
                  >
                    {copiedText === 'link' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Link
                  </button>
                </div>
                <code className="block bg-indigo-900 border border-indigo-800 p-2 text-[10.5px] font-mono text-indigo-100 select-all rounded-none break-all max-h-24 overflow-y-auto">
                  {dynamicDownloadUrl}
                </code>
              </div>

              {/* Main Download Action trigger */}
              <a
                href={dynamicDownloadUrl}
                download={`id-card-${downloadFileStem}.pdf`}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-indigo-950 font-black px-4 py-3.5 rounded-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer border-2 border-emerald-600 uppercase tracking-widest"
              >
                <Download className="w-4 h-4 text-indigo-950" /> Download Generated ID Card PDF
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER & ACCESSIBILITY FOOTNOTE */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-16 py-8 border-t-2 border-slate-200 text-center space-y-3">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Licensed under the MIT Open Source Framework. Fully powered by Node.js, Express, Vite, React & PDFKit.
        </p>
        <div className="text-[11px] text-slate-400 font-mono tracking-tight">
          © 2026 ID Card Print Engine API / Designed with Geometric Balance / Prepared free and unlimited for all developers.
        </div>
      </footer>
    </div>
  );
}

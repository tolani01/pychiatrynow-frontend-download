



// // PatientIntake.tsx  – complete file
// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useLayoutEffect,
// } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ChatBubble } from './foundation/ChatBubble';
// import { CustomButton } from './foundation/Button';
// import { CustomInput } from './foundation/Input';

// /* ---------- helper types ---------- */
// interface Choice { value: string; label: string }
// interface ChatMessage {
//   type: 'patient' | 'system' | 'options' | 'finish';
//   content: string;
//   options?: Choice[];
//   timestamp?: string;
// }
// interface ServerMessage {
//   role: 'user' | 'model';
//   content: string;
//   timestamp: string;
//   done?: boolean;
// }

// /* ---------- option bubble ---------- */
// function OptionsBubble(
//   { question, choices, onPick }:
//   { question: string; choices: Choice[]; onPick: (c: Choice) => void },
// ) {
//   const [picked, setPicked] = useState<string | null>(null);
//   return (
//     <ChatBubble type="system">
//       <div className="mb-3 font-medium">{question}</div>
//       <div className="space-y-2">
//         {choices.map(c => (
//           <label
//             key={c.value}
//             className={`block border rounded-lg px-4 py-2 cursor-pointer transition
//                        ${picked === c.value
//                          ? 'border-blue-600 bg-blue-50'
//                          : 'border-gray-300 hover:bg-gray-50'}`}
//             onClick={() => {
//               if (picked) return;
//               setPicked(c.value);
//               onPick(c);
//             }}
//           >
//             {c.label}
//           </label>
//         ))}
//       </div>
//     </ChatBubble>
//   );
// }

// /* ---------- finish bubble ---------- */
// function FinishBubble({ onFinish }: { onFinish: () => void }) {
//   return (
//     <ChatBubble type="system">
//       <div className="mb-3">
//         Thank you — anything else you want to share that could help a clinician?
//         If not, tap the button below to generate your report.
//       </div>
//       <CustomButton
//         variant="primary"
//         className="bg-blue-600 hover:bg-blue-700 text-white"
//         onClick={onFinish}
//       >
//         Generate report now
//       </CustomButton>
//     </ChatBubble>
//   );
// }

// /* ═════════════════ component ═════════════════ */
// export default function PatientIntake() {
//   const navigate = useNavigate();
//   const COMPOSER_H = 96;

//   /* state */
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputValue, setInput]  = useState('');
//   const [loading,    setBusy]   = useState(false);
//   const [ready,      setReady]  = useState(false);

//   /* session ID */
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const sessionRef = useRef<string | null>(null);

//   /* refs */
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const seenRef   = useRef<Set<string>>(new Set());
//   const ackRef    = useRef<string | null>(null);
//   const collectRef= useRef<{ q: string | null; opts: string[] }>({ q: null, opts: [] });

//   /* ---------- push helpers ---------- */
//   const push = (m: ChatMessage) => setMessages(prev => [...prev, m]);
//   const pushSys = (txt: string, ts?: string) => {
//     if (seenRef.current.has(txt)) return;
//     seenRef.current.add(txt);
//     push({ type: 'system', content: txt, timestamp: ts });
//   };
//   const pushOpt = (q: string, opts: Choice[], ts?: string) => {
//     const fp = q + '|' + opts.map(o => o.value).join(',');
//     if (seenRef.current.has(fp)) return;
//     seenRef.current.add(fp);
//     push({ type: 'options', content: q, options: opts, timestamp: ts });
//   };
//   const pushFinishBtn = (ts?: string) => {
//     if (seenRef.current.has('FINISH')) return;
//     seenRef.current.add('FINISH');
//     push({ type: 'finish', content: '', timestamp: ts });
//   };

//   /* ---------- POST helper (stream) ---------- */
//   const sendMessage = async (prompt: string) => {
//     if (loading) return;
//     setBusy(true);

//     const form = new FormData();
//     form.append('prompt', prompt);
//     if (sessionRef.current) form.append('session_id', sessionRef.current);

//     const controller = new AbortController();
//     let idle: ReturnType<typeof setTimeout> | undefined;

//     const resetIdle = () => {
//       clearTimeout(idle);
//       idle = setTimeout(() => controller.abort(), 12_000);
//     };

//     try {
//       const res = await fetch('http://localhost:8000/chat/', {
//         method: 'POST',
//         body: form,
//         signal: controller.signal,
//       });

//       const id = res.headers.get('X-Session-ID');
//       if (id && id !== sessionRef.current) {
//         sessionRef.current = id;
//         setSessionId(id.slice(0, 8));
//       }

//       const reader = res.body?.getReader();
//       if (!reader) {
//         setBusy(false);
//         return;
//       }

//       const decoder = new TextDecoder();
//       let buf = '';
//       let first = true;

//       while (true) {
//         const { value, done } =
//           (await reader.read().catch(() => ({ done: true }))) as
//             ReadableStreamReadResult<Uint8Array>;
//         if (done) break;

//         if (first) {
//           first = false;
//           setBusy(false);
//         }
//         resetIdle();

//         if (value) buf += decoder.decode(value, { stream: true });

//         const lines = buf.split('\n');
//         buf = lines.pop() ?? '';

//         for (const raw of lines) {
//           if (!raw.trim()) continue;

//           const sm: ServerMessage = JSON.parse(raw);
//           if (sm.role !== 'model') continue;

//           /* ---- final JSON chunk ---- */
//           if (sm.done) {
//             console.log('%c[INTAKE] raw final chunk', 'color:#0a0', sm.content);
//             let clean = sm.content.trim();
//             if (clean.startsWith('```')) {
//               clean = clean.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
//             }
//             try {
//               JSON.parse(clean);
//               console.log('[INTAKE] saved JSON length', clean.length);
//               localStorage.setItem('intakeReport', clean);
//               pushSys('Assessment completed! Report generated.', sm.timestamp);
//               setReady(true);
//             } catch (e) {
//               console.error('JSON parse error', e);
//               pushSys('⚠ Report format error. Please retry.', sm.timestamp);
//             }
//             continue;
//           }

//           processLine(sm.content.trim(), sm.timestamp);
//         }
//       }
//     } catch (e) {
//       console.error(e);
//       pushSys('Network error — please retry.', new Date().toISOString());
//     } finally {
//       setBusy(false);
//       clearTimeout(idle);
//     }
//   };

//   /* ---------- regexes ---------- */
//   const optRx = /^\s*\d+\s*[:.]/;
//   const promptRx = /your\s+choice/i;
//   const finRx = /:\s*finish/i;
//   const skipRx = /^(you\b|⚠️|{)/i;
//   const earlyRx = /:\s*finish[^]*?:exit/i;

//   /* ---------- flush collector ---------- */
//   const flushCollector = (ts: string) => {
//     const { q, opts } = collectRef.current;
//     if (!q || opts.length < 2) {
//       collectRef.current = { q: null, opts: [] };
//       return;
//     }
//     const choices: Choice[] = opts.map(l => {
//       const [, v, lbl] = l.match(/^\s*(\d+)\s*[:.]\s*(.+)$/)!;
//       return { value: v, label: lbl };
//     });
//     pushOpt(q, choices, ts);
//     collectRef.current = { q: null, opts: [] };
//   };

//   /* ---------- process each assistant line ---------- */
//   function processLine(text: string, ts: string) {
//     if (skipRx.test(text) || earlyRx.test(text)) return;

//     /* finish prompt */
//     if (finRx.test(text)) {
//       const trimmed = text
//         .replace(/If not[^]*$/i, '')
//         .replace(/type\s*'?:finish'?.*$/i, '')
//         .trim();
//       if (trimmed) pushSys(trimmed, ts);
//       pushFinishBtn(ts);
//       return;
//     }

//     /* ack merge */
//     const ackP = /^PsychiatryNow\s*\(ack\):\s*/i;
//     const qP   = /^PsychiatryNow\s*:\s*/i;

//     if (ackP.test(text)) {
//       ackRef.current = text.replace(ackP, '').trim();
//       return;
//     }
//     if (qP.test(text) && ackRef.current) {
//       text = 'PsychiatryNow : ' + ackRef.current + '\n' +
//              text.replace(qP, '').trim();
//       ackRef.current = null;
//     } else if (ackRef.current) {
//       pushSys('PsychiatryNow : ' + ackRef.current, ts);
//       ackRef.current = null;
//     }

//     /* option collector */
//     if (promptRx.test(text) && collectRef.current.q) {
//       flushCollector(ts);
//       return;
//     }
//     if (optRx.test(text) && collectRef.current.q) {
//       collectRef.current.opts.push(text);
//       return;
//     }
//     if (/^(PHQ|GAD|AUDIT|ASRS|PCL|MDQ|DAST).*#\d+/i.test(text)) {
//       collectRef.current = { q: text, opts: [] };
//       return;
//     }

//     pushSys(text, ts);
//   }

//   /* ---------- composer handlers ---------- */
//   const sendUser = () => {
//     if (!inputValue.trim() || loading) return;
//     const txt = inputValue.trim();
//     push({ type: 'patient', content: txt, timestamp: new Date().toISOString() });
//     setInput('');
//     sendMessage(txt);
//   };
//   const triggerFinish = () => {
//     push({ type: 'patient', content: ':finish', timestamp: new Date().toISOString() });
//     sendMessage(':finish');
//   };

//   /* ---------- first load ---------- */
//   useEffect(() => {
//     (async () => {
//       pushSys('Connecting…', new Date().toISOString());
//       await sendMessage('');
//     })();
//   }, []);

//   /* auto-scroll */
//   useLayoutEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading]);

//   /* ---------- JSX ---------- */
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center px-2 md:px-4">
//       <div className="flex flex-col w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl">

//         {/* header */}
//         <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <button onClick={() => navigate('/')} className="text-gray-600">←</button>
//             <div className="flex-1">
//               <h1 className="font-semibold text-gray-900">PsychiatryNow</h1>
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-600'}`} />
//                 <span className="text-sm text-gray-600">
//                   {loading ? 'Processing…' : 'AI Intake Specialist'}
//                 </span>
//               </div>
//             </div>
//             {sessionId && (
//               <span className="text-xs text-gray-500">Session: {sessionId}…</span>
//             )}
//           </div>
//         </div>

//         {/* history */}
//         <div className="flex-1 overflow-y-auto p-4"
//              style={{ paddingBottom: COMPOSER_H, minHeight: 0 }}>
//           {messages.map((m, i) =>
//             m.type === 'options' && m.options ? (
//               <OptionsBubble
//                 key={i}
//                 question={m.content}
//                 choices={m.options}
//                 onPick={c => {
//                   push({ type: 'patient', content: `${c.value}: ${c.label}`, timestamp: new Date().toISOString() });
//                   sendMessage(c.value);
//                 }}
//               />
//             ) : m.type === 'finish' ? (
//               <FinishBubble key="finish" onFinish={triggerFinish} />
//             ) : (
//               <ChatBubble key={i} type={m.type as 'patient' | 'system'}>
//                 <div className="whitespace-pre-line break-words">{m.content}</div>
//                 {m.timestamp && (
//                   <div className="text-xs text-gray-500 mt-1">
//                     {new Date(m.timestamp).toLocaleTimeString()}
//                   </div>
//                 )}
//               </ChatBubble>
//             )
//           )}

//           {loading && (
//             <ChatBubble type="system">
//               <div className="animate-pulse">Thinking…</div>
//             </ChatBubble>
//           )}

//           <div ref={bottomRef} />
//         </div>
//       </div>

//       {/* composer */}
//       <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200"
//            style={{ height: COMPOSER_H }}>
//         <div className="mx-auto w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl p-4">

//           {ready ? (
//             <CustomButton
//               variant="primary"
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//               onClick={() => navigate('/patient-intake-summary')}
//             >
//               Complete Intake &amp; Continue
//             </CustomButton>
//           ) : (
//             <div className="flex gap-2">
//               <CustomInput
//                 className="flex-1"
//                 value={inputValue}
//                 onChange={e => setInput(e.target.value)}
//                 placeholder={loading ? 'Please wait…' : 'Type your response…'}
//                 onKeyPress={e => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     sendUser();
//                   }
//                 }}
//                 disabled={loading}
//               />
//               <CustomButton
//                 variant="primary"
//                 disabled={loading || !inputValue.trim()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
//                 onClick={sendUser}
//               >
//                 {loading ? '…' : 'Send'}
//               </CustomButton>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }


// // PatientIntake.tsx
// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useLayoutEffect,
// } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ChatBubble } from './foundation/ChatBubble';
// import { CustomButton } from './foundation/Button';
// import { CustomInput } from './foundation/Input';

// /* ---------- helper types ---------- */
// interface Choice { value: string; label: string }
// interface ChatMessage {
//   type: 'patient' | 'system' | 'options' | 'finish';
//   content: string;
//   options?: Choice[];
//   timestamp?: string;
// }
// interface ServerMessage {
//   role: 'user' | 'model';
//   content: string;
//   timestamp: string;
//   done?: boolean;
// }

// /* ---------- option bubble ---------- */
// function OptionsBubble(
//   { question, choices, onPick }:
//   { question: string; choices: Choice[]; onPick: (c: Choice) => void },
// ) {
//   const [picked, setPicked] = useState<string | null>(null);
//   return (
//     <ChatBubble type="system">
//       <div className="mb-3 font-medium">{question}</div>
//       <div className="space-y-2">
//         {choices.map(c => (
//           <label
//             key={c.value}
//             className={`block border rounded-lg px-4 py-2 cursor-pointer transition
//                        ${picked === c.value
//                          ? 'border-blue-600 bg-blue-50'
//                          : 'border-gray-300 hover:bg-gray-50'}`}
//             onClick={() => {
//               if (picked) return;
//               setPicked(c.value);
//               onPick(c);
//             }}
//           >
//             {c.label}
//           </label>
//         ))}
//       </div>
//     </ChatBubble>
//   );
// }

// /* ---------- finish bubble ---------- */
// function FinishBubble(
//   {
//     onFinish,
//     disabled = false,
//   }: {
//     onFinish: () => void;
//     disabled?: boolean;
//   },
// ) {
//   return (
//     <ChatBubble type="system">
//       <div className="mb-3">
//         Thank you — anything else you want to share that could help a clinician?
//         If not, tap the button below to generate your report.
//       </div>
//       <CustomButton
//         variant="primary"
//         className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
//         onClick={onFinish}
//         disabled={disabled}
//       >
//         {disabled ? 'Generating…' : 'Generate report now'}
//       </CustomButton>
//     </ChatBubble>
//   );
// }

// /* ═════════════════ component ═════════════════ */
// export default function PatientIntake() {
//   const navigate = useNavigate();
//   const COMPOSER_H = 96;

//   /* state */
//   const [messages, setMessages]   = useState<ChatMessage[]>([]);
//   const [inputValue, setInput]    = useState('');
//   const [loading, setBusy]        = useState(false);
//   const [ready, setReady]         = useState(false);
//   const [finishing, setFinishing] = useState(false);  // NEW

//   /* session ID */
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const sessionRef = useRef<string | null>(null);

//   /* refs */
//   const bottomRef  = useRef<HTMLDivElement>(null);
//   const seenRef    = useRef<Set<string>>(new Set());
//   const ackRef     = useRef<string | null>(null);
//   const collectRef = useRef<{ q: string | null; opts: string[] }>({ q: null, opts: [] });

//   /* ---------- push helpers ---------- */
//   const push = (m: ChatMessage) => setMessages(prev => [...prev, m]);
//   const pushSys = (txt: string, ts?: string) => {
//     if (seenRef.current.has(txt)) return;
//     seenRef.current.add(txt);
//     push({ type: 'system', content: txt, timestamp: ts });
//   };
//   const pushOpt = (q: string, opts: Choice[], ts?: string) => {
//     const fp = q + '|' + opts.map(o => o.value).join(',');
//     if (seenRef.current.has(fp)) return;
//     seenRef.current.add(fp);
//     push({ type: 'options', content: q, options: opts, timestamp: ts });
//   };
//   const pushFinishBtn = (ts?: string) => {
//     if (seenRef.current.has('FINISH')) return;
//     seenRef.current.add('FINISH');
//     push({ type: 'finish', content: '', timestamp: ts });
//   };

//   /* ---------- POST helper (stream) ---------- */
//   const sendMessage = async (prompt: string) => {
//     if (loading) return;
//     setBusy(true);

//     const form = new FormData();
//     form.append('prompt', prompt);
//     if (sessionRef.current) form.append('session_id', sessionRef.current);

//     const controller = new AbortController();
//     let idle: ReturnType<typeof setTimeout> | undefined;

//     const resetIdle = () => {
//       clearTimeout(idle);
//       idle = setTimeout(() => controller.abort(), 12_000);
//     };

//     try {
//       const res = await fetch('http://localhost:8000/chat/', {
//         method: 'POST',
//         body: form,
//         signal: controller.signal,
//       });

//       const id = res.headers.get('X-Session-ID');
//       if (id && id !== sessionRef.current) {
//         sessionRef.current = id;
//         setSessionId(id.slice(0, 8));
//       }

//       const reader = res.body?.getReader();
//       if (!reader) {
//         setBusy(false);
//         return;
//       }

//       const decoder = new TextDecoder();
//       let buf = '';
//       let first = true;

//       while (true) {
//         const { value, done } =
//           (await reader.read().catch(() => ({ done: true }))) as
//             ReadableStreamReadResult<Uint8Array>;
//         if (done) break;

//         if (first) {
//           first = false;
//           setBusy(false);
//         }
//         resetIdle();

//         if (value) buf += decoder.decode(value, { stream: true });

//         const lines = buf.split('\n');
//         buf = lines.pop() ?? '';

//         for (const raw of lines) {
//           if (!raw.trim()) continue;

//           const sm: ServerMessage = JSON.parse(raw);
//           if (sm.role !== 'model') continue;

//           /* ---- final JSON chunk ---- */
//           if (sm.done) {
//             console.log('%c[INTAKE] raw final chunk', 'color:#0a0', sm.content);
//             let clean = sm.content.trim();
//             if (clean.startsWith('```')) {
//               clean = clean.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
//             }
//             try {
//               JSON.parse(clean);
//               console.log('[INTAKE] saved JSON length', clean.length);
//               localStorage.setItem('intakeReport', clean);
//               pushSys('Assessment completed! Report generated.', sm.timestamp);
//               setReady(true);
//             } catch (e) {
//               console.error('JSON parse error', e);
//               pushSys('⚠ Report format error. Please retry.', sm.timestamp);
//             }
//             continue;
//           }

//           processLine(sm.content.trim(), sm.timestamp);
//         }
//       }
//     } catch (e) {
//       console.error(e);
//       pushSys('Network error — please retry.', new Date().toISOString());
//     } finally {
//       setBusy(false);
//       clearTimeout(idle);
//     }
//   };

//   /* ---------- regexes ---------- */
//   const optRx   = /^\s*\d+\s*[:.]/;
//   const promptRx= /your\s+choice/i;
//   const finRx   = /:\s*finish/i;
//   const skipRx  = /^(you\b|⚠️|{)/i;
//   const earlyRx = /:\s*finish[^]*?:exit/i;

//   /* ---------- flush collector ---------- */
//   const flushCollector = (ts: string) => {
//     const { q, opts } = collectRef.current;
//     if (!q || opts.length < 2) {
//       collectRef.current = { q: null, opts: [] };
//       return;
//     }
//     const choices: Choice[] = opts.map(l => {
//       const [, v, lbl] = l.match(/^\s*(\d+)\s*[:.]\s*(.+)$/)!;
//       return { value: v, label: lbl };
//     });
//     pushOpt(q, choices, ts);
//     collectRef.current = { q: null, opts: [] };
//   };

//   /* ---------- process each assistant line ---------- */
//   function processLine(text: string, ts: string) {
//     if (skipRx.test(text) || earlyRx.test(text)) return;

//     /* finish prompt */
//     if (finRx.test(text)) {
//       const trimmed = text
//         .replace(/If not[^]*$/i, '')
//         .replace(/type\s*'?:finish'?.*$/i, '')
//         .trim();
//       if (trimmed) pushSys(trimmed, ts);
//       pushFinishBtn(ts);
//       return;
//     }

//     /* ack merge */
//     const ackP = /^PsychiatryNow\s*\(ack\):\s*/i;
//     const qP   = /^PsychiatryNow\s*:\s*/i;

//     if (ackP.test(text)) {
//       ackRef.current = text.replace(ackP, '').trim();
//       return;
//     }
//     if (qP.test(text) && ackRef.current) {
//       text = 'PsychiatryNow : ' + ackRef.current + '\n' +
//              text.replace(qP, '').trim();
//       ackRef.current = null;
//     } else if (ackRef.current) {
//       pushSys('PsychiatryNow : ' + ackRef.current, ts);
//       ackRef.current = null;
//     }

//     /* option collector */
//     if (promptRx.test(text) && collectRef.current.q) {
//       flushCollector(ts);
//       return;
//     }
//     if (optRx.test(text) && collectRef.current.q) {
//       collectRef.current.opts.push(text);
//       return;
//     }
//     if (/^(PHQ|GAD|AUDIT|ASRS|PCL|MDQ|DAST).*#\d+/i.test(text)) {
//       collectRef.current = { q: text, opts: [] };
//       return;
//     }

//     pushSys(text, ts);
//   }

//   /* ---------- composer handlers ---------- */
//   const sendUser = () => {
//     if (!inputValue.trim() || loading) return;
//     const txt = inputValue.trim();
//     push({ type: 'patient', content: txt, timestamp: new Date().toISOString() });
//     setInput('');
//     sendMessage(txt);
//   };

//   /* UPDATED: no longer pushes ":finish" into chat */
//   const triggerFinish = async () => {
//     if (loading || finishing) return;
//     setFinishing(true);
//     try {
//       await sendMessage(':finish');
//     } finally {
//       setFinishing(false);
//     }
//   };

//   /* ---------- first load ---------- */
//   useEffect(() => {
//     (async () => {
//       pushSys('Connecting…', new Date().toISOString());
//       await sendMessage('');
//     })();
//   }, []);

//   /* auto-scroll */
//   useLayoutEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading]);

//   /* ---------- JSX ---------- */
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center px-2 md:px-4">
//       <div className="flex flex-col w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl">

//         {/* header */}
//         <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <button onClick={() => navigate('/')} className="text-gray-600">←</button>
//             <div className="flex-1">
//               <h1 className="font-semibold text-gray-900">PsychiatryNow</h1>
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-600'}`} />
//                 <span className="text-sm text-gray-600">
//                   {loading ? 'Processing…' : 'AI Intake Specialist'}
//                 </span>
//               </div>
//             </div>
//             {sessionId && (
//               <span className="text-xs text-gray-500">Session: {sessionId}…</span>
//             )}
//           </div>
//         </div>

//         {/* history */}
//         <div className="flex-1 overflow-y-auto p-4"
//              style={{ paddingBottom: COMPOSER_H, minHeight: 0 }}>
//           {messages.map((m, i) =>
//             m.type === 'options' && m.options ? (
//               <OptionsBubble
//                 key={i}
//                 question={m.content}
//                 choices={m.options}
//                 onPick={c => {
//                   push({ type: 'patient', content: `${c.value}: ${c.label}`, timestamp: new Date().toISOString() });
//                   sendMessage(c.value);
//                 }}
//               />
//             ) : m.type === 'finish' ? (
//               <FinishBubble
//                 key="finish"
//                 onFinish={triggerFinish}
//                 disabled={finishing || loading}
//               />
//             ) : (
//               <ChatBubble key={i} type={m.type as 'patient' | 'system'}>
//                 <div className="whitespace-pre-line break-words">{m.content}</div>
//                 {m.timestamp && (
//                   <div className="text-xs text-gray-500 mt-1">
//                     {new Date(m.timestamp).toLocaleTimeString()}
//                   </div>
//                 )}
//               </ChatBubble>
//             )
//           )}

//           {loading && (
//             <ChatBubble type="system">
//               <div className="animate-pulse">Thinking…</div>
//             </ChatBubble>
//           )}

//           <div ref={bottomRef} />
//         </div>
//       </div>

//       {/* composer */}
//       <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200"
//            style={{ height: COMPOSER_H }}>
//         <div className="mx-auto w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl p-4">

//           {ready ? (
//             <CustomButton
//               variant="primary"
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//               onClick={() => navigate('/patient-intake-summary')}
//             >
//               Complete Intake &amp; Continue
//             </CustomButton>
//           ) : (
//             <div className="flex gap-2">
//               <CustomInput
//                 className="flex-1"
//                 value={inputValue}
//                 onChange={e => setInput(e.target.value)}
//                 placeholder={loading ? 'Please wait…' : 'Type your response…'}
//                 onKeyPress={e => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     sendUser();
//                   }
//                 }}
//                 disabled={loading}
//               />
//               <CustomButton
//                 variant="primary"
//                 disabled={loading || !inputValue.trim()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
//                 onClick={sendUser}
//               >
//                 {loading ? '…' : 'Send'}
//               </CustomButton>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }


// PatientIntake.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from './foundation/ChatBubble';
import { CustomButton } from './foundation/Button';
import { CustomInput } from './foundation/Input';

/* ---------- helper types ---------- */
interface Choice { value: string; label: string }
interface ChatMessage {
  type: 'patient' | 'system' | 'options' | 'finish';
  content: string;
  options?: Choice[];
  timestamp?: string;
}
interface ServerMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  done?: boolean;
}

/* ---------- option bubble ---------- */
function OptionsBubble(
  { question, choices, onPick }:
  { question: string; choices: Choice[]; onPick: (c: Choice) => void },
) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <ChatBubble type="system">
      <div className="mb-3 font-medium">{question}</div>
      <div className="space-y-2">
        {choices.map(c => (
          <label
            key={c.value}
            className={`block border rounded-lg px-4 py-2 cursor-pointer transition
                       ${picked === c.value
                         ? 'border-blue-600 bg-blue-50'
                         : 'border-gray-300 hover:bg-gray-50'}`}
            onClick={() => {
              if (picked) return;
              setPicked(c.value);
              onPick(c);
            }}
          >
            {c.label}
          </label>
        ))}
      </div>
    </ChatBubble>
  );
}

/* ---------- finish bubble ---------- */
function FinishBubble(
  {
    onFinish,
    disabled = false,
  }: {
    onFinish: () => void;
    disabled?: boolean;
  },
) {
  return (
    <ChatBubble type="system">
      <div className="mb-3">
        Thank you — anything else you want to share that could help a clinician?
        If not, tap the button below to generate your report.
      </div>
      <CustomButton
        variant="primary"
        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
        onClick={onFinish}
        disabled={disabled}
      >
        {disabled ? 'Generating…' : 'Generate report now'}
      </CustomButton>
    </ChatBubble>
  );
}

/* ═════════════════ component ═════════════════ */
export default function PatientIntake() {
  const navigate = useNavigate();
  const COMPOSER_H = 96;

  /* state */
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [inputValue, setInput]    = useState('');
  const [loading, setBusy]        = useState(false);
  const [ready, setReady]         = useState(false);
  const [finishing, setFinishing] = useState(false);   // marks ":finish" in flight

  /* session ID */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  /* refs */
  const bottomRef  = useRef<HTMLDivElement>(null);
  const seenRef    = useRef<Set<string>>(new Set());
  const ackRef     = useRef<string | null>(null);
  const collectRef = useRef<{ q: string | null; opts: string[] }>({ q: null, opts: [] });

  /* ---------- push helpers ---------- */
  const push = (m: ChatMessage) => setMessages(prev => [...prev, m]);
  const pushSys = (txt: string, ts?: string) => {
    if (seenRef.current.has(txt)) return;
    seenRef.current.add(txt);
    push({ type: 'system', content: txt, timestamp: ts });
  };
  const pushOpt = (q: string, opts: Choice[], ts?: string) => {
    const fp = q + '|' + opts.map(o => o.value).join(',');
    if (seenRef.current.has(fp)) return;
    seenRef.current.add(fp);
    push({ type: 'options', content: q, options: opts, timestamp: ts });
  };
  const pushFinishBtn = (ts?: string) => {
    if (seenRef.current.has('FINISH')) return;
    seenRef.current.add('FINISH');
    push({ type: 'finish', content: '', timestamp: ts });
  };

  /* ---------- POST helper (stream) ---------- */
  const sendMessage = async (prompt: string) => {
    if (loading) return;
    setBusy(true);

    const form = new FormData();
    form.append('prompt', prompt);
    if (sessionRef.current) form.append('session_id', sessionRef.current);

    const controller = new AbortController();
    let idle: ReturnType<typeof setTimeout> | undefined;
    const resetIdle = () => {
      clearTimeout(idle);
      idle = setTimeout(() => controller.abort(), 12_000);
    };

    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });

      const id = res.headers.get('X-Session-ID');
      if (id && id !== sessionRef.current) {
        sessionRef.current = id;
        setSessionId(id.slice(0, 8));
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setBusy(false);
        return;
      }

      const decoder = new TextDecoder();
      let buf = '';
      let first = true;

      while (true) {
        const { value, done } =
          (await reader.read().catch(() => ({ done: true }))) as
            ReadableStreamReadResult<Uint8Array>;
        if (done) break;

        if (first) {
          first = false;
          setBusy(false);
        }
        resetIdle();

        if (value) buf += decoder.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const raw of lines) {
          if (!raw.trim()) continue;

          const sm: ServerMessage = JSON.parse(raw);
          if (sm.role !== 'model') continue;

          /* ---- final JSON chunk ---- */
          if (sm.done) {
            console.log('%c[INTAKE] raw final chunk', 'color:#0a0', sm.content);
            let clean = sm.content.trim();
            if (clean.startsWith('```')) {
              clean = clean.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
            }
            try {
              JSON.parse(clean);
              console.log('[INTAKE] saved JSON length', clean.length);
              localStorage.setItem('intakeReport', clean);
              pushSys('Assessment completed! Report generated.', sm.timestamp);
              setReady(true);
            } catch (e) {
              console.error('JSON parse error', e);
              pushSys('⚠ Report format error. Please retry.', sm.timestamp);
            }
            continue;
          }

          processLine(sm.content.trim(), sm.timestamp);
        }
      }
    } catch (e) {
      console.error(e);
      pushSys('Network error — please retry.', new Date().toISOString());
    } finally {
      setBusy(false);
      clearTimeout(idle);
    }
  };

  /* ---------- regexes ---------- */
  const optRx    = /^\s*\d+\s*[:.]/;
  const promptRx = /your\s+choice/i;
  const finRx    = /:\s*finish/i;
  const skipRx   = /^(you\b|⚠️|{)/i;          // existing filters
  const earlyRx  = /:\s*finish[^]*?:exit/i;

  /* ---------- flush collector ---------- */
  const flushCollector = (ts: string) => {
    const { q, opts } = collectRef.current;
    if (!q || opts.length < 2) {
      collectRef.current = { q: null, opts: [] };
      return;
    }
    const choices: Choice[] = opts.map(l => {
      const [, v, lbl] = l.match(/^\s*(\d+)\s*[:.]\s*(.+)$/)!;
      return { value: v, label: lbl };
    });
    pushOpt(q, choices, ts);
    collectRef.current = { q: null, opts: [] };
  };

  /* ---------- process each assistant line ---------- */
  function processLine(text: string, ts: string) {
    if (skipRx.test(text) || earlyRx.test(text)) return;

    /* suppress list of generated files */
    if (/^-\s*PsychiatryNow_Report_/i.test(text)) return;

    /* normalise “saved” line */
    if (/^✅.*structured report generated/i.test(text)) {
      pushSys('✅ Final structured report generated :', ts);
      return;
    }

    /* finish prompt */
    if (finRx.test(text)) {
      const trimmed = text
        .replace(/If not[^]*$/i, '')
        .replace(/type\s*'?:finish'?.*$/i, '')
        .trim();
      if (trimmed) pushSys(trimmed, ts);
      pushFinishBtn(ts);
      return;
    }

    /* ack merge */
    const ackP = /^PsychiatryNow\s*\(ack\):\s*/i;
    const qP   = /^PsychiatryNow\s*:\s*/i;

    if (ackP.test(text)) {
      ackRef.current = text.replace(ackP, '').trim();
      return;
    }
    if (qP.test(text) && ackRef.current) {
      text = 'PsychiatryNow : ' + ackRef.current + '\n' +
             text.replace(qP, '').trim();
      ackRef.current = null;
    } else if (ackRef.current) {
      pushSys('PsychiatryNow : ' + ackRef.current, ts);
      ackRef.current = null;
    }

    /* option collector */
    if (promptRx.test(text) && collectRef.current.q) {
      flushCollector(ts);
      return;
    }
    if (optRx.test(text) && collectRef.current.q) {
      collectRef.current.opts.push(text);
      return;
    }
    if (/^(PHQ|GAD|AUDIT|ASRS|PCL|MDQ|DAST).*#\d+/i.test(text)) {
      collectRef.current = { q: text, opts: [] };
      return;
    }

    pushSys(text, ts);
  }

  /* ---------- composer handlers ---------- */
  const sendUser = () => {
    if (!inputValue.trim() || loading) return;
    const txt = inputValue.trim();
    push({ type: 'patient', content: txt, timestamp: new Date().toISOString() });
    setInput('');
    sendMessage(txt);
  };

  const triggerFinish = async () => {
    if (loading || finishing || ready) return;
    setFinishing(true);
    try {
      await sendMessage(':finish');
    } finally {
      setFinishing(false);
    }
  };

  /* ---------- first load ---------- */
  useEffect(() => {
    (async () => {
      pushSys('Connecting…', new Date().toISOString());
      await sendMessage('');
    })();
  }, []);

  /* auto-scroll */
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-2 md:px-4">
      <div className="flex flex-col w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl">

        {/* header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-600">←</button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">PsychiatryNow</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-600'}`} />
                <span className="text-sm text-gray-600">
                  {loading ? 'Processing…' : 'AI Intake Specialist'}
                </span>
              </div>
            </div>
            {sessionId && (
              <span className="text-xs text-gray-500">Session: {sessionId}…</span>
            )}
          </div>
        </div>

        {/* history */}
        <div className="flex-1 overflow-y-auto p-4"
             style={{ paddingBottom: COMPOSER_H, minHeight: 0 }}>
          {messages.map((m, i) =>
            m.type === 'options' && m.options ? (
              <OptionsBubble
                key={i}
                question={m.content}
                choices={m.options}
                onPick={c => {
                  push({ type: 'patient', content: `${c.value}: ${c.label}`, timestamp: new Date().toISOString() });
                  sendMessage(c.value);
                }}
              />
            ) : m.type === 'finish' ? (
              <FinishBubble
                key="finish"
                onFinish={triggerFinish}
                disabled={finishing || loading || ready}
              />
            ) : (
              <ChatBubble key={i} type={m.type as 'patient' | 'system'}>
                <div className="whitespace-pre-line break-words">{m.content}</div>
                {m.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </ChatBubble>
            )
          )}

          {loading && (
            <ChatBubble type="system">
              <div className="animate-pulse">Thinking…</div>
            </ChatBubble>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* composer */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200"
           style={{ height: COMPOSER_H }}>
        <div className="mx-auto w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl p-4">

          {ready ? (
            <CustomButton
              variant="primary"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/patient-intake-summary')}
            >
              Complete Intake &amp; Continue
            </CustomButton>
          ) : (
            <div className="flex gap-2">
              <CustomInput
                className="flex-1"
                value={inputValue}
                onChange={e => setInput(e.target.value)}
                placeholder={loading ? 'Please wait…' : 'Type your response…'}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendUser();
                  }
                }}
                disabled={loading}
              />
              <CustomButton
                variant="primary"
                disabled={loading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                onClick={sendUser}
              >
                {loading ? '…' : 'Send'}
              </CustomButton>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
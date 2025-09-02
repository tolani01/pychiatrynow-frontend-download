// //PatientIntakeSummary.tsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CustomButton } from './foundation/Button';
// import { CustomCard } from './foundation/Card';

// type SeverityLevel = 'mild' | 'moderate' | 'severe';

// export default function PatientIntakeSummary() {
//   const navigate = useNavigate();
//   // For demo purposes, we'll cycle through severity levels
//   const [severityLevel] = useState<SeverityLevel>('moderate');

//   const getSeverityConfig = (severity: SeverityLevel) => {
//     switch (severity) {
//       case 'mild':
//         return {
//           color: 'bg-green-100 border-green-200 text-green-800',
//           iconBg: 'bg-green-500',
//           icon: '✓',
//           title: 'Mild Symptoms Detected',
//           description: 'Your responses suggest mild symptoms that may be affecting you occasionally.',
//           nextSteps: 'A provider can confirm your results and suggest simple strategies to help you feel better.',
//           resources: [
//             { icon: '🧘', title: 'Stress Management Tips', description: 'Simple techniques to manage daily stress' },
//             { icon: '📝', title: 'Journaling Prompts', description: 'Guided writing exercises for reflection' },
//             { icon: '😴', title: 'Sleep Hygiene Practices', description: 'Tips for better rest and recovery' }
//           ]
//         };
//       case 'moderate':
//         return {
//           color: 'bg-amber-100 border-amber-200 text-amber-800',
//           iconBg: 'bg-amber-500',
//           icon: '!',
//           title: 'Moderate Symptoms Detected',
//           description: 'Your responses suggest moderate symptoms that may be impacting your daily life.',
//           nextSteps: 'A licensed provider can confirm these results and discuss treatment options with you.',
//           resources: [
//             { icon: '🧠', title: 'Mindfulness & Grounding Exercises', description: 'Techniques to stay present and calm' },
//             { icon: '📋', title: 'CBT Worksheets', description: 'Evidence-based cognitive exercises' },
//             { icon: '💪', title: 'Healthy Lifestyle Adjustments', description: 'Small changes that can make a big difference' }
//           ]
//         };
//       case 'severe':
//         return {
//           color: 'bg-red-100 border-red-200 text-red-800',
//           iconBg: 'bg-red-500',
//           icon: '⚠',
//           title: 'Severe Symptoms Detected',
//           description: 'Your responses suggest more severe symptoms that may need immediate support.',
//           nextSteps: 'We recommend connecting with a licensed provider as soon as possible.',
//           resources: [
//             { icon: '📞', title: 'Crisis Hotline: 988', description: '24/7 support when you need it most' },
//             { icon: '🎯', title: 'Grounding Techniques', description: 'Immediate tools for overwhelming moments' },
//             { icon: '👥', title: 'Support Groups', description: 'Local and online communities for connection' }
//           ]
//         };
//     }
//   };

//   const config = getSeverityConfig(severityLevel);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <button 
//               onClick={() => navigate('/')}
//               className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
//             >
//               PsychiatryNow
//             </button>
//             <button
//               onClick={() => navigate('/patient-dashboard')}
//               className="text-gray-600 hover:text-gray-900 text-sm"
//             >
//               Go to Dashboard
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Page Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-3">
//             Your Mental Health Check-In Summary
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Based on your responses, here's an overview prepared by Ava, your intake guide.
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* Severity Level Card */}
//           <CustomCard className={`${config.color} border-2 p-6 rounded-xl`}>
//             <div className="flex items-start gap-4">
//               <div className={`${config.iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
//                 <span className="text-white text-xl font-bold">{config.icon}</span>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-xl font-semibold mb-2">{config.title}</h2>
//                 <p className="text-base leading-relaxed">{config.description}</p>
//               </div>
//             </div>
//           </CustomCard>

//           {/* Safety Notice for Severe */}
//           {severityLevel === 'severe' && (
//             <CustomCard className="bg-red-50 border-red-200 border-2 p-6 rounded-xl">
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-white text-xl">🚨</span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-red-800 mb-2">Important Safety Note</h3>
//                   <p className="text-red-700 leading-relaxed">
//                     If you ever feel unsafe, please call <strong>911</strong> or go to the nearest emergency room.
//                   </p>
//                 </div>
//               </div>
//             </CustomCard>
//           )}

//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Next Steps */}
//             <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-blue-600 text-lg">📋</span>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">Next Steps</h3>
//               </div>
//               <p className="text-gray-700 leading-relaxed">{config.nextSteps}</p>
//             </CustomCard>

//             {/* Call-to-Action Buttons */}
//             <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-purple-600 text-lg">⚡</span>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">Take Action</h3>
//               </div>
//               <div className="space-y-3">
//                 <CustomButton
//                   variant="primary"
//                   onClick={() => navigate('/patient-signup')}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
//                 >
//                   Request Appointment
//                 </CustomButton>
//                 <CustomButton
//                   variant="secondary"
//                   onClick={() => navigate('/resources')}
//                   className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium"
//                 >
//                   View Resources
//                 </CustomButton>
//               </div>
//             </CustomCard>
//           </div>

//           {/* Suggested Resources */}
//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <div className="flex items-start gap-3 mb-6">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                 <span className="text-green-600 text-lg">💡</span>
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900">Suggested Self-Resources</h3>
//             </div>
//             <div className="grid md:grid-cols-3 gap-4">
//               {config.resources.map((resource, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
//                   <div className="flex items-start gap-3">
//                     <span className="text-2xl">{resource.icon}</span>
//                     <div>
//                       <h4 className="font-semibold text-gray-900 mb-1">{resource.title}</h4>
//                       <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CustomCard>

//           {/* Bottom Message */}
//           <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6">
//             <div className="flex items-center justify-center gap-2 mb-3">
//               <span className="text-2xl">💙</span>
//               <h4 className="text-lg font-semibold text-gray-900">You've taken an important step</h4>
//             </div>
//             <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
//               Thank you for taking the time to share your experiences with Ava. This summary will help your future provider 
//               understand your needs better and provide more personalized care.
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// PatientIntakeSummary.tsx
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CustomButton } from './foundation/Button';
// import { CustomCard } from './foundation/Card';

// type SeverityLevel = 'mild' | 'moderate' | 'severe';

// export default function PatientIntakeSummary() {
//   const navigate = useNavigate();

//   /* 1️⃣  pull saved JSON; decide severity */
//   const [severity, setSeverity] = useState<SeverityLevel | null>(null);

//   useEffect(() => {
//     const raw = localStorage.getItem('intakeReport');
//     if (!raw) return;

//     try {
//       const rpt = JSON.parse(raw);

//       /* crude rule: worst of PHQ-9 + GAD-7 + ASRS */
//       const phq = rpt.screeners?.find((s:any)=>s.name==='PHQ-9')?.score ?? 0;
//       const gad = rpt.screeners?.find((s:any)=>s.name==='GAD-7')?.score ?? 0;
//       const asrs= rpt.screeners?.find((s:any)=>s.name?.startsWith('ASRS'))?.score ?? 0;
//       const worst = Math.max(phq, gad, asrs);

//       if (worst >= 20)      setSeverity('severe');
//       else if (worst >=10)  setSeverity('moderate');
//       else                  setSeverity('mild');
//     } catch (e) {
//       console.error('Bad report JSON', e);
//     }
//   }, []);

//   if (!severity)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         No summary available. Please complete an intake first.
//       </div>
//     );

//   /* ----- config helper (unchanged) ----- */
//   const getCfg = (lvl:SeverityLevel) => {
//     switch (lvl) {
//       case 'mild': return {
//         color:'bg-green-100 border-green-200 text-green-800',
//         iconBg:'bg-green-500', icon:'✓',
//         title:'Mild Symptoms Detected',
//         description:'Your responses suggest mild symptoms that may be affecting you occasionally.',
//         nextSteps:'A provider can confirm your results and suggest simple strategies to help you feel better.',
//         resources:[
//           {icon:'🧘',title:'Stress Management Tips',description:'Simple techniques to manage daily stress'},
//           {icon:'📝',title:'Journaling Prompts',description:'Guided writing exercises for reflection'},
//           {icon:'😴',title:'Sleep Hygiene Practices',description:'Tips for better rest and recovery'},
//         ]};
//       case 'moderate': return {
//         color:'bg-amber-100 border-amber-200 text-amber-800',
//         iconBg:'bg-amber-500', icon:'!',
//         title:'Moderate Symptoms Detected',
//         description:'Your responses suggest moderate symptoms that may be impacting your daily life.',
//         nextSteps:'A licensed provider can confirm these results and discuss treatment options with you.',
//         resources:[
//           {icon:'🧠',title:'Mindfulness & Grounding',description:'Techniques to stay present and calm'},
//           {icon:'📋',title:'CBT Worksheets',description:'Evidence-based cognitive exercises'},
//           {icon:'💪',title:'Healthy Lifestyle',description:'Small changes that make a big difference'},
//         ]};
//       case 'severe': return {
//         color:'bg-red-100 border-red-200 text-red-800',
//         iconBg:'bg-red-500', icon:'⚠',
//         title:'Severe Symptoms Detected',
//         description:'Your responses suggest more severe symptoms that may need immediate support.',
//         nextSteps:'We recommend connecting with a licensed provider as soon as possible.',
//         resources:[
//           {icon:'📞',title:'Crisis Hotline: 988',description:'24/7 support when you need it most'},
//           {icon:'🎯',title:'Grounding Techniques',description:'Immediate tools for overwhelming moments'},
//           {icon:'👥',title:'Support Groups',description:'Local and online communities for connection'},
//         ]};
//     }
//   };
//   const cfg = getCfg(severity);

//   /* ----- UI ----- */
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
//           <button onClick={()=>navigate('/')} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
//             PsychiatryNow
//           </button>
//           <button onClick={()=>navigate('/patient-dashboard')}
//                   className="text-gray-600 hover:text-gray-900 text-sm">
//             Go to Dashboard
//           </button>
//         </div>
//       </header>

//       {/* main */}
//       <main className="max-w-4xl mx-auto px-4 py-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-3">
//             Your Mental Health Check-In Summary
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Based on your responses, here's an overview prepared by Ava, your intake guide.
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* severity card */}
//           <CustomCard className={`${cfg.color} border-2 p-6 rounded-xl`}>
//             <div className="flex items-start gap-4">
//               <div className={`${cfg.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
//                 <span className="text-white text-xl font-bold">{cfg.icon}</span>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-xl font-semibold mb-2">{cfg.title}</h2>
//                 <p className="leading-relaxed">{cfg.description}</p>
//               </div>
//             </div>
//           </CustomCard>

//           {/* safety banner for severe */}
//           {severity==='severe' && (
//             <CustomCard className="bg-red-50 border-red-200 border-2 p-6 rounded-xl">
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xl">🚨</span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-red-800 mb-2">Important Safety Note</h3>
//                   <p className="text-red-700">If you ever feel unsafe, please call <b>911</b> or go to the nearest emergency room.</p>
//                 </div>
//               </div>
//             </CustomCard>
//           )}

//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* next steps */}
//             <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                   <span className="text-blue-600 text-lg">📋</span>
//                 </div>
//                 <h3 className="text-xl font-semibold">Next Steps</h3>
//               </div>
//               <p className="text-gray-700">{cfg.nextSteps}</p>
//             </CustomCard>

//             {/* call-to-action buttons */}
//             <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                   <span className="text-purple-600 text-lg">⚡</span>
//                 </div>
//                 <h3 className="text-xl font-semibold">Take Action</h3>
//               </div>
//               <div className="space-y-3">
//                 <CustomButton variant="primary"
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
//                   onClick={()=>navigate('/patient-signup')}>
//                   Request Appointment
//                 </CustomButton>
//                 <CustomButton variant="secondary"
//                   className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
//                   onClick={()=>navigate('/resources')}>
//                   View Resources
//                 </CustomButton>
//               </div>
//             </CustomCard>
//           </div>

//           {/* resources */}
//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <div className="flex items-start gap-3 mb-6">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                 <span className="text-green-600 text-lg">💡</span>
//               </div>
//               <h3 className="text-xl font-semibold">Suggested Self-Resources</h3>
//             </div>
//             <div className="grid md:grid-cols-3 gap-4">
//               {cfg.resources.map((r,i)=>(
//                 <div key={i} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
//                   <div className="flex items-start gap-3">
//                     <span className="text-2xl">{r.icon}</span>
//                     <div>
//                       <h4 className="font-semibold">{r.title}</h4>
//                       <p className="text-sm text-gray-600">{r.description}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CustomCard>

//           {/* footer */}
//           <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6">
//             <div className="flex items-center justify-center gap-2 mb-3">
//               <span className="text-2xl">💙</span>
//               <h4 className="text-lg font-semibold text-gray-900">
//                 You've taken an important step
//               </h4>
//             </div>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Thank you for sharing your experiences with Ava. This summary will help your future provider
//               understand your needs better and provide more personalized care.
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CustomButton } from './foundation/Button';
// import { CustomCard } from './foundation/Card';

// type SeverityLevel = 'mild' | 'moderate' | 'severe';

// export default function PatientIntakeSummary() {
//   const navigate = useNavigate();

//   const [severity, setSeverity] = useState<SeverityLevel | null>(null);
//   const [report,   setReport]   = useState<any>(null);

//   /* fetch stored JSON + derive severity */
//   useEffect(() => {
//     const raw = localStorage.getItem('intakeReport');
//     if (!raw) return;

//     try {
//       const rpt = JSON.parse(raw);
//       setReport(rpt);

//       const phq = rpt.screeners?.find((s:any)=>s.name==='PHQ-9')?.score ?? 0;
//       const gad = rpt.screeners?.find((s:any)=>s.name==='GAD-7')?.score ?? 0;
//       const asrs= rpt.screeners?.find((s:any)=>s.name?.startsWith('ASRS'))?.score ?? 0;
//       const worst = Math.max(phq, gad, asrs);

//       if (worst >= 20)      setSeverity('severe');
//       else if (worst >=10)  setSeverity('moderate');
//       else                  setSeverity('mild');
//     } catch { /* ignore */ }
//   }, []);

//   if (!report || !severity)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         No summary available. Please complete an intake first.
//       </div>
//     );

//   /* visual config */
//   const cfg = {
//     mild: {
//       color:'bg-green-100 border-green-200 text-green-800',
//       iconBg:'bg-green-500', icon:'✓',
//       title:'Mild Symptoms Detected',
//       description:'Your responses suggest mild symptoms that may be affecting you occasionally.',
//       nextSteps:'A provider can confirm your results and suggest simple strategies to help you feel better.',
//       resources:[
//         {icon:'🧘',title:'Stress Management Tips',description:'Simple techniques to manage daily stress'},
//         {icon:'📝',title:'Journaling Prompts',description:'Guided writing exercises for reflection'},
//         {icon:'😴',title:'Sleep Hygiene Practices',description:'Tips for better rest and recovery'},
//       ],
//     },
//     moderate: {
//       color:'bg-amber-100 border-amber-200 text-amber-800',
//       iconBg:'bg-amber-500', icon:'!',
//       title:'Moderate Symptoms Detected',
//       description:'Your responses suggest moderate symptoms that may be impacting your daily life.',
//       nextSteps:'A licensed provider can confirm these results and discuss treatment options with you.',
//       resources:[
//         {icon:'🧠',title:'Mindfulness & Grounding',description:'Techniques to stay present and calm'},
//         {icon:'📋',title:'CBT Worksheets',description:'Evidence-based cognitive exercises'},
//         {icon:'💪',title:'Healthy Lifestyle',description:'Small changes that make a big difference'},
//       ],
//     },
//     severe: {
//       color:'bg-red-100 border-red-200 text-red-800',
//       iconBg:'bg-red-500', icon:'⚠',
//       title:'Severe Symptoms Detected',
//       description:'Your responses suggest more severe symptoms that may need immediate support.',
//       nextSteps:'We recommend connecting with a licensed provider as soon as possible.',
//       resources:[
//         {icon:'📞',title:'Crisis Hotline: 988',description:'24/7 support when you need it most'},
//         {icon:'🎯',title:'Grounding Techniques',description:'Immediate tools for overwhelming moments'},
//         {icon:'👥',title:'Support Groups',description:'Local and online communities for connection'},
//       ],
//     },
//   }[severity];

//   /* helper rows for screener table */
//   const screenerRows = report.screeners?.map((s:any,i:number)=>(
//     <tr key={i} className="border-t">
//       <td className="py-2 font-medium">{s.name}</td>
//       <td className="py-2">{s.score}</td>
//       <td className="py-2">{s.interpretation}</td>
//     </tr>
//   ));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
//           <button onClick={()=>navigate('/')}
//                   className="text-xl font-semibold text-gray-900 hover:text-blue-600">
//             PsychiatryNow
//           </button>
//           <button onClick={()=>navigate('/patient-dashboard')}
//                   className="text-gray-600 hover:text-gray-900 text-sm">
//             Go to Dashboard
//           </button>
//         </div>
//       </header>

//       {/* body */}
//       <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
//         {/* severity card */}
//         <CustomCard className={`${cfg.color} border-2 p-6 rounded-xl`}>
//           <div className="flex items-start gap-4">
//             <div className={`${cfg.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xl font-bold">{cfg.icon}</span>
//             </div>
//             <div className="flex-1">
//               <h2 className="text-xl font-semibold mb-2">{cfg.title}</h2>
//               <p className="leading-relaxed">{cfg.description}</p>
//             </div>
//           </div>
//         </CustomCard>

//         {/* detailed report */}
//         <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//           <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//             Detailed Intake Report
//           </h3>

//           {/* basics */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Column>
//               <Detail label="Patient ID"            value={report.patient_id}/>
//               <Detail label="Date"                  value={new Date(report.date).toLocaleString()}/>
//               <Detail label="Chief Complaint"       value={report.chief_complaint}/>
//               <Detail label="History of Present Illness" value={report.history_present_illness}/>
//               <Detail label="Safety Assessment"     value={report.safety_assessment}/>
//               <Detail label="Psychiatric History"   value={report.psychiatric_history}/>
//             </Column>
//             <Column>
//               <Detail label="Medication History"    value={report.medication_history}/>
//               <Detail label="Medical History"       value={report.medical_history}/>
//               <Detail label="Substance Use"         value={report.substance_use}/>
//               <Detail label="Family History"        value={report.family_history}/>
//               <Detail label="Social History"        value={report.social_history}/>
//               <Detail label="Protective Factors"    value={report.protective_factors}/>
//             </Column>
//           </div>

//           {/* screeners */}
//           <h4 className="text-xl font-semibold mt-8 mb-3">Screeners</h4>
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left py-2">Name</th>
//                   <th className="text-left py-2">Score</th>
//                   <th className="text-left py-2">Interpretation</th>
//                 </tr>
//               </thead>
//               <tbody>{screenerRows}</tbody>
//             </table>
//           </div>

//           {/* impression / steps */}
//           <div className="mt-6 space-y-4">
//             <Detail label="Summary Impression" value={report.summary_impression}/>
//             <Detail label="Next Steps"         value={report.next_steps}/>
//             <Detail label="Risk Level"         value={report.risk_level}/>
//             <Detail label="Disclaimer"         value={report.disclaimer}/>
//           </div>
//         </CustomCard>

//         {/* safety banner (for severe only) */}
//         {severity==='severe' && (
//           <CustomCard className="bg-red-50 border-red-200 border-2 p-6 rounded-xl">
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                 <span className="text-white text-xl">🚨</span>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-red-800 mb-2">Important Safety Note</h3>
//                 <p className="text-red-700">
//                   If you ever feel unsafe, please call <b>911</b> or go to the nearest emergency room.
//                 </p>
//               </div>
//             </div>
//           </CustomCard>
//         )}

//         {/* next steps + CTA buttons */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           {/* next steps card */}
//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <Header icon="📋" title="Next Steps"/>
//             <p className="text-gray-700">{cfg.nextSteps}</p>
//           </CustomCard>

//           {/* appointment / resources card */}
//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <Header icon="⚡" title="Take Action"/>
//             <div className="space-y-3">
//               <CustomButton variant="primary"
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
//                 onClick={()=>navigate('/patient-signup')}>
//                 Request Appointment
//               </CustomButton>
//               <CustomButton variant="secondary"
//                 className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
//                 onClick={()=>navigate('/resources')}>
//                 View Resources
//               </CustomButton>
//             </div>
//           </CustomCard>
//         </div>

//         {/* suggested resources */}
//         <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//           <Header icon="💡" title="Suggested Self-Resources"/>
//           <div className="grid md:grid-cols-3 gap-4">
//             {cfg.resources.map((r,i)=>(
//               <div key={i}
//                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
//                 <div className="flex items-start gap-3">
//                   <span className="text-2xl">{r.icon}</span>
//                   <div>
//                     <h4 className="font-semibold">{r.title}</h4>
//                     <p className="text-sm text-gray-600">{r.description}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CustomCard>

//         {/* footer encouragement */}
//         <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6">
//           <div className="flex items-center justify-center gap-2 mb-3">
//             <span className="text-2xl">💙</span>
//             <h4 className="text-lg font-semibold text-gray-900">
//               You've taken an important step
//             </h4>
//           </div>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Thank you for sharing your experiences with Ava. This summary will help your
//             future provider understand your needs better and provide more personalized care.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }

// /* --- small helpers --- */
// function Column({children}:{children:React.ReactNode}){ return <div className="space-y-4">{children}</div>; }

// function Header({icon,title}:{icon:string;title:string}) {
//   return (
//     <div className="flex items-start gap-3 mb-4">
//       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//         <span className="text-blue-600 text-lg">{icon}</span>
//       </div>
//       <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
//     </div>
//   );
// }

// function Detail({label,value}:{label:string;value:any}) {
//   return (
//     <div>
//       <h5 className="font-semibold text-gray-800">{label}</h5>
//       <p className="text-gray-700 whitespace-pre-line">{value || '—'}</p>
//     </div>
//   );
// }


// PatientIntakeSummary.tsx
// – full file –
//   Displays severity card, full structured report,
//   and keeps Request-Appointment, View-Resources, etc.
// PatientIntakeSummary.tsx
// – full file –
//   Displays severity card, full structured report,
//   and keeps Request-Appointment, View-Resources, etc.

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CustomButton } from './foundation/Button';
// import { CustomCard } from './foundation/Card';

// type SeverityLevel = 'mild' | 'moderate' | 'severe';
// interface Screener { name:string; score:number; interpretation:string }

// /* small helpers */
// const Column = ({children}:{children:React.ReactNode})=> <div className="space-y-4">{children}</div>;
// const Field  = ({label,value}:{label:string;value:any})=>(
//   <div>
//     <h5 className="font-semibold text-gray-800">{label}</h5>
//     <p className="text-gray-700 whitespace-pre-line">{value||'—'}</p>
//   </div>
// );
// const Header = ({icon,title}:{icon:string;title:string})=>(
//   <div className="flex items-start gap-3 mb-4">
//     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//       <span className="text-blue-600 text-lg">{icon}</span>
//     </div>
//     <h3 className="text-xl font-semibold">{title}</h3>
//   </div>
// );

// export default function PatientIntakeSummary(){
//   const nav=useNavigate();
//   const [report,setReport]=useState<any|null>(null);
//   const [severity,setSeverity]=useState<SeverityLevel>('mild');

//   /* load */
//   useEffect(()=>{
//     const raw=localStorage.getItem('intakeReport');
//     if(!raw) return;
//     try{
//       const rpt=JSON.parse(raw); setReport(rpt);
//       const phq=rpt.screeners?.find((s:Screener)=>s.name==='PHQ-9')?.score??0;
//       const gad=rpt.screeners?.find((s:Screener)=>s.name==='GAD-7')?.score??0;
//       const worst=Math.max(phq,gad);
//       if(worst>=20) setSeverity('severe'); else if(worst>=10) setSeverity('moderate');
//     }catch(e){console.error(e);}
//   },[]);

//   if(!report) return <div className="min-h-screen flex items-center justify-center">No summary available.</div>;

//   const palette={
//     mild:{bg:'bg-green-100',border:'border-green-200',icon:'✓',iconBg:'bg-green-500',text:'text-green-800'},
//     moderate:{bg:'bg-amber-100',border:'border-amber-200',icon:'!',iconBg:'bg-amber-500',text:'text-amber-800'},
//     severe:{bg:'bg-red-100',border:'border-red-200',icon:'⚠',iconBg:'bg-red-500',text:'text-red-800'},
//   }[severity];

//   const screenerRows=report.screeners?.map((s:Screener,i:number)=>(
//     <tr key={i} className="border-t">
//       <td className="py-2">{s.name}</td><td>{s.score}</td><td>{s.interpretation}</td>
//     </tr>
//   ));

//   /* suggested resources */
//   const resources={
//     mild:[
//       {icon:'🧘',title:'Stress Management',description:'Simple techniques to manage daily stress'},
//       {icon:'📝',title:'Journaling Prompts',description:'Guided writing exercises for reflection'},
//       {icon:'😴',title:'Sleep Hygiene',description:'Tips for better rest and recovery'},
//     ],
//     moderate:[
//       {icon:'🧠',title:'Mindfulness & Grounding',description:'Techniques to stay present and calm'},
//       {icon:'📋',title:'CBT Worksheets',description:'Evidence-based cognitive exercises'},
//       {icon:'💪',title:'Healthy Lifestyle',description:'Small changes that make a big difference'},
//     ],
//     severe:[
//       {icon:'📞',title:'Crisis Hotline 988',description:'24/7 support when you need it most'},
//       {icon:'🎯',title:'Grounding Techniques',description:'Immediate tools for overwhelming moments'},
//       {icon:'👥',title:'Support Groups',description:'Local and online communities for connection'},
//     ],
//   }[severity];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
//           <button onClick={()=>nav('/')} className="text-xl font-semibold hover:text-blue-600">PsychiatryNow</button>
//           <button onClick={()=>nav('/patient-dashboard')} className="text-sm text-gray-600 hover:text-gray-900">Dashboard</button>
//         </div>
//       </header>

//       <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

//         {/* severity card */}
//         <CustomCard className={`${palette.bg} ${palette.border} border-2 p-6 rounded-xl`}>
//           <div className="flex items-start gap-4">
//             <div className={`${palette.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xl font-bold">{palette.icon}</span>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold mb-2 capitalize">{severity} symptoms detected</h2>
//               <p className={`${palette.text}`}>
//                 {severity==='mild' && 'Your responses suggest mild symptoms that may be affecting you occasionally.'}
//                 {severity==='moderate' && 'Your responses suggest moderate symptoms that may be impacting your daily life.'}
//                 {severity==='severe' && 'Your responses suggest more severe symptoms that may need immediate support.'}
//               </p>
//             </div>
//           </div>
//         </CustomCard>

//         {/* detailed report */}
//         <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//           <h3 className="text-2xl font-semibold mb-6">Detailed Intake Report</h3>
//           <div className="grid md:grid-cols-2 gap-6">
//             <Column>
//               <Field label="Patient ID" value={report.patient_id}/>
//               <Field label="Date" value={new Date(report.date).toLocaleString()}/>
//               <Field label="Chief Complaint" value={report.chief_complaint}/>
//               <Field label="History of Present Illness" value={report.history_present_illness}/>
//               <Field label="Safety Assessment" value={report.safety_assessment}/>
//               <Field label="Psychiatric History" value={report.psychiatric_history}/>
//             </Column>
//             <Column>
//               <Field label="Medication History" value={report.medication_history}/>
//               <Field label="Medical History" value={report.medical_history}/>
//               <Field label="Substance Use" value={report.substance_use}/>
//               <Field label="Family History" value={report.family_history}/>
//               <Field label="Social History" value={report.social_history}/>
//               <Field label="Protective Factors" value={report.protective_factors}/>
//             </Column>
//           </div>

//           <h4 className="text-xl font-semibold mt-8 mb-3">Screeners</h4>
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead><tr className="border-b"><th className="py-2 text-left">Name</th><th className="py-2 text-left">Score</th><th className="py-2 text-left">Interpretation</th></tr></thead>
//               <tbody>{screenerRows}</tbody>
//             </table>
//           </div>

//           <div className="mt-6 space-y-4">
//             <Field label="Summary Impression" value={report.summary_impression}/>
//             <Field label="Next Steps" value={report.next_steps}/>
//             <Field label="Risk Level" value={report.risk_level}/>
//             <Field label="Disclaimer" value={report.disclaimer}/>
//           </div>
//         </CustomCard>

//         {/* safety banner */}
//         {severity==='severe' && (
//           <CustomCard className="bg-red-50 border-red-200 border-2 p-6 rounded-xl">
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                 <span className="text-white text-xl">🚨</span>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-red-800 mb-2">Important Safety Note</h3>
//                 <p className="text-red-700">If you ever feel unsafe, please call <b>911</b> or go to the nearest emergency room.</p>
//               </div>
//             </div>
//           </CustomCard>
//         )}

//         {/* next steps + CTA */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <Header icon="📋" title="Next Steps"/>
//             <p className="text-gray-700">
//               {severity==='mild' && 'A provider can confirm your results and suggest strategies to help you feel better.'}
//               {severity==='moderate' && 'A licensed provider can confirm these results and discuss treatment options with you.'}
//               {severity==='severe' && 'We recommend connecting with a licensed provider as soon as possible.'}
//             </p>
//           </CustomCard>

//           <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//             <Header icon="⚡" title="Take Action"/>
//             <div className="space-y-3">
//               <CustomButton variant="primary"
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
//                 onClick={()=>nav('/patient-signup')}>
//                 Request Appointment
//               </CustomButton>
//               <CustomButton variant="secondary"
//                 className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
//                 onClick={()=>nav('/resources')}>
//                 View Resources
//               </CustomButton>
//             </div>
//           </CustomCard>
//         </div>

//         {/* resources grid */}
//         <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
//           <Header icon="💡" title="Suggested Self-Resources"/>
//           <div className="grid md:grid-cols-3 gap-4">
//             {resources.map((r,i)=>(
//               <div key={i} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
//                 <div className="flex items-start gap-3">
//                   <span className="text-2xl">{r.icon}</span>
//                   <div>
//                     <h4 className="font-semibold">{r.title}</h4>
//                     <p className="text-sm text-gray-600">{r.description}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CustomCard>

//         {/* encouragement */}
//         <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6">
//           <div className="flex items-center justify-center gap-2 mb-3">
//             <span className="text-2xl">💙</span>
//             <h4 className="text-lg font-semibold text-gray-900">You've taken an important step</h4>
//           </div>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Thank you for sharing your experiences. This summary will help your provider
//             understand your needs better and provide more personalized care.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }



import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

type SeverityLevel = 'mild' | 'moderate' | 'severe';
interface Screener { name:string; score:number; interpretation?:string }

/* small helpers */
const Column = ({children}:{children:ReactNode})=> <div className="space-y-4">{children}</div>;
const Field  = ({label,value}:{label:string;value:any})=>(
  <div>
    <h5 className="font-semibold text-gray-800">{label}</h5>
    <p className="text-gray-700 whitespace-pre-line">{value ?? '—'}</p>
  </div>
);
const Header = ({icon,title}:{icon:string;title:string})=>(
  <div className="flex items-start gap-3 mb-4">
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-blue-600 text-lg">{icon}</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
  </div>
);

export default function PatientIntakeSummary(){
  const nav = useNavigate();
  const [report, setReport] = useState<any|null>(null);
  const [severity, setSeverity] = useState<SeverityLevel>('mild');

  useEffect(()=>{
    const raw = localStorage.getItem('intakeReport');
    if(!raw) return;
    try{
      const rpt = JSON.parse(raw);
      setReport(rpt);

      const phq: number  = rpt.screeners?.find((s:Screener)=>s.name==='PHQ-9')?.score ?? 0;
      const gad: number  = rpt.screeners?.find((s:Screener)=>s.name==='GAD-7')?.score ?? 0;
      const asrs: number = rpt.screeners?.find((s:Screener)=>s.name?.startsWith('ASRS'))?.score ?? 0;
      const worst = Math.max(phq, gad, asrs);

      if (worst >= 20) setSeverity('severe');
      else if (worst >= 10) setSeverity('moderate');
      else setSeverity('mild');
    }catch(e){
      console.error(e);
    }
  },[]);

  // PDF: dynamic loader with CDN fallback (no build changes needed)
  async function loadJsPDF(): Promise<any> {
    try {
      const mod: any = await import('jspdf');
      return mod.jsPDF || mod.default || (mod as any).jsPDF;
    } catch {
      return await new Promise((resolve, reject) => {
        const w:any = window as any;
        if (w.jspdf?.jsPDF) return resolve(w.jspdf.jsPDF);
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
        s.onload = () => resolve((window as any).jspdf.jsPDF);
        s.onerror = reject;
        document.body.appendChild(s);
      });
    }
  }

  async function handleDownloadPdf() {
    if (!report) return;
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });

      const margin = 48;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const maxWidth = pageW - margin * 2;
      const top = 64;
      const bottom = pageH - 64;
      let y = top;

      const setFont = (size:number, bold=false) => {
        doc.setFontSize(size);
        doc.setFont(undefined, bold ? 'bold' : 'normal');
      };

      const line = (txt:string|number|undefined|null) => {
        const s = (txt ?? '—') + '';
        const lines = doc.splitTextToSize(s, maxWidth);
        for (const L of lines) {
          if (y > bottom) { doc.addPage(); y = top; }
          doc.text(L, margin, y);
          y += 16;
        }
      };

      const section = (title:string, value:any) => {
        setFont(12, true);
        if (y > bottom) { doc.addPage(); y = top; }
        doc.text(title, margin, y);
        y += 18;
        setFont(11, false);
        line(value);
        y += 6;
      };

      // Header
      setFont(16, true);
      doc.text('PsychiatryNow – Intake Report', margin, y);
      setFont(10, false);
      const dateStr = report.date ? new Date(report.date).toLocaleString() : new Date().toLocaleString();
      const pid = report.patient_id || '—';
      const sev = severity.charAt(0).toUpperCase() + severity.slice(1);
      doc.text(`Date: ${dateStr}`, pageW - margin - doc.getTextWidth(`Date: ${dateStr}`), y);
      y += 22;

      // Meta
      setFont(11, false);
      line(`Patient ID: ${pid}`);
      line(`Severity: ${sev}`);
      y += 8;

      // Sections
      section('Chief Complaint', report.chief_complaint);
      section('History of Present Illness', report.history_present_illness);
      section('Safety Assessment', report.safety_assessment);
      section('Psychiatric History', report.psychiatric_history);
      section('Medication History', report.medication_history);
      section('Medical History', report.medical_history);
      section('Substance Use', report.substance_use);
      section('Family History', report.family_history);
      section('Social History', report.social_history);
      section('Protective Factors', report.protective_factors);

      // Screeners
      if (Array.isArray(report.screeners) && report.screeners.length) {
        setFont(12, true);
        if (y > bottom) { doc.addPage(); y = top; }
        doc.text('Screeners', margin, y);
        y += 18;
        setFont(11, false);
        for (const s of report.screeners as Screener[]) {
          const interp = s.interpretation ? ` (${s.interpretation})` : '';
          line(`• ${s.name ?? 'Screener'} — Score: ${s.score ?? '—'}${interp}`);
        }
        y += 6;
      }

      section('Summary Impression', report.summary_impression);
      section('Next Steps', report.next_steps);
      section('Risk Level', report.risk_level);
      section('Disclaimer', report.disclaimer);

      const fname = `Intake_Report_${(report.patient_id||'patient').toString().slice(0,24)}_${new Date(report.date||Date.now()).toISOString().slice(0,10)}.pdf`;
      doc.save(fname);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert('Unable to generate PDF. Please try again.');
    }
  }

  if (!report)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No summary available.
      </div>
    );

  const palette = {
    mild:    { bg:'bg-green-100',   border:'border-green-200',   icon:'✓', iconBg:'bg-green-500',  text:'text-green-800' },
    moderate:{ bg:'bg-amber-100',   border:'border-amber-200',   icon:'!', iconBg:'bg-amber-500',  text:'text-amber-800' },
    severe:  { bg:'bg-red-100',     border:'border-red-200',     icon:'⚠', iconBg:'bg-red-500',    text:'text-red-800' },
  }[severity];

  const resources = {
    mild: [
      {icon:'🧘',title:'Stress Management',description:'Simple techniques to manage daily stress'},
      {icon:'📝',title:'Journaling Prompts',description:'Guided writing exercises for reflection'},
      {icon:'😴',title:'Sleep Hygiene',description:'Tips for better rest and recovery'},
    ],
    moderate: [
      {icon:'🧠',title:'Mindfulness & Grounding',description:'Techniques to stay present and calm'},
      {icon:'📋',title:'CBT Worksheets',description:'Evidence-based cognitive exercises'},
      {icon:'💪',title:'Healthy Lifestyle',description:'Small changes that make a big difference'},
    ],
    severe: [
      {icon:'📞',title:'Crisis Hotline 988',description:'24/7 support when you need it most'},
      {icon:'🎯',title:'Grounding Techniques',description:'Immediate tools for overwhelming moments'},
      {icon:'👥',title:'Support Groups',description:'Local and online communities for connection'},
    ],
  }[severity];

  const screenerRows = report.screeners?.map((s:Screener,i:number)=>(
    <tr key={i} className="border-t">
      <td className="py-2">{s.name}</td>
      <td className="py-2">{s.score}</td>
      <td className="py-2">{s.interpretation ?? '—'}</td>
    </tr>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={()=>nav('/')} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
            PsychiatryNow
          </button>
          <button onClick={()=>nav('/patient-dashboard')}
                  className="text-gray-600 hover:text-gray-900 text-sm">
            Go to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* severity card */}
        <CustomCard className={`${palette.bg} ${palette.border} border-2 p-6 rounded-xl`}>
          <div className="flex items-start gap-4">
            <div className={`${palette.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{palette.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 capitalize">{severity} symptoms detected</h2>
              <p className={`${palette.text}`}>
                {severity==='mild' && 'Your responses suggest mild symptoms that may be affecting you occasionally.'}
                {severity==='moderate' && 'Your responses suggest moderate symptoms that may be impacting your daily life.'}
                {severity==='severe' && 'Your responses suggest more severe symptoms that may need immediate support.'}
              </p>
            </div>
          </div>
        </CustomCard>

        {/* detailed report */}
        <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Detailed Intake Report</h3>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Download as PDF
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Column>
              <Field label="Patient ID" value={report.patient_id}/>
              <Field label="Date" value={report.date ? new Date(report.date).toLocaleString() : new Date().toLocaleString()}/>
              <Field label="Chief Complaint" value={report.chief_complaint}/>
              <Field label="History of Present Illness" value={report.history_present_illness}/>
              <Field label="Safety Assessment" value={report.safety_assessment}/>
              <Field label="Psychiatric History" value={report.psychiatric_history}/>
            </Column>
            <Column>
              <Field label="Medication History" value={report.medication_history}/>
              <Field label="Medical History" value={report.medical_history}/>
              <Field label="Substance Use" value={report.substance_use}/>
              <Field label="Family History" value={report.family_history}/>
              <Field label="Social History" value={report.social_history}/>
              <Field label="Protective Factors" value={report.protective_factors}/>
            </Column>
          </div>

          <h4 className="text-xl font-semibold mt-8 mb-3">Screeners</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Interpretation</th>
                </tr>
              </thead>
              <tbody>{screenerRows}</tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Summary Impression" value={report.summary_impression}/>
            <Field label="Next Steps" value={report.next_steps}/>
            <Field label="Risk Level" value={report.risk_level}/>
            <Field label="Disclaimer" value={report.disclaimer}/>
          </div>
        </CustomCard>

        {/* safety banner */}
        {severity==='severe' && (
          <CustomCard className="bg-red-50 border-red-200 border-2 p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🚨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Important Safety Note</h3>
                <p className="text-red-700">
                  If you ever feel unsafe, please call <b>911</b> or go to the nearest emergency room.
                </p>
              </div>
            </div>
          </CustomCard>
        )}

        {/* next steps + CTA */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
            <Header icon="📋" title="Next Steps"/>
            <p className="text-gray-700">
              {severity==='mild' && 'A provider can confirm your results and suggest strategies to help you feel better.'}
              {severity==='moderate' && 'A licensed provider can confirm these results and discuss treatment options with you.'}
              {severity==='severe' && 'We recommend connecting with a licensed provider as soon as possible.'}
            </p>
          </CustomCard>

          <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
            <Header icon="⚡" title="Take Action"/>
            <div className="space-y-3">
              <CustomButton
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                onClick={()=>nav('/patient-signup')}
              >
                Request Appointment
              </CustomButton>
              <CustomButton
                variant="secondary"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
                onClick={()=>nav('/resources')}
              >
                View Resources
              </CustomButton>
            </div>
          </CustomCard>
        </div>

        {/* resources grid */}
        <CustomCard className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
          <Header icon="💡" title="Suggested Self-Resources"/>
          <div className="grid md:grid-cols-3 gap-4">
            {resources.map((r:any,i:number)=>(
              <div key={i} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <h4 className="font-semibold">{r.title}</h4>
                    <p className="text-sm text-gray-600">{r.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CustomCard>

        {/* encouragement */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">💙</span>
            <h4 className="text-lg font-semibold text-gray-900">You've taken an important step</h4>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Thank you for sharing your experiences. This summary will help your provider
            understand your needs better and provide more personalized care.
          </p>
        </div>
      </main>
      </div>
  );
}
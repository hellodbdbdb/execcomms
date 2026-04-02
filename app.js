/* Exec Comms — App Logic */
const { useState, useEffect, useRef, useCallback } = React;

const STORE="ec3d";const SSET="ec3s";
const DO={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4};
function ld(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch{return f;}}
function sv(k,v){localStorage.setItem(k,JSON.stringify(v));}
function sid(s){return`w${s.w}-${s.d}`;}
function gsd(data,s){return data[sid(s)]||{status:"todo",pf:null,notes:"",date:""};}

const TM={reading:{l:"Read",c:"var(--c-read)"},writing:{l:"Write",c:"var(--c-write)"},practice:{l:"Practice",c:"var(--c-prac)"},analysis:{l:"Analyze",c:"var(--c-anal)"}};

/* ═══════════════════════════════════════════════════════════════════════════
   FIREBASE — same project as Michelin app, separate collection
   ═══════════════════════════════════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBlcISl4wv6AMYE2RsdUTweRGv-ZcRCDsw",
  authDomain: "executive-comms.firebaseapp.com",
  projectId: "executive-comms",
  storageBucket: "executive-comms.firebasestorage.app",
  messagingSenderId: "661873899795",
  appId: "1:661873899795:web:406329259e229c3eaec2e6"
};

// Firebase compat SDK is loaded via script tags in index.html
const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
const fbAuth = firebase.auth();
const fbDb = firebase.firestore();

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES — injected as a style tag for the editorial design system
   ═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  --bg: #F0EDE6;
  --card: #FAF9F6;
  --text: #1A1A18;
  --soft: #6B6960;
  --muted: #A8A498;
  --rule: #D4D0C8;
  --accent: #1A1A18;
  --c-read: #3D5A80;
  --c-write: #2A6041;
  --c-prac: #8B3A3A;
  --c-anal: #7D6B3A;
  --c-red: #C23A3A;
  --c-red-bg: rgba(194,58,58,0.08);
  --c-green: #2A7A45;
  --c-green-bg: rgba(42,122,69,0.08);
  --serif: 'Playfair Display', 'Georgia', serif;
  --mono: 'IBM Plex Mono', 'Menlo', monospace;
  --nav-h: 56px;
  --fs: 15px;
}
:root[data-theme="dark"] {
  --bg: #131311;
  --card: #1C1C19;
  --text: #E8E6DF;
  --soft: #9B9889;
  --muted: #5C5A50;
  --rule: #2E2D28;
  --accent: #E8E6DF;
  --c-read: #7BA3C9;
  --c-write: #6BBF8A;
  --c-prac: #D47B7B;
  --c-anal: #C9B36B;
  --c-red: #E05555;
  --c-red-bg: rgba(224,85,85,0.1);
  --c-green: #5CC97A;
  --c-green-bg: rgba(92,201,122,0.1);
}
* { margin:0; padding:0; box-sizing:border-box; }
body { background:var(--bg); color:var(--text); font-family:var(--mono); font-size:var(--fs); -webkit-font-smoothing:antialiased; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════════════════ */
function Login({onGoogle,onDemo}) {
  const [busy,setBusy] = useState(false);
  async function google(){
    setBusy(true);
    try { await onGoogle(); } catch(e){ console.error(e); }
    setBusy(false);
  }
  return (
    <div style={{minHeight:"100dvh",background:"#F0EDE6",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,fontFamily:"var(--mono)"}}>
      <style>{CSS}</style>
      <div style={{marginBottom:48,textAlign:"center"}}>
        <h1 style={{fontFamily:"var(--serif)",fontSize:52,fontWeight:900,letterSpacing:"-0.04em",lineHeight:0.95,marginBottom:8,color:"#1A1A18"}}>Exec<br/>Comms</h1>
        <div style={{width:48,height:1,background:"#1A1A18",margin:"16px auto"}}/>
        <p style={{fontFamily:"var(--mono)",fontSize:11,color:"#6B6960",letterSpacing:"0.08em",textTransform:"uppercase"}}>10 Weeks · 50 Sessions</p>
      </div>
      <button onClick={google} disabled={busy} style={{width:"100%",maxWidth:300,padding:"14px 20px",borderRadius:0,background:"#1A1A18",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:12,fontWeight:500,color:"#F0EDE6",letterSpacing:"0.04em",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:busy?0.5:1}}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        {busy ? "Signing in…" : "Sign in with Google"}
      </button>
      <button onClick={onDemo} style={{width:"100%",maxWidth:300,padding:"14px 20px",borderRadius:0,background:"transparent",border:"1px solid #D4D0C8",cursor:"pointer",fontFamily:"var(--mono)",fontSize:12,color:"#6B6960",letterSpacing:"0.04em"}}>
        Demo — no account
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
function Tag({type}){const m=TM[type]||TM.writing;return <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",color:m.c,borderBottom:`1.5px solid ${m.c}`,paddingBottom:1}}>{m.l}</span>;}

function Rule(){return <div style={{height:1,background:"var(--rule)",width:"100%"}}/>;}

function Num({n,label,sub}){return(
  <div style={{textAlign:"center"}}>
    <div style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*2.2)",fontWeight:900,lineHeight:1,color:"var(--text)"}}>{n}</div>
    <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:4}}>{label}</div>
    {sub&&<div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--soft)",marginTop:2}}>{sub}</div>}
  </div>
);}

/* ═══════════════════════════════════════════════════════════════════════════
   CURRENT TAB — dedicated view for the active session
   ═══════════════════════════════════════════════════════════════════════════ */
function CurrentTab({data,setData}){
  const nextTodo = S.findIndex(s=>gsd(data,s).status==="todo");
  const [viewIdx, setViewIdx] = useState(nextTodo >= 0 ? nextTodo : 0);

  // Keep viewIdx in bounds
  const session = S[viewIdx];
  if (!session) return null;

  const sd = gsd(data, session);
  const phase = PHASES.find(p=>p.id===session.p);
  const isCompleted = sd.status === "done" || sd.status === "skipped";
  const nextTodoIdx = S.findIndex(s=>gsd(data,s).status==="todo");
  const allDone = nextTodoIdx === -1;

  function upd(f,v){const n={...data,[sid(session)]:{...sd,[f]:v}};setData(n);}

  function completeAndNext(){
    // If not yet marked, mark as done
    if(sd.status==="todo"){
      const n={...data,[sid(session)]:{...sd,status:"done"}};
      setData(n);
    }
    // Move to next todo
    const nxt = S.findIndex((s,i) => i > viewIdx && gsd(data,s).status==="todo");
    if(nxt>=0) setViewIdx(nxt);
    else {
      // Check if there's any todo at all
      const any = S.findIndex(s=>gsd(data,s).status==="todo");
      if(any>=0 && any !== viewIdx) setViewIdx(any);
    }
    window.scrollTo(0,0);
  }

  const canPrev = viewIdx > 0;
  const canNext = viewIdx < S.length - 1;

  return(
    <div style={{padding:"24px 20px 120px"}}>
      {/* Session number */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:20}}>
        <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Session {viewIdx+1} of 50</span>
        <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)"}}>Week {session.w} · {session.d} · {session.tm}</span>
      </div>
      <Rule/>

      {/* Phase */}
      <div style={{padding:"16px 0",borderBottom:"1px solid var(--rule)"}}>
        <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Phase {phase.id}</div>
        <div style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*1.1)",fontStyle:"italic",color:"var(--soft)",lineHeight:1.4}}>{phase.q}</div>
      </div>

      {/* Title with prev/next navigation */}
      <div style={{padding:"24px 0 20px"}}>
        <Tag type={session.tp}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
          <button onClick={()=>{if(canPrev){setViewIdx(viewIdx-1);window.scrollTo(0,0);}}} disabled={!canPrev} style={{
            background:"none",border:"1px solid var(--rule)",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",
            cursor:canPrev?"pointer":"default",opacity:canPrev?1:0.25,fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.9)",
            color:"var(--text)",borderRadius:2,flexShrink:0,
          }}>←</button>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*2)",fontWeight:900,lineHeight:1.15,flex:1,letterSpacing:"-0.02em",margin:0}}>{session.t}</h1>
          <button onClick={()=>{if(canNext){setViewIdx(viewIdx+1);window.scrollTo(0,0);}}} disabled={!canNext} style={{
            background:"none",border:"1px solid var(--rule)",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",
            cursor:canNext?"pointer":"default",opacity:canNext?1:0.25,fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.9)",
            color:"var(--text)",borderRadius:2,flexShrink:0,
          }}>→</button>
        </div>
      </div>
      <Rule/>

      {/* Already completed indicator */}
      {isCompleted && (
        <div style={{padding:"12px 0",borderBottom:"1px solid var(--rule)",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",letterSpacing:"0.08em",textTransform:"uppercase",color:sd.status==="done"?"var(--c-red)":"var(--muted)"}}>{sd.status==="done"?"✓ Completed":"— Skipped"}</span>
          {sd.date&&<span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)"}}>· {sd.date}</span>}
        </div>
      )}

      {/* Body */}
      <div style={{padding:"20px 0",fontSize:"calc(var(--fs)*0.9)",lineHeight:1.8,color:"var(--soft)",whiteSpace:"pre-wrap"}}>
        {session.b.split(/\*\*(.*?)\*\*/g).map((p,i)=>i%2===1?<strong key={i} style={{color:"var(--text)",fontWeight:500}}>{p}</strong>:<span key={i}>{p}</span>)}
      </div>

      {/* Upload */}
      {session.up&&<div style={{borderTop:"1px solid var(--rule)",borderBottom:"1px solid var(--rule)",padding:"14px 0",marginBottom:0}}>
        <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Upload </span>
        <span style={{fontSize:"calc(var(--fs)*0.85)",color:"var(--soft)"}}>{session.up}</span>
      </div>}

      {session.rs&&session.rs!=="—"&&<div style={{padding:"12px 0",borderBottom:"1px solid var(--rule)",fontSize:"calc(var(--fs)*0.75)",color:"var(--muted)"}}>Resource: {session.rs}</div>}

      {/* Tracking */}
      <div style={{paddingTop:28}}>
        <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Tracking</div>

        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Status</label>
          <div style={{display:"flex",gap:1}}>
            {[{v:"todo",l:"To do",ac:"var(--accent)",abg:"var(--accent)"},{v:"done",l:"Done",ac:"var(--c-red)",abg:"var(--c-red)"},{v:"skipped",l:"Skip",ac:"var(--muted)",abg:"var(--muted)"}].map((o,i)=>(
              <button key={o.v} onClick={()=>upd("status",o.v)} style={{
                flex:1,padding:"11px 0",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",cursor:"pointer",fontWeight:500,
                border:`1px solid ${sd.status===o.v?o.ac:"var(--rule)"}`,
                background:sd.status===o.v?o.abg:"transparent",
                color:sd.status===o.v?"var(--bg)":"var(--muted)",
                borderRadius:i===0?"2px 0 0 2px":i===2?"0 2px 2px 0":"0",
              }}>{o.l}</button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Positive First?</label>
          <div style={{display:"flex",gap:1}}>
            {[{v:"yes",l:"Yes",ac:"var(--c-green)",abg:"var(--c-green)"},{v:"no",l:"No",ac:"var(--c-red)",abg:"var(--c-red)"},{v:null,l:"N/A",ac:"var(--muted)",abg:"var(--muted)"}].map((o,i)=>(
              <button key={String(o.v)} onClick={()=>upd("pf",o.v)} style={{
                flex:1,padding:"11px 0",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",cursor:"pointer",fontWeight:500,
                border:`1px solid ${sd.pf===o.v?o.ac:"var(--rule)"}`,
                background:sd.pf===o.v?o.abg:"transparent",
                color:sd.pf===o.v?"var(--bg)":"var(--muted)",
                borderRadius:i===0?"2px 0 0 2px":i===2?"0 2px 2px 0":"0",
              }}>{o.l}</button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Date</label>
          <input type="date" value={sd.date||""} onChange={e=>upd("date",e.target.value)} style={{
            width:"100%",padding:"10px 12px",fontSize:"max(16px, calc(var(--fs)*0.8))",fontFamily:"var(--mono)",
            background:"transparent",border:"1px solid var(--rule)",color:"var(--text)",borderRadius:2,
          }}/>
        </div>

        <div>
          <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Notes</label>
          <textarea value={sd.notes||""} onChange={e=>upd("notes",e.target.value)} placeholder="Reflexionen, Takeaways…" rows={5} style={{
            width:"100%",padding:"12px",fontSize:"max(16px, calc(var(--fs)*0.8))",fontFamily:"var(--mono)",lineHeight:1.7,
            background:"transparent",border:"1px solid var(--rule)",color:"var(--text)",borderRadius:2,resize:"vertical",
          }}/>
        </div>
      </div>

      {/* Complete & Next button */}
      {!allDone && (
        <div style={{paddingTop:28}}>
          <Rule/>
          <button onClick={completeAndNext} style={{
            width:"100%",padding:"16px 0",marginTop:24,
            fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.8)",fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",
            background: sd.status==="done" ? "transparent" : "var(--c-red)",
            border: sd.status==="done" ? "1px solid var(--rule)" : "1px solid var(--c-red)",
            color: sd.status==="done" ? "var(--text)" : "var(--bg)",
            cursor:"pointer",borderRadius:2,transition:"all 0.15s",
          }}>
            {sd.status==="done" ? "Next Session →" : "Complete & Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function HomeTab({data}){
  const done=S.filter(s=>gsd(data,s).status==="done").length;
  const skip=S.filter(s=>gsd(data,s).status==="skipped").length;
  const pY=S.filter(s=>gsd(data,s).pf==="yes").length;
  const pN=S.filter(s=>gsd(data,s).pf==="no").length;
  const pT=pY+pN;
  let streak=0; for(const s of S){if(gsd(data,s).status==="done")streak++;else break;}
  const next=S.find(s=>gsd(data,s).status==="todo");
  const cw=next?next.w:10;
  const wd=S.filter(s=>s.w===cw&&gsd(data,s).status==="done").length;

  return(
    <div style={{padding:"24px 20px 120px"}}>
      <div style={{textAlign:"center",padding:"20px 0 32px"}}>
        <div style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*4.5)",fontWeight:900,lineHeight:1,color:"var(--text)"}}>{Math.round((done/50)*100)}</div>
        <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:4}}>Percent Complete</div>
        {/* thin bar */}
        <div style={{width:"100%",height:2,background:"var(--rule)",marginTop:20,borderRadius:1,overflow:"hidden"}}>
          <div style={{width:`${(done/50)*100}%`,height:"100%",background:"var(--accent)",transition:"width 0.5s ease"}}/>
        </div>
      </div>

      <Rule/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,borderBottom:"1px solid var(--rule)"}}>
        {[
          {n:done,l:"Done"},
          {n:50-done-skip,l:"Left"},
          {n:streak,l:"Streak"},
          {n:`${wd}/5`,l:`Wk ${cw}`},
        ].map((x,i)=>(
          <div key={i} style={{padding:"20px 0",textAlign:"center",borderRight:i<3?"1px solid var(--rule)":"none"}}>
            <Num n={x.n} label={x.l}/>
          </div>
        ))}
      </div>

      {pT>0&&<div style={{padding:"20px 0",borderBottom:"1px solid var(--rule)",textAlign:"center"}}>
        <Num n={`${Math.round((pY/pT)*100)}%`} label="Positive-First Rate" sub={`${pY} yes · ${pN} no`}/>
      </div>}

      {/* Phase list */}
      <div style={{paddingTop:24}}>
        <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>Phases</div>
        {PHASES.map(ph=>{
          const ps=S.filter(s=>s.p===ph.id);
          const pd=ps.filter(s=>gsd(data,s).status==="done").length;
          const pp=ps.length>0?Math.round((pd/ps.length)*100):0;
          const cur=next&&next.p===ph.id;
          return(
            <div key={ph.id} style={{display:"flex",alignItems:"baseline",gap:12,padding:"10px 0",borderBottom:"1px solid var(--rule)",opacity:pp===0&&!cur?0.35:1}}>
              <span style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*1.4)",fontWeight:900,minWidth:20,color:cur?"var(--text)":"var(--muted)"}}>{ph.id}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"calc(var(--fs)*0.85)",color:"var(--text)",fontWeight:500}}>{ph.title}</div>
                <div style={{fontSize:"calc(var(--fs)*0.7)",color:"var(--muted)",marginTop:2}}>Weeks {ph.weeks}</div>
              </div>
              <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.75)",color:pp===100?"var(--c-green)":"var(--muted)"}}>{pp}%</span>
            </div>
          );
        })}
      </div>

      {/* By type */}
      <div style={{paddingTop:24}}>
        <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>By Type</div>
        {Object.entries(TM).map(([type,meta])=>{
          const all=S.filter(s=>s.tp===type);const d=all.filter(s=>gsd(data,s).status==="done").length;
          return(
            <div key={type} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid var(--rule)"}}>
              <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.7)",color:meta.c,minWidth:54,fontWeight:500}}>{meta.l}</span>
              <div style={{flex:1,height:2,background:"var(--rule)",borderRadius:1,overflow:"hidden"}}>
                <div style={{width:`${all.length>0?(d/all.length)*100:0}%`,height:"100%",background:meta.c,transition:"width 0.4s"}}/>
              </div>
              <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.7)",color:"var(--muted)",minWidth:30,textAlign:"right"}}>{d}/{all.length}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSIONS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function SessionsTab({data,onSelect}){
  const weeks=[...new Set(S.map(s=>s.w))];
  return(
    <div style={{padding:"24px 20px 120px"}}>
      {PHASES.map(phase=>{
        const pw=weeks.filter(w=>S.find(s=>s.w===w&&s.p===phase.id));
        if(!pw.length) return null;
        return(
          <div key={phase.id} style={{marginBottom:32}}>
            <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",paddingBottom:10,borderBottom:"1px solid var(--rule)"}}>Phase {phase.id} — {phase.title}</div>
            {pw.map(w=>{
              const ss=S.filter(s=>s.w===w).sort((a,b)=>DO[a.d]-DO[b.d]);
              const d=ss.filter(s=>gsd(data,s).status==="done").length;
              return(
                <div key={w} style={{marginTop:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                    <span style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*1.15)",fontWeight:900}}>Week {w}</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.7)",color:"var(--muted)"}}>{d}/5</span>
                  </div>
                  {ss.map(s=>{
                    const sd=gsd(data,s);
                    return(
                      <button key={sid(s)} onClick={()=>onSelect(s)} style={{
                        display:"flex",width:"100%",alignItems:"baseline",gap:10,padding:"10px 0",
                        background:"none",border:"none",borderBottom:"1px solid var(--rule)",
                        cursor:"pointer",textAlign:"left",fontFamily:"var(--mono)",
                      }}>
                        <span style={{fontSize:"calc(var(--fs)*0.7)",color:"var(--muted)",minWidth:28,fontWeight:500}}>{s.d}</span>
                        <span style={{flex:1,fontSize:"calc(var(--fs)*0.85)",color:sd.status==="done"?"var(--muted)":"var(--text)",fontWeight:400,
                          textDecoration:sd.status==="done"?"line-through":"none",textDecorationColor:"var(--rule)",
                        }}>{s.t}</span>
                        <Tag type={s.tp}/>
                        {sd.status==="done"&&<span style={{color:"var(--c-red)",fontSize:"calc(var(--fs)*0.75)"}}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION DETAIL (from Sessions list)
   ═══════════════════════════════════════════════════════════════════════════ */
function Detail({session:s,data,setData,onBack}){
  const sd=gsd(data,s);
  function upd(f,v){const n={...data,[sid(s)]:{...sd,[f]:v}};setData(n);}
  return(
    <div style={{minHeight:"100dvh",background:"var(--bg)",color:"var(--text)"}}>
      <div style={{position:"sticky",top:0,zIndex:10,background:"var(--bg)",borderBottom:"1px solid var(--rule)",padding:"12px 20px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"var(--text)",fontSize:"calc(var(--fs)*0.8)",fontFamily:"var(--mono)",cursor:"pointer",padding:0,fontWeight:500}}>← Back</button>
      </div>
      <div style={{padding:"20px 20px 100px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
          <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",letterSpacing:"0.08em"}}>W{s.w} · {s.d}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)"}}>{s.tm}</span>
        </div>
        <Tag type={s.tp}/>
        <h1 style={{fontFamily:"var(--serif)",fontSize:"calc(var(--fs)*1.8)",fontWeight:900,lineHeight:1.2,margin:"12px 0 20px",letterSpacing:"-0.02em"}}>{s.t}</h1>
        <Rule/>
        <div style={{padding:"20px 0",fontSize:"calc(var(--fs)*0.85)",lineHeight:1.75,color:"var(--soft)",whiteSpace:"pre-wrap"}}>
          {s.b.split(/\*\*(.*?)\*\*/g).map((p,i)=>i%2===1?<strong key={i} style={{color:"var(--text)",fontWeight:500}}>{p}</strong>:<span key={i}>{p}</span>)}
        </div>
        {s.up&&<div style={{borderTop:"1px solid var(--rule)",padding:"12px 0"}}><span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Upload </span><span style={{fontSize:"calc(var(--fs)*0.8)",color:"var(--soft)"}}>{s.up}</span></div>}
        {s.rs&&s.rs!=="—"&&<div style={{padding:"10px 0",borderTop:"1px solid var(--rule)",fontSize:"calc(var(--fs)*0.7)",color:"var(--muted)"}}>Resource: {s.rs}</div>}

        <div style={{paddingTop:28,borderTop:"1px solid var(--rule)"}}>
          <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Tracking</div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Status</label>
            <div style={{display:"flex",gap:1}}>
              {[{v:"todo",l:"To do",ac:"var(--accent)",abg:"var(--accent)"},{v:"done",l:"Done",ac:"var(--c-red)",abg:"var(--c-red)"},{v:"skipped",l:"Skip",ac:"var(--muted)",abg:"var(--muted)"}].map((o,i)=>(
                <button key={o.v} onClick={()=>upd("status",o.v)} style={{flex:1,padding:"11px 0",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",cursor:"pointer",fontWeight:500,border:`1px solid ${sd.status===o.v?o.ac:"var(--rule)"}`,background:sd.status===o.v?o.abg:"transparent",color:sd.status===o.v?"var(--bg)":"var(--muted)",borderRadius:i===0?"2px 0 0 2px":i===2?"0 2px 2px 0":"0"}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Positive First?</label>
            <div style={{display:"flex",gap:1}}>
              {[{v:"yes",l:"Yes",ac:"var(--c-green)",abg:"var(--c-green)"},{v:"no",l:"No",ac:"var(--c-red)",abg:"var(--c-red)"},{v:null,l:"N/A",ac:"var(--muted)",abg:"var(--muted)"}].map((o,i)=>(
                <button key={String(o.v)} onClick={()=>upd("pf",o.v)} style={{flex:1,padding:"11px 0",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",cursor:"pointer",fontWeight:500,border:`1px solid ${sd.pf===o.v?o.ac:"var(--rule)"}`,background:sd.pf===o.v?o.abg:"transparent",color:sd.pf===o.v?"var(--bg)":"var(--muted)",borderRadius:i===0?"2px 0 0 2px":i===2?"0 2px 2px 0":"0"}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Date</label>
            <input type="date" value={sd.date||""} onChange={e=>upd("date",e.target.value)} style={{width:"100%",padding:"10px 12px",fontSize:"max(16px, calc(var(--fs)*0.8))",fontFamily:"var(--mono)",background:"transparent",border:"1px solid var(--rule)",color:"var(--text)",borderRadius:2}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)",marginBottom:8}}>Notes</label>
            <textarea value={sd.notes||""} onChange={e=>upd("notes",e.target.value)} placeholder="Reflexionen…" rows={5} style={{width:"100%",padding:"12px",fontSize:"max(16px, calc(var(--fs)*0.8))",fontFamily:"var(--mono)",lineHeight:1.7,background:"transparent",border:"1px solid var(--rule)",color:"var(--text)",borderRadius:2,resize:"vertical"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function SettingsTab({settings:st,setSt,data,setData,onOut,user,syncStatus}){
  function us(k,v){const n={...st,[k]:v};setSt(n);sv(SSET,n);}
  return(
    <div style={{padding:"24px 20px 120px"}}>
      {/* Account info */}
      {user && !user.demo && (
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Account</div>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--rule)"}}>
            {user.photoURL && <img src={user.photoURL} style={{width:28,height:28,borderRadius:"50%"}} referrerPolicy="no-referrer"/>}
            <div>
              <div style={{fontSize:"calc(var(--fs)*0.85)",color:"var(--text)",fontWeight:500}}>{user.displayName}</div>
              <div style={{fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)"}}>{user.email}</div>
            </div>
          </div>
          <div style={{fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",marginTop:8}}>
            Sync: {syncStatus==='ok'?'✓ Synced':syncStatus==='saving'?'Saving…':'✗ Error'}
            {!user.demo && <span> · Data syncs across all devices</span>}
          </div>
        </div>
      )}
      {user && user.demo && (
        <div style={{marginBottom:24,padding:"12px 0",borderBottom:"1px solid var(--rule)"}}>
          <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Demo Mode</div>
          <div style={{fontSize:"calc(var(--fs)*0.7)",color:"var(--soft)"}}>Data is saved locally only. Sign in with Google to sync across devices.</div>
        </div>
      )}

      <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:20}}>Appearance</div>

      <div style={{marginBottom:24}}>
        <label style={{display:"block",fontSize:"calc(var(--fs)*0.75)",color:"var(--soft)",marginBottom:10}}>Theme</label>
        <div style={{display:"flex",gap:1}}>
          {[{v:"light",l:"Light"},{v:"dark",l:"Dark"}].map((o,i)=>(
            <button key={o.v} onClick={()=>us("mode",o.v)} style={{flex:1,padding:"12px 0",fontSize:"calc(var(--fs)*0.8)",fontFamily:"var(--mono)",cursor:"pointer",fontWeight:500,border:`1px solid ${st.mode===o.v?"var(--accent)":"var(--rule)"}`,background:st.mode===o.v?"var(--accent)":"transparent",color:st.mode===o.v?"var(--bg)":"var(--muted)",borderRadius:i===0?"2px 0 0 2px":"0 2px 2px 0"}}>{o.l}</button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:28}}>
        <label style={{display:"block",fontSize:"calc(var(--fs)*0.75)",color:"var(--soft)",marginBottom:10}}>Font Size: {st.fontSize}px</label>
        <input type="range" min={12} max={20} value={st.fontSize} onChange={e=>us("fontSize",Number(e.target.value))} style={{width:"100%",accentColor:"var(--accent)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"calc(var(--fs)*0.65)",color:"var(--muted)",marginTop:4}}><span>12</span><span>20</span></div>
      </div>

      <Rule/>

      <div style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",margin:"24px 0 16px"}}>Data</div>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={()=>{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="exec-comms.json";a.click();}} style={{flex:1,padding:"12px",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",fontWeight:500,background:"transparent",border:"1px solid var(--rule)",color:"var(--text)",cursor:"pointer",borderRadius:2}}>Export</button>
        <label style={{flex:1,padding:"12px",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",fontWeight:500,textAlign:"center",background:"transparent",border:"1px solid var(--rule)",color:"var(--soft)",cursor:"pointer",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
          Import
          <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);setData(d);}catch{alert("Invalid");}};r.readAsText(f);}}/>
        </label>
      </div>
      <button onClick={()=>{if(confirm("Alle Daten löschen?")){setData({});}}} style={{width:"100%",padding:"12px",fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",fontWeight:500,background:"transparent",border:"1px solid var(--c-prac)",color:"var(--c-prac)",cursor:"pointer",borderRadius:2}}>Reset</button>

      <Rule style={{marginTop:24}}/>
      <button onClick={onOut} style={{width:"100%",padding:"12px",marginTop:24,fontSize:"calc(var(--fs)*0.75)",fontFamily:"var(--mono)",fontWeight:500,background:"transparent",border:"1px solid var(--rule)",color:"var(--muted)",cursor:"pointer",borderRadius:2}}>Sign Out</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════════════════ */
function Nav({tab,set}){
  const items=[
    {id:"home",l:"Home"},
    {id:"current",l:"Current"},
    {id:"sessions",l:"Sessions"},
    {id:"settings",l:"Settings"},
  ];
  return(
    <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"var(--bg)",borderTop:"1px solid var(--rule)",display:"flex",justifyContent:"center",paddingBottom:"env(safe-area-inset-bottom)"}}>
      <div style={{display:"flex",maxWidth:480,width:"100%"}}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>set(it.id)} style={{
            flex:1,padding:"12px 0 10px",background:"none",border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.6)",fontWeight:500,
            letterSpacing:"0.06em",textTransform:"uppercase",
            color:tab===it.id?"var(--text)":"var(--muted)",
            borderTop:tab===it.id?"2px solid var(--accent)":"2px solid transparent",
            transition:"all 0.15s",
          }}>{it.l}</button>
        ))}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════════ */
function App(){
  const [user,setUser]=useState(null);       // Firebase user or {demo:true}
  const [loading,setLoading]=useState(true);  // waiting for auth check
  const [data,setData]=useState(()=>ld(STORE,{}));
  const [st,setSt]=useState(()=>ld(SSET,{mode:"light",fontSize:15}));
  const [tab,setTab]=useState("current");
  const [sel,setSel]=useState(null);
  const [syncStatus,setSyncStatus]=useState("ok"); // ok | saving | error
  const saveTimer=useRef(null);
  const unsubSnap=useRef(null);
  const notesActive=useRef(false);

  // --- Firestore doc ref ---
  function userDocRef(){
    return fbDb.collection("execcomms-users").doc(user.uid);
  }

  // --- Save to Firestore (debounced) ---
  const saveToFirestore = useCallback(async (d) => {
    if (!user || user.demo) { console.log('[SYNC] skip: no user or demo'); return; }
    console.log('[SYNC] saving to Firestore…', user.uid);
    setSyncStatus('saving');
    try {
      await userDocRef().set({
        sessionData: d,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      console.log('[SYNC] saved OK');
      setSyncStatus('ok');
    } catch(e) {
      console.error('[SYNC] save FAILED:', e);
      setSyncStatus('error');
    }
  }, [user]);

  function persistData(d) {
    setData(d);
    console.log('[SYNC] persistData called, user:', user ? (user.demo ? 'demo' : user.uid) : 'null');
    if (user && user.demo) {
      sv(STORE, d);
    } else if (user) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveToFirestore(d), 800);
    }
  }

  // --- Listen to Firestore (real-time sync) ---
  function listenToFirestore() {
    if (unsubSnap.current) unsubSnap.current();
    console.log('[SYNC] listening to Firestore for', user.uid);
    unsubSnap.current = userDocRef().onSnapshot((snap) => {
      console.log('[SYNC] snapshot received, exists:', snap.exists);
      if (snap.exists) {
        const d = snap.data();
        const newData = d.sessionData || {};
        setData(newData);
        setSyncStatus('ok');
      }
    }, (err) => {
      console.error('[SYNC] snapshot error:', err);
      setSyncStatus('error');
    });
  }

  // --- Boot: auth listener ---
  useEffect(() => {
    const unsub = fbAuth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        if (unsubSnap.current) unsubSnap.current();
      }
    });
    return () => { unsub(); if (unsubSnap.current) unsubSnap.current(); };
  }, []);

  // --- Start Firestore listener when user logs in ---
  useEffect(() => {
    if (user && !user.demo) {
      listenToFirestore();
    }
  }, [user]);

  // --- Google sign-in ---
  async function handleGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await fbAuth.signInWithPopup(provider);
    } catch(e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        await fbAuth.signInWithRedirect(provider);
      } else { throw e; }
    }
  }

  // --- Demo mode ---
  function handleDemo() {
    const saved = ld(STORE, {});
    setUser({ demo: true, uid: 'demo', displayName: 'Demo' });
    setData(saved);
    setLoading(false);
  }

  // --- Sign out ---
  function handleSignOut() {
    if (unsubSnap.current) unsubSnap.current();
    if (user && !user.demo) {
      fbAuth.signOut();
    }
    setUser(null);
    setData({});
    setSyncStatus('ok');
  }

  // --- Loading screen ---
  if(loading) return(
    <div style={{minHeight:"100dvh",background:"#F0EDE6",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{fontFamily:"var(--mono)",fontSize:12,color:"#6B6960",letterSpacing:"0.08em",textTransform:"uppercase"}}>Loading…</div>
    </div>
  );

  // --- Login screen ---
  if(!user) return <Login onGoogle={handleGoogle} onDemo={handleDemo}/>;

  const theme=st.mode||"light";

  if(sel) return(
    <div data-theme={theme}>
      <style>{CSS}</style>
      <div style={{background:"var(--bg)",color:"var(--text)",fontFamily:"var(--mono)",maxWidth:480,margin:"0 auto","--fs":`${st.fontSize}px`}}>
        <Detail session={sel} data={data} setData={persistData} onBack={()=>setSel(null)}/>
      </div>
    </div>
  );

  const titles={home:"Exec Comms",current:"Current Session",sessions:"All Sessions",settings:"Settings"};

  return(
    <div data-theme={theme} style={{"--fs":`${st.fontSize}px`}}>
      <style>{CSS}</style>
      <div style={{minHeight:"100dvh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--mono)",maxWidth:480,margin:"0 auto"}}>
        <div style={{padding:"16px 20px 12px",borderBottom:"1px solid var(--rule)",position:"sticky",top:0,zIndex:50,background:"var(--bg)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h1 style={{fontFamily:tab==="home"?"var(--serif)":"var(--mono)",fontSize:tab==="home"?"calc(var(--fs)*1.8)":"calc(var(--fs)*0.7)",fontWeight:tab==="home"?900:500,letterSpacing:tab==="home"?"-0.03em":"0.1em",textTransform:tab==="home"?"none":"uppercase",color:"var(--text)",margin:0}}>{titles[tab]}</h1>
          {!user.demo && <span style={{fontFamily:"var(--mono)",fontSize:"calc(var(--fs)*0.55)",letterSpacing:"0.06em",textTransform:"uppercase",color:syncStatus==='saving'?"var(--muted)":syncStatus==='error'?"var(--c-red)":"var(--muted)",opacity:syncStatus==='ok'?0.4:1,transition:"opacity 0.3s"}}>{syncStatus==='ok'?'Synced':syncStatus==='saving'?'Saving…':'Error!'}</span>}
        </div>
        {tab==="home"&&<HomeTab data={data}/>}
        {tab==="current"&&<CurrentTab data={data} setData={persistData}/>}
        {tab==="sessions"&&<SessionsTab data={data} onSelect={setSel}/>}
        {tab==="settings"&&<SettingsTab settings={st} setSt={setSt} data={data} setData={persistData} onOut={handleSignOut} user={user} syncStatus={syncStatus}/>}
        <Nav tab={tab} set={setTab}/>
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

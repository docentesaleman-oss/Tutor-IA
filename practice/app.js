const state = { Vlink: "", language: "en", history: [] };
const messages = document.getElementById("messages");
const input = document.getElementById("message");
const status = document.getElementById("status");
const suggestions = document.getElementById("suggestions");

function storageKey() { return `practice_history_${btoa(unescape(encodeURIComponent(state.Vlink))).slice(0, 80)}`; }
function showMessage(role, text) { const item=document.createElement("article"); item.className=`bubble ${role}`; item.innerHTML=`<span class="speaker">${role === "student" ? "You" : "Tutor"}</span><span></span>`; item.lastChild.textContent=text; messages.append(item); item.scrollIntoView({block:"nearest",behavior:"smooth"}); }
function save() { localStorage.setItem(storageKey(), JSON.stringify({ language: state.language, history: state.history })); }
function add(role,text) { state.history.push({role,text}); save(); showMessage(role,text); }
function setSuggestions(items=[]) { suggestions.innerHTML=""; items.forEach(text=>{const button=document.createElement("button");button.type="button";button.textContent=text;button.onclick=()=>{input.value=text;input.focus();};suggestions.append(button);}); }

async function loadPractice(vlink) {
  state.Vlink = String(vlink || "").trim();
  if (!state.Vlink) { document.getElementById("title").textContent="Practice link missing"; status.textContent="Storyline must send the variable Vlink before this practice can begin."; return; }
  const stored=JSON.parse(localStorage.getItem(storageKey())||"{}"); state.language=stored.language||"en"; state.history=Array.isArray(stored.history)?stored.history:[];
  const response=await fetch("/practice/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({Vlink:state.Vlink})}); const data=await response.json();
  if(!response.ok) throw new Error(data.error||"Unable to load practice.");
  document.getElementById("title").textContent=data.title; setSuggestions(data.suggestions);
  if(state.history.length){state.history.forEach(item=>showMessage(item.role,item.text));}else{add("tutor",data.opening);}
}

async function sendMessage(text) { const message=String(text||input.value).trim(); if(!message||!state.Vlink)return; add("student",message); input.value=""; status.textContent="Thinking…"; try { const response=await fetch("/practice/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({Vlink:state.Vlink,message,language:state.language,history:state.history.slice(-8)})}); const data=await response.json(); if(!response.ok)throw new Error(data.error||"Unable to answer."); state.language=data.language||state.language; add("tutor",data.reply); status.textContent=""; } catch(error){status.textContent=error.message;} }
document.getElementById("composer").addEventListener("submit",event=>{event.preventDefault();sendMessage();});
document.getElementById("help").onclick=()=>document.getElementById("help-dialog").showModal(); document.getElementById("close-help").onclick=()=>document.getElementById("help-dialog").close();

const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(Recognition){const recognition=new Recognition();recognition.lang="en-US";recognition.onresult=e=>{input.value=e.results[0][0].transcript;status.textContent="Your message is ready to send.";};recognition.onerror=()=>status.textContent="I could not hear that. Please try again or write your answer.";document.getElementById("microphone").onclick=()=>{recognition.lang=state.language==="es"?"es-ES":"en-US";recognition.start();status.textContent="Listening…";};}else document.getElementById("microphone").hidden=true;

window.recibirDatosStoryline = datos => loadPractice(datos?.Vlink || datos?.vlink);
window.cargarVlink = vlink => loadPractice(vlink);
window.addEventListener("message",event=>{if(event.data?.type==="practice-vlink")loadPractice(event.data.Vlink);});
window.addEventListener("DOMContentLoaded",()=>{const vlink=new URLSearchParams(location.search).get("Vlink");if(vlink)loadPractice(vlink);});

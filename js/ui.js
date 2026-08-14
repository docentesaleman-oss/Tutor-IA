function addMessage(text,type){

const div=document.createElement("div");

div.className="message "+type;

div.innerHTML=text;

document
.getElementById("messages")
.appendChild(div);

div.scrollIntoView();

}
const PROFILES = [
  {id:1, name:"Maya", age:27, bio:"Product designer, dog mom, and weekend hiker.", interests:["Design","Hiking"], image:"https://i.pravatar.cc/600?img=5", mutual:true},
  {id:2, name:"Leo", age:30, bio:"Software engineer by day, amateur chef by night.", interests:["Cooking","Tech"], image:"https://i.pravatar.cc/600?img=12", mutual:false},
  {id:3, name:"Aisha", age:26, bio:"Photographer chasing golden hour.", interests:["Photography","Art"], image:"https://i.pravatar.cc/600?img=9", mutual:true},
  {id:4, name:"Noah", age:29, bio:"Gym in the morning, live music at night.", interests:["Fitness","Music"], image:"https://i.pravatar.cc/600?img=11", mutual:false}
];

let state = {index:0, matches:[], chats:{}};
const cardStack = document.getElementById("cardStack");
const empty = document.getElementById("empty");
const actions = document.getElementById("actions");
const matchCount = document.getElementById("matchCount");
const matchModal = document.getElementById("matchModal");
const chatPanel = document.getElementById("chatPanel");
const chatName = document.getElementById("chatName");
const messages = document.getElementById("messages");
let activeChatId = null;

// تھیم تبدیل کرنے کا فنکشن
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const btn = document.getElementById("themeToggle");
  if(document.body.classList.contains("light-mode")) {
    btn.textContent = "☀️"; // سورج کا آئیکن
  } else {
    btn.textContent = "🌙"; // چاند کا آئیکن
  }
});

function render(){
  cardStack.querySelectorAll(".card").forEach(el => el.remove());
  const p = PROFILES[state.index];
  const next = PROFILES[state.index + 1];
  
  empty.classList.toggle("show", !p);
  actions.style.visibility = p ? "visible" : "hidden";
  matchCount.textContent = `${state.matches.length} matches`;

  if(!p) return;
  if(next){
    const behind = document.createElement("div");
    behind.className = "card behind";
    behind.innerHTML = cardInner(next);
    cardStack.appendChild(behind);
  }
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = cardInner(p);
  cardStack.appendChild(card);

  setupSwipe(card);
}

function cardInner(p){
  return `
    <div class="photo">
      <div class="badge">ACTIVE NOW</div>
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div class="info">
      <div class="nameRow"><h2>${p.name}</h2><span class="age">${p.age}</span></div>
      <p class="bio">${p.bio}</p>
      <div class="tags">${p.interests.map(i => `<span class="tag">${i}</span>`).join("")}</div>
    </div>
  `;
}

function setupSwipe(card) {
  let startX = 0, startY = 0;
  
  card.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    card.style.transition = "none";
  }, {passive: true});

  card.addEventListener("touchmove", (e) => {
    let deltaX = e.touches[0].clientX - startX;
    let deltaY = e.touches[0].clientY - startY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 15}deg)`;
    }
  }, {passive: true});

  card.addEventListener("touchend", (e) => {
    let deltaX = e.changedTouches[0].clientX - startX;
    card.style.transition = "transform 0.3s ease";
    
    if (deltaX > 80) {
      card.style.transform = `translateX(1000px) rotate(30deg)`;
      setTimeout(() => like(), 200);
    } else if (deltaX < -80) {
      card.style.transform = `translateX(-1000px) rotate(-30deg)`;
      setTimeout(() => pass(), 200);
    } else {
      card.style.transform = `translateX(0) rotate(0deg)`;
    }
  });
}

function like(){
  const p = PROFILES[state.index];
  if(!p) return;
  if(p.mutual && !state.matches.includes(p.id)){
    state.matches.push(p.id);
    if(!state.chats[p.id]) state.chats[p.id] = [{from:"them", text:`Hey! I’m ${p.name} 👋`}];
    document.getElementById("matchText").textContent = `You and ${p.name} liked each other.`;
    matchModal.classList.add("show");
    matchModal.dataset.profileId = p.id;
  }
  state.index++;
  render();
}

function pass(){ state.index++; render(); }

document.getElementById("likeBtn").onclick = like;
document.getElementById("passBtn").onclick = pass;
document.getElementById("matchCloseBtn").onclick = () => matchModal.classList.remove("show");

document.getElementById("matchChatBtn").onclick = () => {
  const id = Number(matchModal.dataset.profileId);
  matchModal.classList.remove("show");
  openChat(id);
};

function openChat(id){
  activeChatId = id;
  const p = PROFILES.find(x => x.id === id);
  chatName.textContent = p.name;
  chatPanel.classList.add("open");
  renderMessages();
}

function renderMessages(){
  messages.innerHTML = "";
  (state.chats[activeChatId] || []).forEach(m => {
    const div = document.createElement("div");
    div.className = "msg" + (m.from === "me" ? " me" : "");
    div.textContent = m.text;
    messages.appendChild(div);
  });
  messages.scrollTop = messages.scrollHeight;
}

document.getElementById("chatClose").onclick = () => chatPanel.classList.remove("open");
document.getElementById("chatForm").onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  if(!input.value.trim()) return;
  state.chats[activeChatId].push({from:"me", text:input.value});
  input.value = "";
  renderMessages();
  setTimeout(() => {
    state.chats[activeChatId].push({from:"them", text:"That's really cool! 😊"});
    renderMessages();
  }, 1000);
};

function resetDemo(){ state = {index:0, matches:[], chats:{}}; render(); }
render();

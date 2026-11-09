import './style.css';

const people = [
  { id: 'nova', name: 'Nova', tag: '@nova', avatar: 'N', color: 'violet', status: 'Online', preview: 'That sounds awesome ✨', time: '9:41' },
  { id: 'kai', name: 'Kai', tag: '@kai', avatar: 'K', color: 'blue', status: 'Online', preview: 'Send me the link!', time: '9:32' },
  { id: 'mia', name: 'Mia', tag: '@mia', avatar: 'M', color: 'pink', status: 'Away', preview: 'Haha 😂', time: 'Yesterday' },
  { id: 'leo', name: 'Leo', tag: '@leo', avatar: 'L', color: 'orange', status: 'Offline', preview: 'See you later', time: 'Yesterday' }
];

const starter = {
  nova: [
    { from: 'them', text: 'Hey! Welcome to MaceChat 👋', time: '9:35' },
    { from: 'me', text: 'This app looks so cool!', time: '9:37' },
    { from: 'them', text: 'That sounds awesome ✨', time: '9:41' }
  ],
  kai: [{ from: 'them', text: 'Send me the link!', time: '9:32' }],
  mia: [{ from: 'them', text: 'Haha 😂', time: 'Yesterday' }],
  leo: [{ from: 'them', text: 'See you later', time: 'Yesterday' }]
};

let active = 'nova';
let messages = JSON.parse(localStorage.getItem('macechat-messages') || 'null') || starter;
let filter = 'All';

const $ = (s) => document.querySelector(s);
const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function render() {
  const person = people.find(p => p.id === active);
  const visible = people.filter(p => (filter === 'All' || (filter === 'Online' ? p.status === 'Online' : p.status !== 'Online')));
  $('#app').innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">m</div><span>Mace<span class="brand-light">Chat</span></span><button class="icon-btn mobile-only" id="close-menu">×</button></div>
        <div class="profile-card"><div class="avatar me-avatar">M</div><div class="profile-copy"><b>My profile</b><small>Ready to chat</small></div><span class="online-dot"></span></div>
        <button class="new-chat" id="new-chat"><span>＋</span> New message</button>
        <div class="side-label">MESSAGES <span>⌄</span></div>
        <div class="filters">
          <button class="${filter === 'All' ? 'selected' : ''}" data-filter="All">All</button>
          <button class="${filter === 'Online' ? 'selected' : ''}" data-filter="Online">Online</button>
          <button class="${filter === 'Away' ? 'selected' : ''}" data-filter="Away">Away</button>
        </div>
        <div class="people-list">
          ${visible.map(p => `<button class="person ${p.id === active ? 'active' : ''}" data-person="${p.id}">
            <div class="avatar ${p.color}">${p.avatar}<i class="${p.status === 'Online' ? 'online-dot' : 'status-dot'}"></i></div>
            <div class="person-copy"><b>${p.name}</b><small>${safe(p.preview)}</small></div><time>${p.time}</time>
          </button>`).join('')}
        </div>
        <div class="sidebar-bottom"><div class="mini-help">✦ <span><b>Your space, your vibe</b><small>Make every chat yours.</small></span></div><button class="settings" id="settings">⚙ Settings</button></div>
      </aside>
      <main class="chat">
        <header class="topbar"><button class="icon-btn mobile-only" id="open-menu">☰</button><div class="chat-person"><div class="avatar small ${person.color}">${person.avatar}<i class="${person.status === 'Online' ? 'online-dot' : 'status-dot'}"></i></div><div><b>${person.name}</b><small><span class="${person.status === 'Online' ? 'green' : ''}">●</span> ${person.status}</small></div></div><div class="top-actions"><button class="icon-btn" title="Search" id="search">⌕</button><button class="icon-btn" title="More" id="more">•••</button></div></header>
        <section class="messages" id="messages">
          <div class="day-pill">TODAY</div>
          ${(messages[active] || []).map(m => `<div class="message-row ${m.from === 'me' ? 'mine' : ''}">${m.from === 'them' ? `<div class="avatar tiny ${person.color}">${person.avatar}</div>` : ''}<div class="bubble-wrap"><div class="bubble">${safe(m.text)}</div><time>${m.time}</time></div></div>`).join('')}
          <div id="bottom"></div>
        </section>
        <div class="composer-area"><div class="composer"><button class="tool-btn" id="emoji" title="Emoji">☺</button><input id="message-input" placeholder="Message ${person.name}..." autocomplete="off" /><button class="tool-btn attach" id="attach" title="Attach">＋</button><button class="send" id="send" aria-label="Send message">➤</button></div><div class="hint">Press <kbd>Enter</kbd> to send <span>✦ Keep it kind, keep it fun</span></div></div>
      </main>
      <aside class="right-panel"><div class="right-head">YOUR SPACE <span>✦</span></div><div class="profile-hero"><div class="hero-orbit"></div><div class="hero-avatar ${person.color}">${person.avatar}</div><h2>${person.name}</h2><p>${person.tag}</p><span class="status-chip">● ${person.status}</span><button id="profile-btn">View profile</button></div><div class="info-block"><h3>Quick actions</h3><button class="quick-action" id="clear-chat"><span>⌫</span> Clear conversation <b>›</b></button><button class="quick-action" id="change-theme"><span>◐</span> Switch appearance <b>›</b></button></div><div class="tip-card"><div>💡</div><b>Little reminder</b><p>Good conversations start with a simple hello.</p></div><div class="right-footer">MACECHAT <span>•</span> MADE TO CONNECT</div></aside>
    </div>`;
  $('#bottom')?.scrollIntoView({block:'end'});
  bind();
}

function bind() {
  document.querySelectorAll('[data-person]').forEach(b => b.onclick = () => { active = b.dataset.person; render(); });
  document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { filter = b.dataset.filter; render(); });
  $('#send').onclick = send;
  $('#message-input').onkeydown = e => { if (e.key === 'Enter') send(); };
  $('#emoji').onclick = () => { const i = $('#message-input'); i.value += ' 😊'; i.focus(); };
  $('#new-chat').onclick = () => { const name = prompt('Who would you like to add?'); if (!name?.trim()) return; const id = 'friend-' + Date.now(); people.unshift({id,name:name.trim(),tag:'@friend',avatar:name.trim()[0].toUpperCase(),color:'blue',status:'Online',preview:'Say hello!',time:'Now'}); messages[id]=[]; active=id; render(); };
  $('#clear-chat').onclick = () => { if (confirm('Clear this conversation on this device?')) { messages[active]=[]; persist(); render(); } };
  $('#change-theme').onclick = () => document.body.classList.toggle('light');
  $('#settings').onclick = () => alert('Settings are coming soon!');
  $('#profile-btn').onclick = () => alert('Profile details for ' + personName() + ' — more profile options are coming soon!');
  $('#search').onclick = () => { const q = prompt('Search in this conversation:'); if (q) { const found = (messages[active] || []).filter(m => m.text.toLowerCase().includes(q.toLowerCase())); alert(found.length ? found.map(m=>m.text).join('\n') : 'No matching messages found.'); } };
  $('#more').onclick = () => alert('More chat options are coming soon!');
  $('#attach').onclick = () => alert('File sharing is not enabled in this starter version yet.');
  $('#open-menu')?.addEventListener('click', () => $('.sidebar').classList.add('show'));
  $('#close-menu')?.addEventListener('click', () => $('.sidebar').classList.remove('show'));
}
function personName(){ return people.find(p=>p.id===active)?.name || 'Friend'; }
function persist(){ localStorage.setItem('macechat-messages', JSON.stringify(messages)); }
function send() {
  const input = $('#message-input'); const text = input.value.trim(); if (!text) return;
  messages[active] ||= []; messages[active].push({from:'me',text,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
  const p = people.find(p=>p.id===active); if(p){p.preview=text;p.time='Now';}
  persist(); render();
}
render();
const SUPABASE_URL = 'https://ddqiiybuaozsjlrnckfz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rzftsvyC9ahQTXW-Pq4BsA_EOTSY5kP';

const AppState = {
    today: new Date().toDateString(),
    streak: parseInt(localStorage.getItem("streak")) || 0,
    completedToday: false,
    currentMode: [], currentModeName: '', currentIndex: 0, currentCount: 0, xp: 0, combo: 0, halfwayShown: false,
    freeCounter: 0,
    kahfIndex: parseInt(localStorage.getItem("kahfIndex") || "0"),
    myGroupCode: localStorage.getItem("myGroupCode") || null,
    myName: localStorage.getItem("myName") || null,
    myUserId: localStorage.getItem("myUserId") || ('u' + Math.random().toString(36).substr(2,8)),
    notifEnabled: localStorage.getItem("notifEnabled") === "true",
    notifInterval: null,
    currentQuote: quotes[Math.floor(Math.random() * quotes.length)],
    shareContext: 'quote'
};

AppState.completedToday = localStorage.getItem("completedToday") === AppState.today;
localStorage.setItem("myUserId", AppState.myUserId);

const DOM = {
    sadaqaScroll: document.getElementById("sadaqaScroll"), 
    duaGrid: document.getElementById("duaGrid"),
    
    // 👈 السطر ده اللي كان ناقص وموقف الأذكار والأدعية!
    card: document.getElementById("card"), 
    
    sections: ['card', 'tasbeehArea', 'kahfArea', 'groupArea', 'finish'].map(id => document.getElementById(id)),
    quote: document.getElementById("quote"), 
    streakBadge: document.getElementById("streak"), 
    streakWarning: document.getElementById("streakWarning"),
    speech: document.getElementById("speech"), 
    inlineSpeech: document.getElementById("inlineSpeech"),
    xp: document.getElementById("xp"), 
    combo: document.getElementById("combo"),
    zekrTitle: document.getElementById("zekrTitle"), 
    zekrText: document.getElementById("zekrText"), 
    zekrFadl: document.getElementById("zekrFadl"),
    repeat: document.getElementById("repeat"), 
    counter: document.getElementById("counter"), 
    progress: document.getElementById("progress"),
    btnMorning: document.getElementById("btnMorning"), 
    btnEvening: document.getElementById("btnEvening"), 
    btnQuick: document.getElementById("btnQuick"),
    btnTasbeehMode: document.getElementById("btnTasbeehMode"), 
    btnKahfMode: document.getElementById("btnKahfMode"), 
    btnGroupMode: document.getElementById("btnGroupMode"),
    btnCountZekr: document.getElementById("btnCountZekr"), 
    btnBacks: document.querySelectorAll('.btn-close-section'),
    shareModal: document.getElementById("shareModal"), 
    celebOverlay: document.getElementById("celebOverlay"), 
    celebTitle: document.getElementById("celebTitle"), 
    celebMsg: document.getElementById("celebMsg")
};

function renderDynamicLists() {
    let sadaqaHtml = '';
    sadaqaList.forEach(p => { sadaqaHtml += `<div class="sadaqa-card"><div class="icon">🕊️</div><div class="name">${p.name}</div><div class="role">${p.role}</div></div>`; });
    DOM.sadaqaScroll.innerHTML = sadaqaHtml;

    let duaHtml = '';
    duaList.forEach(d => { duaHtml += `<div class="dua-card" data-duatype="${d.id}"><div class="dua-name">${d.name}</div></div>`; });
    DOM.duaGrid.innerHTML = duaHtml;

    document.querySelectorAll('.dua-card').forEach(c => c.addEventListener('click', (e) => openDua(e.currentTarget.getAttribute('data-duatype'))));
}

function bindEvents() {
    DOM.btnMorning.addEventListener("click", () => startMode('morning'));
    DOM.btnEvening.addEventListener("click", () => startMode('evening'));
    DOM.btnQuick.addEventListener("click", () => startMode('quick'));
    DOM.btnTasbeehMode.addEventListener("click", openTasbeeh);
    DOM.btnKahfMode.addEventListener("click", openKahf);
    DOM.btnGroupMode.addEventListener("click", openGroup);
    DOM.btnCountZekr.addEventListener("click", countZekr);
    DOM.btnBacks.forEach(btn => btn.addEventListener("click", closeSection));

    document.getElementById("btnCloseShare").addEventListener("click", closeShareModal);
    document.getElementById("btnCloseCelebration").addEventListener("click", closeCelebration);
    
    document.getElementById("quoteBox").addEventListener("click", () => openShareModal('quote'));
    document.getElementById("btnShareSadaqa").addEventListener("click", () => openShareModal('sadaqa'));
    document.getElementById("btnShareFinish").addEventListener("click", () => openShareModal('finish'));
    document.getElementById("btnShareGroup").addEventListener("click", () => openShareModal('group'));
    
    document.querySelectorAll('.share-platform-btn').forEach(btn => btn.addEventListener("click", (e) => doShare(e.currentTarget.getAttribute('data-platform'))));
    document.querySelectorAll('.alert-close').forEach(btn => btn.addEventListener('click', (e) => e.target.parentElement.classList.remove('show')));

    // Mascot Interaction
    document.getElementById("mascotBtn").addEventListener("click", () => {
        navigator.vibrate?.(30);
        setSpeech(motiv[Math.floor(Math.random() * motiv.length)]);
    });
}

function hideAll() { DOM.sections.forEach(s => s.style.display = 'none'); document.body.className = ''; }
function closeSection() { hideAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setSpeech(t) { DOM.speech.innerText = t; DOM.inlineSpeech.innerText = t; }
function goTo(id) { setTimeout(() => document.getElementById(id).scrollIntoView({ behavior: "smooth" }), 80); }

function showMiniToast(msg) {
    let t = document.getElementById("miniToast");
    if (!t) { t = document.createElement("div"); t.id = "miniToast"; t.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 20px;border-radius:50px;font-size:13px;font-weight:800;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.4);opacity:0;transition:.3s;text-align:center;`; document.body.appendChild(t); }
    t.innerText = msg; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 3000);
}

function initStreak() {
    let storedLast = localStorage.getItem("lastVisit");
    if (storedLast !== AppState.today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        if (storedLast === y.toDateString()) AppState.streak++; else AppState.streak = 1;
        localStorage.setItem("lastVisit", AppState.today); localStorage.setItem("streak", AppState.streak);
    }
    DOM.streakBadge.innerText = AppState.streak;
    if (!AppState.completedToday && new Date().getHours() >= 18) DOM.streakWarning.style.display = "block";
}

function startMode(mode) {
    hideAll(); AppState.currentModeName = mode;
    if (mode === 'morning') { document.body.classList.add("morning-theme"); setSpeech("صباح الأذكار ☀️"); }
    if (mode === 'evening') { document.body.classList.add("evening-theme"); setSpeech("سكينة المساء 🌙"); }
    if (mode === 'quick')   { document.body.classList.add("quick-theme"); setSpeech("ورد بسيط ✨"); }
    DOM.card.style.display = "block";
    AppState.currentMode = data[mode]; AppState.currentIndex = 0; AppState.currentCount = 0; AppState.xp = 0; AppState.combo = 0; AppState.halfwayShown = false;
    loadZekr(); goTo("card");
}

function loadZekr() {
    const item = AppState.currentMode[AppState.currentIndex];
    DOM.zekrTitle.innerText = item.title; DOM.zekrText.innerText = item.text;
    if (item.fadl) { DOM.zekrFadl.innerText = "✦ " + item.fadl; DOM.zekrFadl.style.display = 'block'; } else DOM.zekrFadl.style.display = 'none';
    DOM.repeat.innerText = item.repeat; DOM.counter.innerText = `${AppState.currentCount}/${item.repeat}`;
    DOM.progress.style.width = (AppState.currentIndex / AppState.currentMode.length * 100) + "%";
}

function countZekr() {
    navigator.vibrate?.(35);
    const item = AppState.currentMode[AppState.currentIndex];
    AppState.currentCount++; AppState.xp += 5; AppState.combo++;
    DOM.xp.innerText = AppState.xp; DOM.combo.innerText = AppState.combo; DOM.counter.innerText = `${AppState.currentCount}/${item.repeat}`;
    setSpeech(motiv[Math.floor(Math.random() * motiv.length)]);

    if (AppState.currentCount >= item.repeat) {
        AppState.currentIndex++; AppState.currentCount = 0;
        if (AppState.currentIndex >= AppState.currentMode.length) finishZekr();
        else loadZekr();
    }
}

function finishZekr() {
    if(AppState.currentModeName !== 'dua') {
        localStorage.setItem("completedToday", AppState.today); AppState.completedToday = true;
        DOM.streakWarning.style.display = "none";
        updateMyGroupStreak();
    }
    DOM.card.style.display = "none"; document.getElementById("finish").style.display = "block";
    let cel = AppState.currentModeName==='dua' ? 'تقبل الله دعاءك 🤲' : 'أشطر كتكوت خلص ورده! 🏆';
    setTimeout(() => showCelebration('ممتاز!', cel), 300);
}

function openDua(type) {
    const dua = duas[type]; if (!dua) return;
    hideAll(); DOM.card.style.display = "block";
    AppState.currentModeName = 'dua'; AppState.currentMode = [{title: "🤲 دعاء", text: dua.text, fadl: dua.ref, repeat: 1}];
    AppState.currentIndex = 0; AppState.currentCount = 0; AppState.xp = 0; AppState.combo = 0;
    loadZekr(); goTo("card");
}

function openTasbeeh() {
    hideAll(); document.getElementById("tasbeehArea").style.display = "block"; setSpeech("سبح براحتك 🤍");
    AppState.freeCounter = 0; document.getElementById("freeCounter").innerText = 0;
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`tasbeeh_${AppState.today}_`));
    const total = allKeys.reduce((s,k) => s + (parseInt(localStorage.getItem(k))||0), 0);
    document.getElementById("tasbeehTodayCount").innerText = `تسبيحاتك اليوم: ${total}`; goTo("tasbeehArea");
}

document.getElementById("btnIncreaseTasbeeh").addEventListener("click", () => {
    navigator.vibrate?.(30); AppState.freeCounter++; document.getElementById("freeCounter").innerText = AppState.freeCounter;
    const key = `tasbeeh_${AppState.today}_${document.getElementById("tasbeehSelect").value}`;
    localStorage.setItem(key, (parseInt(localStorage.getItem(key)||0)+1).toString());
});
document.getElementById("btnResetTasbeeh").addEventListener("click", () => { AppState.freeCounter=0; document.getElementById("freeCounter").innerText=0; });

function openKahf() { hideAll(); document.body.classList.add("kahf-theme"); document.getElementById("kahfArea").style.display="block"; renderKahf(); goTo("kahfArea"); }
function renderKahf() {
    const done = AppState.kahfIndex >= kahfAyat.length;
    document.getElementById("kahfText").style.display = done ? 'none' : 'flex';
    document.querySelector(".kahf-nav").style.display = done ? 'none' : 'grid';
    document.getElementById("kahfDone").style.display = done ? 'block' : 'none';
    if(!done) {
        const a = kahfAyat[AppState.kahfIndex];
        document.getElementById("kahfText").innerHTML = `<div style="width:100%;"><div style="font-size:12px;color:#6ee7b7;margin-bottom:12px;">﴿ ${a.n} ﴾</div><div style="font-size:20px;line-height:2.5;">${a.t}</div></div>`;
        document.getElementById("kahfBadge").innerText = `${AppState.kahfIndex+1} / ${kahfAyat.length}`;
        document.getElementById("kahfProgress").style.width = Math.round((AppState.kahfIndex+1)/kahfAyat.length*100) + "%";
    }
}
document.getElementById("btnKahfNext").addEventListener("click", () => { if(AppState.kahfIndex < kahfAyat.length) { AppState.kahfIndex++; localStorage.setItem("kahfIndex", AppState.kahfIndex); renderKahf(); } });
document.getElementById("btnKahfPrev").addEventListener("click", () => { if(AppState.kahfIndex > 0) { AppState.kahfIndex--; localStorage.setItem("kahfIndex", AppState.kahfIndex); renderKahf(); } });
document.getElementById("btnRestartKahf").addEventListener("click", () => { AppState.kahfIndex = 0; localStorage.setItem("kahfIndex","0"); renderKahf(); });

async function sbFetch(path, opts={}) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': opts.prefer || 'return=representation', ...opts.headers }, ...opts });
        if(!res.ok) throw new Error(await res.text());
        const txt = await res.text(); return txt ? JSON.parse(txt) : [];
    } catch(e) { throw e; }
}
async function updateMyGroupStreak() {
    if(!AppState.myGroupCode) return;
    try { await sbFetch(`members?group_code=eq.${AppState.myGroupCode}&user_id=eq.${AppState.myUserId}`, { method: 'PATCH', body: JSON.stringify({streak: AppState.streak, done_today: true}) }); } catch(e){}
}

/* ================================================================
   11. GROUP & SUPABASE (الجروبات وقاعدة البيانات)
================================================================ */
function openGroup() { 
    hideAll(); 
    document.getElementById("groupArea").style.display = "block"; 
    if(AppState.myGroupCode) showLeaderboard(); 
    else document.getElementById("groupSetup").style.display = "block"; 
    goTo("groupArea"); 
}

document.getElementById("btnShowJoin").addEventListener("click", () => document.getElementById("joinRow").style.display = "block");

function setGroupStatus(msg, color='#f472b6') {
    const statusEl = document.getElementById("groupStatus");
    statusEl.style.color = color;
    statusEl.innerText = msg;
}

function getWeekStart() {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); 
    return d.toISOString().split('T')[0];
}

async function createGroup() {
    const name = document.getElementById("nameInput").value.trim(); 
    if(!name) return showMiniToast("اكتب اسمك الأول 😊");
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGroupStatus("⏳ جاري الإنشاء أونلاين...", "#fcd34d");

    try {
        // إنشاء الجروب أونلاين
        await sbFetch('groups', { 
            method: 'POST', 
            body: JSON.stringify({ code: code, name: name + "'s Group", week_start: getWeekStart() }) 
        });
        
        // إضافة المستخدم كأول عضو
        await sbFetch('members', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify({ group_code: code, user_id: AppState.myUserId, name: name, streak: AppState.streak, done_today: AppState.completedToday })
        });

        AppState.myGroupCode = code; AppState.myName = name; 
        localStorage.setItem("myGroupCode", code); localStorage.setItem("myName", name);
        showLeaderboard(); showMiniToast(`✅ الجروب اتعمل أونلاين! كوده: ${code}`);
    } catch (e) {
        console.warn("Supabase Error:", e);
        // في حالة فشل الاتصال بالنت، يشتغل محلي مؤقتاً
        const members = {}; members[AppState.myUserId] = {name, streak: AppState.streak, done_today: AppState.completedToday, user_id: AppState.myUserId};
        localStorage.setItem("group_" + code, JSON.stringify(members));
        AppState.myGroupCode = code; AppState.myName = name; 
        localStorage.setItem("myGroupCode", code); localStorage.setItem("myName", name);
        showLeaderboard(); showMiniToast(`⚠️ الجروب اتعمل محلياً لعدم وجود نت!`);
    }
}

async function joinGroup() {
    const name = document.getElementById("nameInput").value.trim();
    const code = document.getElementById("codeInput").value.trim();
    
    if(!name || code.length !== 6) return showMiniToast("تأكد من الاسم والكود");
    
    setGroupStatus("⏳ جاري الانضمام أونلاين...", "#fcd34d");

    try {
        // التأكد من أن الجروب موجود في قاعدة البيانات
        const groups = await sbFetch(`groups?code=eq.${code}&select=code`);
        if(!groups.length) {
            setGroupStatus("❌ الكود ده مش موجود، تأكد منه", '#ef4444');
            return;
        }

        // إضافة العضو أونلاين
        await sbFetch('members', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify({ group_code: code, user_id: AppState.myUserId, name: name, streak: AppState.streak, done_today: AppState.completedToday })
        });

        AppState.myGroupCode = code; AppState.myName = name; 
        localStorage.setItem("myGroupCode", code); localStorage.setItem("myName", name);
        showLeaderboard(); showMiniToast("✅ انضممت أونلاين بنجاح!");
    } catch (e) {
        console.warn("Supabase Error:", e);
        // في حالة فشل الاتصال بالنت، يشتغل محلي مؤقتاً
        AppState.myGroupCode = code; AppState.myName = name; 
        localStorage.setItem("myGroupCode", code); localStorage.setItem("myName", name);
        const members = JSON.parse(localStorage.getItem("group_" + code) || "{}"); 
        members[AppState.myUserId] = {name, streak: AppState.streak, done_today: AppState.completedToday, user_id: AppState.myUserId}; 
        localStorage.setItem("group_" + code, JSON.stringify(members));
        showLeaderboard(); showMiniToast("⚠️ انضممت محلياً لعدم وجود نت!");
    }
}

document.getElementById("btnCreateGroup").addEventListener("click", createGroup); 
document.getElementById("btnJoinGroup").addEventListener("click", joinGroup);

function showLeaderboard() { 
    document.getElementById("groupSetup").style.display = "none"; 
    document.getElementById("leaderboard").style.display = "block"; 
    document.getElementById("groupCodeDisplay").innerText = `📋 ${AppState.myGroupCode}`; 
    renderLeaderboard(); 
}

async function renderLeaderboard() {
    const ranks = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    document.getElementById("lbRows").innerHTML = '<div style="text-align:center; color:#94a3b8; padding: 10px;">⏳ جاري التحميل من السيرفر...</div>';
    
    let arr = [];
    try {
        // جلب البيانات من السيرفر أونلاين
        arr = await sbFetch(`members?group_code=eq.${AppState.myGroupCode}&order=streak.desc&limit=10`);
    } catch (e) {
        // في حالة فشل الاتصال، جلب المحلي
        console.warn("Supabase Error, local fallback:", e);
        const members = JSON.parse(localStorage.getItem("group_" + AppState.myGroupCode) || "{}"); 
        arr = Object.values(members).sort((a, b) => b.streak - a.streak);
    }

    let html = ''; 
    arr.forEach((m, i) => { 
        const isMe = m.user_id === AppState.myUserId;
        html += `<div class="lb-row ${isMe ? 'me' : ''}">
                    <div class="lb-rank">${ranks[i] || '👤'}</div>
                    <div class="lb-name">${m.name} ${isMe ? '(أنا)' : ''}</div>
                    <div class="lb-streak">🔥${m.streak || 0}</div>
                    <div class="lb-done">${m.done_today ? '✅' : '⏳'}</div>
                 </div>`; 
    });
    
    document.getElementById("lbRows").innerHTML = html || '<div style="text-align:center; color:#94a3b8;">ابعت الكود لأصحابك عشان ينضموا! 🌿</div>';
    renderHomeLB(arr);
}

function renderHomeLB(arr) {
    if(!arr || !arr.length){ document.getElementById("homeLB").style.display="none"; return; }
    document.getElementById("homeLB").style.display="block";
    const ranks=['🥇','🥈','🥉','4️⃣','5️⃣'];
    let html='';
    arr.slice(0,5).forEach((m,i) => {
        const isMe = m.user_id === AppState.myUserId;
        html += `<div class="home-lb-row ${isMe ? 'me' : ''}">
                    <div class="home-lb-rank">${ranks[i]}</div>
                    <div class="home-lb-name">${m.name}${isMe ? ' 👈' : ''}</div>
                    <div class="home-lb-streak">🔥${m.streak || 0}</div>
                    <div class="home-lb-done">${m.done_today ? '✅' : '⏳'}</div>
                 </div>`;
    });
    document.getElementById("homeLBRows").innerHTML = html;
}

document.getElementById("btnLeaveGroup").addEventListener("click", () => { 
    localStorage.removeItem("myGroupCode"); AppState.myGroupCode = null; 
    document.getElementById("leaderboard").style.display = "none"; 
    document.getElementById("groupSetup").style.display = "block"; 
});
function renderLeaderboard() {
    const members = JSON.parse(localStorage.getItem("group_"+AppState.myGroupCode)||"{}"); const arr = Object.values(members).sort((a,b)=>b.streak-a.streak);
    let html=''; arr.forEach((m,i)=> { html+=`<div class="lb-row"><div class="lb-rank">${['🥇','🥈','🥉'][i]||'👤'}</div><div class="lb-name">${m.name}</div><div class="lb-streak">🔥${m.streak}</div></div>`; });
    document.getElementById("lbRows").innerHTML = html || '<div style="text-align:center;">ابعت الكود لأصحابك!</div>';
}
document.getElementById("btnLeaveGroup").addEventListener("click", () => { localStorage.removeItem("myGroupCode"); AppState.myGroupCode=null; document.getElementById("leaderboard").style.display="none"; document.getElementById("groupSetup").style.display="block"; });

function openShareModal(ctx) { AppState.shareContext = ctx; DOM.shareModal.classList.add("show"); }
function closeShareModal() { DOM.shareModal.classList.remove("show"); }
function doShare(platform) { const txt = `✨ حصنك اليومي\n📲 ${APP_URL}`; if(platform==='copy'){ navigator.clipboard?.writeText(txt); showMiniToast("نسخ!"); } closeShareModal(); }

function showCelebration(title, msg) { DOM.celebTitle.innerText = title; DOM.celebMsg.innerText = msg; DOM.celebOverlay.classList.add("show"); }
function closeCelebration() { DOM.celebOverlay.classList.remove("show"); }

document.getElementById("notifToggle").addEventListener("click", () => {
    AppState.notifEnabled = !AppState.notifEnabled; localStorage.setItem("notifEnabled", AppState.notifEnabled);
    document.getElementById("notifToggle").classList.toggle("on", AppState.notifEnabled);
    document.getElementById("notifStatus").innerText = AppState.notifEnabled ? "شغال" : "إيقاف";
});

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtn').style.display = 'block'; });
document.getElementById('installBtn').addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') document.getElementById('installBtn').style.display = 'none'; deferredPrompt = null; });
window.addEventListener('appinstalled', () => document.getElementById('installBtn').style.display = 'none');

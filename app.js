/* ================================================================
   1. STATE MANAGEMENT (إدارة الحالة)
================================================================ */
const AppState = {
    today: new Date().toDateString(),
    streak: parseInt(localStorage.getItem("streak")) || 0,
    completedToday: false,
    
    // Zekr State
    currentMode: [],
    currentModeName: '',
    currentIndex: 0,
    currentCount: 0,
    xp: 0,
    combo: 0,
    halfwayShown: false,
    
    // Tasbeeh State
    freeCounter: 0,
    
    // Kahf State
    kahfIndex: parseInt(localStorage.getItem("kahfIndex") || "0"),
    
    // Group State
    myGroupCode: localStorage.getItem("myGroupCode") || null,
    myName: localStorage.getItem("myName") || null,
    myUserId: localStorage.getItem("myUserId") || ('u' + Math.random().toString(36).substr(2,8)),
    
    // Settings
    notifEnabled: localStorage.getItem("notifEnabled") === "true",
    notifInterval: null,
    currentQuote: quotes[Math.floor(Math.random() * quotes.length)],
    shareContext: 'quote'
};

// Initialize variables that need calculations
AppState.completedToday = localStorage.getItem("completedToday") === AppState.today;
localStorage.setItem("myUserId", AppState.myUserId);

/* ================================================================
   2. DOM CACHING (تخزين عناصر الواجهة)
================================================================ */
const DOM = {
    // Containers
    sadaqaScroll: document.getElementById("sadaqaScroll"),
    duaGrid: document.getElementById("duaGrid"),
    sections: ['card', 'tasbeehArea', 'kahfArea', 'groupArea', 'finish'].map(id => document.getElementById(id)),
    
    // Texts & Stats
    quote: document.getElementById("quote"),
    streakBadge: document.getElementById("streak"),
    streakWarning: document.getElementById("streakWarning"),
    speech: document.getElementById("speech"),
    inlineSpeech: document.getElementById("inlineSpeech"),
    xp: document.getElementById("xp"),
    combo: document.getElementById("combo"),
    
    // Zekr Elements
    zekrTitle: document.getElementById("zekrTitle"),
    zekrText: document.getElementById("zekrText"),
    zekrFadl: document.getElementById("zekrFadl"),
    repeat: document.getElementById("repeat"),
    counter: document.getElementById("counter"),
    progress: document.getElementById("progress"),
    
    // Buttons (Modes & Main)
    btnMorning: document.getElementById("btnMorning"),
    btnEvening: document.getElementById("btnEvening"),
    btnQuick: document.getElementById("btnQuick"),
    btnTasbeehMode: document.getElementById("btnTasbeehMode"),
    btnKahfMode: document.getElementById("btnKahfMode"),
    btnGroupMode: document.getElementById("btnGroupMode"),
    btnCountZekr: document.getElementById("btnCountZekr"),
    btnBacks: document.querySelectorAll('.btn-close-section'),
    
    // Modals
    shareModal: document.getElementById("shareModal"),
    celebOverlay: document.getElementById("celebOverlay"),
    celebTitle: document.getElementById("celebTitle"),
    celebMsg: document.getElementById("celebMsg"),
    confettiWrap: document.getElementById("confettiWrap")
};

/* ================================================================
   3. INITIALIZATION & EVENTS (بدء التشغيل)
================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    initStreak();
    renderDynamicLists();
    bindEvents();
    
    DOM.quote.innerText = AppState.currentQuote;
});

function renderDynamicLists() {
    // Render Sadaqa
    let sadaqaHtml = '';
    sadaqaList.forEach(person => {
        sadaqaHtml += `<div class="sadaqa-card"><div class="icon">🕊️</div><div class="name">${person.name}</div><div class="role">${person.role}</div></div>`;
    });
    DOM.sadaqaScroll.innerHTML = sadaqaHtml;

    // Render Duas
    let duaHtml = '';
    duaList.forEach(dua => {
        duaHtml += `<div class="dua-card" data-duatype="${dua.id}"><div class="dua-name">${dua.name}</div></div>`;
    });
    DOM.duaGrid.innerHTML = duaHtml;

    // Add events to dynamic Duas
    document.querySelectorAll('.dua-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-duatype');
            openDua(type);
        });
    });
}

function bindEvents() {
    // Modes
    DOM.btnMorning.addEventListener("click", () => startMode('morning'));
    DOM.btnEvening.addEventListener("click", () => startMode('evening'));
    DOM.btnQuick.addEventListener("click", () => startMode('quick'));
    DOM.btnTasbeehMode.addEventListener("click", openTasbeeh);
    DOM.btnKahfMode.addEventListener("click", openKahf);
    DOM.btnGroupMode.addEventListener("click", openGroup);
    
    // Zekr Action
    DOM.btnCountZekr.addEventListener("click", countZekr);
    
    // Back Buttons
    DOM.btnBacks.forEach(btn => btn.addEventListener("click", closeSection));

    // Share & Celebrate
    document.getElementById("btnCloseShare").addEventListener("click", closeShareModal);
    document.getElementById("btnCloseCelebration").addEventListener("click", closeCelebration);
    
    // Add Share events
    document.getElementById("quoteBox").addEventListener("click", () => openShareModal('quote'));
    document.getElementById("btnShareSadaqa").addEventListener("click", () => openShareModal('sadaqa'));
    document.getElementById("btnShareFinish").addEventListener("click", () => openShareModal('finish'));
    
    document.querySelectorAll('.share-platform-btn').forEach(btn => {
        btn.addEventListener("click", (e) => doShare(e.currentTarget.getAttribute('data-platform')));
    });

    // Alert closes
    document.querySelectorAll('.alert-close').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.parentElement.classList.remove('show'));
    });
}

/* ================================================================
   4. CORE UI FUNCTIONS
================================================================ */
function hideAll() {
    DOM.sections.forEach(sec => sec.style.display = 'none');
    document.body.className = '';
}

function closeSection() {
    hideAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setSpeech(t) {
    DOM.speech.innerText = t;
    DOM.inlineSpeech.innerText = t;
}

function goTo(id) {
    setTimeout(() => document.getElementById(id).scrollIntoView({ behavior: "smooth" }), 80);
}

function showMiniToast(msg) {
    let t = document.getElementById("miniToast");
    if (!t) {
        t = document.createElement("div");
        t.id = "miniToast";
        t.style.cssText = `position:fixed;top:18px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#f59e0b,#ea580c);color:white;padding:11px 18px;border-radius:50px;font-size:13px;font-weight:800;font-family:'Cairo',sans-serif;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.4);opacity:0;transition:.35s;max-width:86vw;text-align:center;`;
        document.body.appendChild(t);
    }
    t.innerText = msg;
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 3000);
}

/* ================================================================
   5. STREAK LOGIC
================================================================ */
function initStreak() {
    let storedLast = localStorage.getItem("lastVisit");
    if (storedLast !== AppState.today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        if (storedLast === y.toDateString()) AppState.streak++;
        else AppState.streak = 1;
        
        localStorage.setItem("lastVisit", AppState.today);
        localStorage.setItem("streak", AppState.streak);
    }
    DOM.streakBadge.innerText = AppState.streak;

    if (!AppState.completedToday) {
        const h = new Date().getHours();
        if (h >= 18) DOM.streakWarning.style.display = "block";
    }
}

/* ================================================================
   6. ZEKR ENGINE
================================================================ */
function startMode(mode) {
    hideAll();
    AppState.currentModeName = mode;
    
    if (mode === 'morning') { document.body.classList.add("morning-theme"); setSpeech("صباح الأذكار نور ☀️"); }
    if (mode === 'evening') { document.body.classList.add("evening-theme"); setSpeech("سكينة المساء 🌙"); }
    if (mode === 'quick')   { document.body.classList.add("quick-theme"); setSpeech("ورد بسيط وأجر كبير ✨"); }
    
    document.getElementById("card").style.display = "block";
    
    AppState.currentMode = data[mode];
    AppState.currentIndex = 0;
    AppState.currentCount = 0;
    AppState.xp = 0;
    AppState.combo = 0;
    AppState.halfwayShown = false;
    
    loadZekr();
    goTo("card");
}

function loadZekr() {
    const item = AppState.currentMode[AppState.currentIndex];
    DOM.zekrTitle.innerText = item.title;
    DOM.zekrText.innerText = item.text;
    
    if (item.fadl) {
        DOM.zekrFadl.innerText = "✦ " + item.fadl;
        DOM.zekrFadl.style.display = 'block';
    } else {
        DOM.zekrFadl.style.display = 'none';
    }
    
    DOM.repeat.innerText = item.repeat;
    DOM.counter.innerText = `${AppState.currentCount}/${item.repeat}`;
    updateProgress();
}

function countZekr() {
    navigator.vibrate?.(35);
    const item = AppState.currentMode[AppState.currentIndex];
    
    AppState.currentCount++;
    AppState.xp += 5;
    AppState.combo++;
    
    DOM.xp.innerText = AppState.xp;
    DOM.combo.innerText = AppState.combo;
    DOM.counter.innerText = `${AppState.currentCount}/${item.repeat}`;
    
    DOM.counter.classList.add("glow");
    setTimeout(() => DOM.counter.classList.remove("glow"), 280);
    setSpeech(motiv[Math.floor(Math.random() * motiv.length)]);

    if (AppState.currentCount >= item.repeat) {
        AppState.currentIndex++;
        AppState.currentCount = 0;
        
        if (AppState.currentIndex >= AppState.currentMode.length) {
            finishZekr();
        } else {
            const half = Math.floor(AppState.currentMode.length / 2);
            if (AppState.currentIndex === half || AppState.currentIndex === AppState.currentMode.length) {
                showCelebration(`أتممت: ${AppState.currentMode[AppState.currentIndex-1].title} 🤍`, 'يلا نكمل الباقي 💪');
                setTimeout(() => { closeCelebration(); loadZekr(); }, 2200);
            } else {
                loadZekr();
            }
        }
    }
}

function updateProgress() {
    DOM.progress.style.width = (AppState.currentIndex / AppState.currentMode.length * 100) + "%";
    const half = Math.floor(AppState.currentMode.length / 2);
    if (AppState.currentIndex === half && AppState.currentCount === 0 && !AppState.halfwayShown) {
        AppState.halfwayShown = true;
        showMiniToast("يلا يا بطل! قطعنا نص المسافة 💪🔥");
        setSpeech("نص الطريق! كمّل 🌿");
    }
}

function finishZekr() {
    localStorage.setItem("completedToday", AppState.today);
    AppState.completedToday = true;
    DOM.streakWarning.style.display = "none";
    document.getElementById("card").style.display = "none";
    document.getElementById("finish").style.display = "block";
    
    let cel = '', hint = '';
    if (AppState.currentModeName === 'morning') { cel = 'أشطر كتكوت! خلصت ورد الصباح 🌅'; hint = '🌙 في انتظارك أذكار المساء عشان يكتمل حصنك!'; }
    else if (AppState.currentModeName === 'evening') { cel = 'أشطر كتكوت! خلصت ورد المساء 🌙'; hint = '☀️ نراك بكره في أذكار الصباح!'; }
    else { cel = 'أشطر كتكوت! خلصت الورد المختصر ⚡'; hint = '🌅 جرّب أذكار الصباح أو المساء للحصن الكامل!'; }
    
    document.getElementById("nextHint").innerText = hint;
    setTimeout(() => showCelebration('أشطر كتكوت كده خلصنا! 🏆', cel), 300);
}

/* ================================================================
   7. DUAS FEATURE
================================================================ */
function openDua(type) {
    const dua = duas[type];
    if (!dua) return;

    document.getElementById("card").style.display = "block";
    DOM.zekrTitle.innerText = "🤲 دعاء";
    DOM.zekrText.innerText = dua.text;
    DOM.zekrFadl.innerText = "📖 " + dua.ref;
    DOM.repeat.innerText = "-";
    DOM.counter.innerText = "0";

    DOM.progress.style.width = "100%";
    goTo("card");
}

/* ================================================================
   8. SHARE MODAL (المشاركة)
================================================================ */
function getShareText(ctx){
    if(ctx==='quote') return `✨ حصنك اليومي ✨\n\n"${AppState.currentQuote}"\n\n📲 ${APP_URL}`;
    if(ctx==='sadaqa') return `🤍 صدقة جارية على أرواح خالد آدم وعمرو خالد ومحمود فوزي وغيرهم 🤍\n\nشارك معايا تطبيق حصنك اليومي للأذكار 🌿\n\n📲 ${APP_URL}\n\nكل ما حد بيستخدمه بيجي الأجر عليهم وعليك ✨`;
    if(ctx==='finish') return `🏆 خلصت وردي اليومي في حصنك اليومي!\n🔥 الاستريك: ${AppState.streak} يوم\n\n"${AppState.currentQuote}"\n\n📲 ${APP_URL} 🤍`;
    if(ctx==='kahf') return `📖 أتممت سورة الكهف كاملة النهارده 🌟\n\nسورة الكهف نور بين الجمعتين ✨\n\n📲 ${APP_URL}`;
    if(ctx==='group') return `🏆 يا جماعة! انضموا لتحدي الأذكار معايا!\n\nكود الجروب: ${AppState.myGroupCode||'------'}\n\n📲 ${APP_URL}\nاضغط "تحدي الجروب" وادخل الكود 🌿`;
    return `✨ حصنك اليومي\n📲 ${APP_URL}`;
}

function openShareModal(ctx){
    AppState.shareContext=ctx;
    document.getElementById("shareModalTitle").innerText = ctx==='quote'?'شارك الاقتباس':ctx==='group'?'ادعو أصحابك':'شارك على';
    document.getElementById("shareModal").classList.add("show");
}

function closeShareModal(e){
    if(!e || e.target===document.getElementById("shareModal"))
        document.getElementById("shareModal").classList.remove("show");
}

function doShare(platform){
    const txt = getShareText(AppState.shareContext);
    const enc = encodeURIComponent(txt);
    const urls = {
        whatsapp:`https://wa.me/?text=${enc}`,
        facebook:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}&quote=${enc}`,
        twitter:`https://twitter.com/intent/tweet?text=${enc}`
    };
    if(platform==='copy'){
        navigator.clipboard?.writeText(txt).then(()=>showMiniToast("✅ النص اتنسخ!"));
        closeShareModal();return;
    }
    if(platform==='instagram'){
        navigator.clipboard?.writeText(txt).then(()=>showMiniToast("✅ النص اتنسخ — افتح انستجرام والصقه!"));
        closeShareModal();return;
    }
    if(platform==='native'){
        if(navigator.share) navigator.share({title:'حصنك اليومي',text:txt,url:APP_URL}).catch(()=>{});
        else navigator.clipboard?.writeText(txt).then(()=>showMiniToast("✅ النص اتنسخ!"));
        closeShareModal();return;
    }
    window.open(urls[platform],'_blank');
    closeShareModal();
}

function showCelebration(title,msg){
    DOM.celebTitle.innerText=title;
    DOM.celebMsg.innerText=msg;
    DOM.celebOverlay.classList.add("show");
    navigator.vibrate?.([100,50,100,50,180]);
}

function closeCelebration(){
    DOM.celebOverlay.classList.remove("show");
}

/* ================================================================
   9. TASBEEH (التسبيح الحر)
================================================================ */
const tasbeehStorageKey=()=>`tasbeeh_${AppState.today}_${document.getElementById("tasbeehSelect").value}`;

function openTasbeeh(){
    hideAll();
    document.getElementById("tasbeehArea").style.display="block";
    setSpeech("سبح براحتك 🤍");
    updateTasbeehDisplay();
    goTo("tasbeehArea");
}

function updateTasbeehDisplay(){
    AppState.freeCounter=0;
    document.getElementById("freeCounter").innerText=0;
    const allKeys=Object.keys(localStorage).filter(k=>k.startsWith(`tasbeeh_${AppState.today}_`));
    const total=allKeys.reduce((s,k)=>s+(parseInt(localStorage.getItem(k))||0),0);
    document.getElementById("tasbeehTodayCount").innerText=`تسبيحاتك اليوم: ${total}`;
}

document.getElementById("btnIncreaseTasbeeh").addEventListener("click", () => {
    navigator.vibrate?.(30); 
    AppState.freeCounter++;
    document.getElementById("freeCounter").innerText=AppState.freeCounter;
    
    const key=tasbeehStorageKey();
    localStorage.setItem(key,(parseInt(localStorage.getItem(key)||0)+1).toString());
    const allKeys=Object.keys(localStorage).filter(k=>k.startsWith(`tasbeeh_${AppState.today}_`));
    const total=allKeys.reduce((s,k)=>s+(parseInt(localStorage.getItem(k))||0),0);
    document.getElementById("tasbeehTodayCount").innerText=`تسبيحاتك اليوم: ${total}`;
});

document.getElementById("btnResetTasbeeh").addEventListener("click", () => {
    AppState.freeCounter=0;
    document.getElementById("freeCounter").innerText=0;
});

document.getElementById("tasbeehSelect").addEventListener("change", () => {
    AppState.freeCounter=0;
    document.getElementById("freeCounter").innerText=0;
});

/* ================================================================
   10. KAHF (سورة الكهف)
================================================================ */
const KAHF_TOTAL = kahfAyat.length; // تأكد من نسخ كل الآيات في data.js

function openKahf(){
    hideAll();
    document.body.classList.add("kahf-theme");
    document.getElementById("kahfArea").style.display="block";
    document.getElementById("fridayBanner").classList.remove("show");
    renderKahf();
    goTo("kahfArea");
    setSpeech("سورة الكهف نور 📖");
}

function renderKahf(){
    const done = AppState.kahfIndex >= KAHF_TOTAL;
    document.getElementById("kahfText").style.display = done ? 'none' : 'flex';
    document.querySelector(".kahf-nav").style.display = done ? 'none' : 'grid';
    document.getElementById("kahfDone").style.display = done ? 'block' : 'none';
    
    if(!done){
        const a = kahfAyat[AppState.kahfIndex];
        if(a) {
            document.getElementById("kahfText").innerHTML=`<div style="width:100%;"><div style="font-size:12px;color:#6ee7b7;margin-bottom:12px;opacity:.7;">﴿ ${a.n} ﴾</div><div style="font-size:20px;line-height:2.5;color:#f1f5f9;">${a.t}</div></div>`;
            document.getElementById("kahfBadge").innerText=`${AppState.kahfIndex+1} / ${KAHF_TOTAL}`;
            const pct=Math.round((AppState.kahfIndex+1)/KAHF_TOTAL*100);
            document.getElementById("kahfProgress").style.width=pct+"%";
            document.getElementById("kahfPct").innerText=pct+"%";
        }
    }
}

document.getElementById("btnKahfNext").addEventListener("click", () => {
    if(AppState.kahfIndex < KAHF_TOTAL){
        AppState.kahfIndex++;
        localStorage.setItem("kahfIndex", AppState.kahfIndex);
        renderKahf();
        if(AppState.kahfIndex >= KAHF_TOTAL){
            showCelebration("🌟 أتممت سورة الكهف!","جعلها الله نوراً لك بين الجمعتين 🤍");
        }
    }
});

document.getElementById("btnKahfPrev").addEventListener("click", () => {
    if(AppState.kahfIndex > 0){
        AppState.kahfIndex--;
        localStorage.setItem("kahfIndex", AppState.kahfIndex);
        renderKahf();
    }
});

document.getElementById("btnRestartKahf").addEventListener("click", () => {
    AppState.kahfIndex = 0;
    localStorage.setItem("kahfIndex","0");
    renderKahf();
});

/* ================================================================
   11. GROUP & SUPABASE (الجروبات وقاعدة البيانات)
================================================================ */
function openGroup(){
    hideAll();
    document.getElementById("groupArea").style.display="block";
    if(AppState.myGroupCode && AppState.myName) showLeaderboard();
    else {
        document.getElementById("groupSetup").style.display="block";
        document.getElementById("leaderboard").style.display="none";
    }
    goTo("groupArea");
}

document.getElementById("btnShowJoin").addEventListener("click", () => {
    document.getElementById("joinRow").style.display="block";
});

function setGroupStatus(msg,color='#f472b6'){
    document.getElementById("groupStatus").style.color=color;
    document.getElementById("groupStatus").innerText=msg;
}

function getWeekStart(){
    const d=new Date(); d.setDate(d.getDate()-d.getDay()); 
    return d.toISOString().split('T')[0];
}

async function createGroup(){
    const name=document.getElementById("nameInput").value.trim();
    if(!name){showMiniToast("اكتب اسمك الأول 😊");return;}
    const code=Math.floor(100000+Math.random()*900000).toString();
    setGroupStatus("⏳ جاري الإنشاء...");
    
    // Fallback Local Storage
    const members={};
    members[AppState.myUserId] = {name, streak: AppState.streak, done_today: false, user_id: AppState.myUserId};
    localStorage.setItem("group_"+code, JSON.stringify(members));
    
    AppState.myGroupCode=code; AppState.myName=name;
    localStorage.setItem("myGroupCode",code); localStorage.setItem("myName",name);
    showLeaderboard(); showMiniToast(`✅ الجروب اتعمل! كوده: ${code}`);
}

async function joinGroup(){
    const name=document.getElementById("nameInput").value.trim();
    const code=document.getElementById("codeInput").value.trim();
    if(!name){showMiniToast("اكتب اسمك الأول 😊");return;}
    if(code.length!==6){showMiniToast("الكود لازم يكون 6 أرقام");return;}
    
    // Fallback Local Storage
    AppState.myGroupCode=code; AppState.myName=name;
    localStorage.setItem("myGroupCode",code); localStorage.setItem("myName",name);
    
    const members=JSON.parse(localStorage.getItem("group_"+code)||"{}");
    members[AppState.myUserId] = {name, streak: AppState.streak, done_today: false, user_id: AppState.myUserId};
    localStorage.setItem("group_"+code, JSON.stringify(members));
    
    showLeaderboard(); showMiniToast("✅ انضممت!");
}

document.getElementById("btnCreateGroup").addEventListener("click", createGroup);
document.getElementById("btnJoinGroup").addEventListener("click", joinGroup);

async function showLeaderboard(){
    document.getElementById("groupSetup").style.display="none";
    document.getElementById("leaderboard").style.display="block";
    document.getElementById("groupCodeDisplay").innerText=`📋 ${AppState.myGroupCode}`;
    document.getElementById("lbWeekInfo").innerText=`📅 تحدي الأسبوع — بيصفر كل جمعة 🔄`;
    renderLeaderboard();
}

async function renderLeaderboard(){
    const ranks=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const members = JSON.parse(localStorage.getItem("group_"+AppState.myGroupCode)||"{}");
    const arr = Object.values(members).sort((a,b)=>b.streak-a.streak);
    
    let html='';
    arr.forEach((m,i)=>{
        const isMe = m.user_id === AppState.myUserId;
        html+=`<div class="lb-row ${isMe?'me':''}">
          <div class="lb-rank">${ranks[i]||'👤'}</div>
          <div class="lb-name">${m.name}${isMe?' (أنا)':''}</div>
          <div class="lb-streak">🔥${m.streak||0}</div>
          <div class="lb-done">${m.done_today?'✅':'⏳'}</div>
        </div>`;
    });
    if(!arr.length) html='<div class="group-loading">ابعت الكود لأصحابك عشان ينضموا! 🌿</div>';
    document.getElementById("lbRows").innerHTML=html;
    renderHomeLB(arr);
}

function renderHomeLB(arr){
    if(!arr||!arr.length){document.getElementById("homeLB").style.display="none";return;}
    document.getElementById("homeLB").style.display="block";
    const ranks=['🥇','🥈','🥉','4️⃣','5️⃣'];
    let html='';
    arr.slice(0,5).forEach((m,i)=>{
        const isMe = m.user_id === AppState.myUserId;
        html+=`<div class="home-lb-row ${isMe?'me':''}"><div class="home-lb-rank">${ranks[i]}</div><div class="home-lb-name">${m.name}${isMe?' 👈':''}</div><div class="home-lb-streak">🔥${m.streak||0}</div><div class="home-lb-done">${m.done_today?'✅':'⏳'}</div></div>`;
    });
    document.getElementById("homeLBRows").innerHTML=html;
}

document.getElementById("groupCodeDisplay").addEventListener("click", () => {
    navigator.clipboard?.writeText(AppState.myGroupCode).then(()=>showMiniToast("✅ الكود اتنسخ!"));
});

document.getElementById("btnLeaveGroup").addEventListener("click", () => {
    if(confirm('هتطلع من الجروب؟')){
        localStorage.removeItem("myGroupCode"); localStorage.removeItem("myName");
        AppState.myGroupCode=null; AppState.myName=null;
        document.getElementById("groupSetup").style.display="block";
        document.getElementById("leaderboard").style.display="none";
        document.getElementById("homeLB").style.display="none";
    }
});

document.getElementById("btnShareGroup").addEventListener("click", () => openShareModal('group'));

// تحميل الجروب عند فتح الصفحة لو موجود
if(AppState.myGroupCode && AppState.myName){
    setTimeout(() => { renderLeaderboard(); }, 500);
}

/* ================================================================
   12. NOTIFICATIONS & ALERTS (الإشعارات)
================================================================ */
function updateToggleUI(){
    document.getElementById("notifToggle").classList.toggle("on", AppState.notifEnabled);
    document.getElementById("notifStatus").innerText = AppState.notifEnabled ? "شغال" : "إيقاف";
}
updateToggleUI();

async function toggleNotif(){
    if(AppState.notifEnabled){
        AppState.notifEnabled=false; 
        localStorage.setItem("notifEnabled","false");
        if(AppState.notifInterval) clearInterval(AppState.notifInterval);
        updateToggleUI(); showMiniToast("تم إيقاف التذكيرات");
        return;
    }
    if(!("Notification" in window)){showMiniToast("المتصفح مش بيدعم الإشعارات 😔");return;}
    const perm = await Notification.requestPermission();
    if(perm!=="granted"){showMiniToast("محتاج إذنك 🙏");return;}
    
    AppState.notifEnabled=true; localStorage.setItem("notifEnabled","true");
    updateToggleUI(); showMiniToast("✅ فعّلت التذكيرات!"); startNotifLoop();
}

document.getElementById("notifToggle").addEventListener("click", toggleNotif);

function startNotifLoop(){
    if(AppState.notifInterval) clearInterval(AppState.notifInterval);
    AppState.notifInterval = setInterval(()=>{
        if(!AppState.notifEnabled) return;
        const now=new Date(), h=now.getHours(), m=now.getMinutes(), d=now.getDay();
        if(m!==0) return; 
        
        if(h===8) sendNotif("🌅 صباح الأذكار!","ابدأ يومك بذكر الله يا بطل 🌿");
        if(h===17) sendNotif("🌙 أذكار المساء!","اختم يومك بذكر الله وتنام محصن 🤍");
        if(d===5 && h===14) sendNotif("📖 سورة الكهف!","سورة الكهف نور بين الجمعتين ✨");
    }, 60000);
}

function sendNotif(title,body){
    if(Notification.permission==="granted") new Notification(title,{body,icon:"/icons/icon-192x192.png"});
}

if(AppState.notifEnabled && "Notification" in window && Notification.permission==="granted") startNotifLoop();

// Banners
(()=>{
    const h=new Date().getHours(), d=new Date().getDay();
    if(d===5) document.getElementById("fridayBanner").classList.add("show");
    if(h>=5&&h<11) document.getElementById("morningBanner").classList.add("show");
    if(h>=16&&h<21) document.getElementById("eveningBanner").classList.add("show");
})();

document.getElementById("btnAlertKahf").addEventListener("click", openKahf);

/* ================================================================
   13. PWA (تثبيت التطبيق)
================================================================ */
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt=e;
    document.getElementById('installBtn').style.display='block';
});

window.addEventListener('load', () => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if(isIos && !isStandalone) document.getElementById('iosHint').style.display='block';
    if(isStandalone){ document.getElementById('installBtn').style.display='none'; document.getElementById('iosHint').style.display='none'; }
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if(!deferredPrompt){showMiniToast("افتح من Chrome 📲");return;}
    await deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    deferredPrompt=null;
    document.getElementById('installBtn').style.display='none';
    if(outcome==='accepted') showMiniToast('🎉 تم تنزيل التطبيق!');
});

window.addEventListener('appinstalled', () => {
    document.getElementById('installBtn').style.display='none';
    showMiniToast('🎉 حصنك على الهوم سكرين!');
});

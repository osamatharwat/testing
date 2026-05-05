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
   8. PLACEHOLDERS FOR OTHERS (Tasbeeh, Kahf, Group, Share)
================================================================ */
function openTasbeeh() { showMiniToast("سيتم تحميل التسبيح قريباً بناءً على نفس الهيكلة"); }
function openKahf() { showMiniToast("سيتم تحميل الكهف قريباً بناءً على نفس الهيكلة"); }
function openGroup() { showMiniToast("سيتم تحميل الجروبات قريباً بناءً على نفس الهيكلة"); }

function openShareModal(ctx) {
    AppState.shareContext = ctx;
    document.getElementById("shareModalTitle").innerText = ctx === 'quote' ? 'شارك الاقتباس' : 'شارك على';
    DOM.shareModal.classList.add("show");
}

function closeShareModal() {
    DOM.shareModal.classList.remove("show");
}

function doShare(platform) {
    showMiniToast(`تم الضغط على ${platform}`);
    closeShareModal();
}

function showCelebration(title, msg) {
    DOM.celebTitle.innerText = title;
    DOM.celebMsg.innerText = msg;
    DOM.celebOverlay.classList.add("show");
    navigator.vibrate?.([100, 50, 100, 50, 180]);
}

function closeCelebration() {
    DOM.celebOverlay.classList.remove("show");
}

/**
 * WakeStake — Automated 2-Minute Hackathon Demo Script
 * =====================================================
 * Injects a floating control panel; runs a full guided tour
 * of every key feature with timed sequences & annotations.
 *
 * Usage: paste this file reference into index.html AFTER app.js,
 *   OR open DevTools console and paste the entire file content,
 *   OR just load the page — the panel appears automatically.
 */

(function WakeStakeDemo() {
  'use strict';

  // ─── CONFIG ───────────────────────────────────────────────────────────────
  const DEMO_STEPS = [
    // [delay ms from previous, label, fn]
    [0,    'Welcome annotation',          showWelcomeBanner],
    [2800, 'Set Alarm Time → 07:30',      demoSetAlarmTime],
    [2200, 'Quick Preset — Lecture',      demoPresetChip],
    [1800, 'Bump Stake to £20',           demoBumpStake],
    [1800, 'Stake slider → £25',          demoSliderStake],
    [2000, 'Loss Equivalency update',     demoLossEquivalent],
    [1600, 'Switch destination → Beer Pot', demoBeerPot],
    [2000, 'Lock In Stake button',        demoLockIn],
    [2200, 'Nav → War Room (Leaderboard)', demoNavWarRoom],
    [1800, 'Simulate Flatmate Snooze',    demoSimulateSnooze],
    [2200, 'Nav → Streaks',               demoNavStreaks],
    [1800, 'Heatmap scroll',              demoStreakHeatmap],
    [2200, 'Nav → QR Terminal',           demoNavQR],
    [2000, 'QR Terminal highlight',       demoQRTerminal],
    [2200, 'Nav → Pro Business Model',    demoNavPro],
    [1800, 'Pro tier highlight',          demoProTier],
    [2500, 'Nav → Alarm (return)',        demoNavAlarm],
    [2000, '⚡ Launch Morning Simulation', demoLaunchSim],
    [4000, 'Disarm modal — QR scan',      demoDisarmQR],
    [3500, 'Celebration — Stake Protected!', demoSkipToCelebration],
    [3000, 'Demo complete 🎉',             demoComplete],
  ];

  let stepIndex = 0;
  let timeoutHandle = null;
  let isRunning = false;

  // ─── FLOATING CONTROL PANEL ───────────────────────────────────────────────
  function injectControlPanel() {
    if (document.getElementById('ws-demo-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'ws-demo-panel';
    panel.innerHTML = `
      <div id="ws-demo-drag-handle">
        <span style="font-size:1rem">⚡</span>
        <span style="font-size:0.78rem;font-weight:800;letter-spacing:0.06em;">DEMO MODE</span>
        <button id="ws-demo-close" title="Close panel" style="margin-left:auto;background:none;border:none;color:#fff;cursor:pointer;font-size:1rem;line-height:1">✕</button>
      </div>
      <div id="ws-demo-body">
        <div id="ws-demo-progress-wrap">
          <div id="ws-demo-progress-bar"></div>
        </div>
        <div id="ws-demo-step-label">Ready to launch…</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button id="ws-demo-start" class="ws-btn ws-btn-primary">▶ Start Demo</button>
          <button id="ws-demo-skip" class="ws-btn ws-btn-ghost" disabled>Skip Step</button>
          <button id="ws-demo-reset" class="ws-btn ws-btn-ghost">↺ Reset</button>
        </div>
        <div id="ws-demo-timer">0:00</div>
      </div>
    `;
    document.body.appendChild(panel);

    // Inject styles
    const style = document.createElement('style');
    style.id = 'ws-demo-styles';
    style.textContent = `
      #ws-demo-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        width: 270px;
        background: rgba(7,9,13,0.97);
        border: 1px solid rgba(255,43,78,0.45);
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(255,43,78,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #EDF2F7;
        overflow: hidden;
        backdrop-filter: blur(20px);
        user-select: none;
      }
      #ws-demo-drag-handle {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: linear-gradient(90deg, rgba(255,43,78,0.18), rgba(255,43,78,0.05));
        border-bottom: 1px solid rgba(255,43,78,0.22);
        cursor: move;
      }
      #ws-demo-body {
        padding: 14px;
      }
      #ws-demo-progress-wrap {
        height: 4px;
        background: rgba(255,255,255,0.08);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      #ws-demo-progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #FF2B4E, #FFB020);
        border-radius: 4px;
        transition: width 0.4s ease;
      }
      #ws-demo-step-label {
        font-size: 0.76rem;
        color: #A0AEC0;
        min-height: 32px;
        line-height: 1.4;
      }
      #ws-demo-step-label strong { color: #FFF; }
      #ws-demo-timer {
        font-size: 0.7rem;
        color: #718096;
        margin-top: 8px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .ws-btn {
        border: none;
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 7px 12px;
        cursor: pointer;
        transition: opacity 0.15s;
      }
      .ws-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .ws-btn-primary { background: #FF2B4E; color: #fff; }
      .ws-btn-primary:not(:disabled):hover { opacity: 0.85; }
      .ws-btn-ghost { background: rgba(255,255,255,0.07); color: #CBD5E0; border: 1px solid rgba(255,255,255,0.1); }
      .ws-btn-ghost:not(:disabled):hover { background: rgba(255,255,255,0.12); color: #fff; }

      /* Spotlight highlight ring */
      .ws-spotlight {
        outline: 3px solid #FF2B4E !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 6px rgba(255,43,78,0.25) !important;
        transition: outline 0.2s, box-shadow 0.2s !important;
      }
      /* Demo annotation tooltip */
      .ws-annotation {
        position: fixed;
        z-index: 99998;
        background: rgba(255,43,78,0.95);
        color: #fff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 8px 14px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(255,43,78,0.5);
        pointer-events: none;
        white-space: nowrap;
        animation: wsAnnotIn 0.25s cubic-bezier(0.16,1,0.3,1);
        max-width: 280px;
        white-space: normal;
        line-height: 1.4;
      }
      @keyframes wsAnnotIn {
        from { opacity:0; transform:translateY(6px) scale(0.96); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);

    // Bind buttons
    document.getElementById('ws-demo-start').addEventListener('click', startDemo);
    document.getElementById('ws-demo-skip').addEventListener('click', skipStep);
    document.getElementById('ws-demo-reset').addEventListener('click', resetDemo);
    document.getElementById('ws-demo-close').addEventListener('click', () => panel.remove());

    // Drag support
    makeDraggable(panel, document.getElementById('ws-demo-drag-handle'));
  }

  function makeDraggable(el, handle) {
    let ox = 0, oy = 0, sx = 0, sy = 0;
    handle.addEventListener('mousedown', e => {
      sx = e.clientX; sy = e.clientY;
      const rect = el.getBoundingClientRect();
      ox = rect.left; oy = rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
    function onMove(e) {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      el.style.left = (ox + dx) + 'px';
      el.style.top  = (oy + dy) + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
  }

  // ─── TIMER ────────────────────────────────────────────────────────────────
  let timerStart = 0;
  let timerInterval = null;

  function startTimer() {
    timerStart = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const el = document.getElementById('ws-demo-timer');
      if (el) el.textContent = `${m}:${String(s).padStart(2,'0')} elapsed`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  // ─── DEMO ORCHESTRATION ───────────────────────────────────────────────────
  function startDemo() {
    if (isRunning) return;
    isRunning = true;
    stepIndex = 0;
    document.getElementById('ws-demo-start').disabled = true;
    document.getElementById('ws-demo-skip').disabled = false;
    startTimer();
    runNextStep();
  }

  function runNextStep() {
    if (stepIndex >= DEMO_STEPS.length) {
      finishDemo();
      return;
    }
    const [delay, label, fn] = DEMO_STEPS[stepIndex];
    const progress = ((stepIndex + 1) / DEMO_STEPS.length) * 100;

    timeoutHandle = setTimeout(() => {
      updatePanelLabel(`<strong>Step ${stepIndex + 1}/${DEMO_STEPS.length}</strong> — ${label}`);
      updateProgressBar(progress);
      clearAllHighlights();
      clearAnnotations();

      try { fn(); } catch(e) { console.warn('[WakeStake Demo] Step error:', e); }

      stepIndex++;
      runNextStep();
    }, delay);
  }

  function skipStep() {
    if (!isRunning) return;
    clearTimeout(timeoutHandle);
    clearAllHighlights();
    clearAnnotations();
    stepIndex++;
    if (stepIndex >= DEMO_STEPS.length) {
      finishDemo();
    } else {
      runNextStep();
    }
  }

  function resetDemo() {
    clearTimeout(timeoutHandle);
    stopTimer();
    clearAllHighlights();
    clearAnnotations();
    closeAllModals();
    isRunning = false;
    stepIndex = 0;
    updatePanelLabel('Ready to launch…');
    updateProgressBar(0);
    const timer = document.getElementById('ws-demo-timer');
    if (timer) timer.textContent = '0:00';
    const startBtn = document.getElementById('ws-demo-start');
    if (startBtn) startBtn.disabled = false;
    const skipBtn = document.getElementById('ws-demo-skip');
    if (skipBtn) skipBtn.disabled = true;
  }

  function finishDemo() {
    isRunning = false;
    stopTimer();
    updateProgressBar(100);
    document.getElementById('ws-demo-start').disabled = false;
    document.getElementById('ws-demo-skip').disabled = true;
  }

  function updatePanelLabel(html) {
    const el = document.getElementById('ws-demo-step-label');
    if (el) el.innerHTML = html;
  }

  function updateProgressBar(pct) {
    const bar = document.getElementById('ws-demo-progress-bar');
    if (bar) bar.style.width = pct + '%';
  }

  // ─── UTILITY HELPERS ──────────────────────────────────────────────────────
  function spotlight(el, annotText, position = 'bottom') {
    if (!el) return;
    el.classList.add('ws-spotlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (annotText) {
      const rect = el.getBoundingClientRect();
      const ann = document.createElement('div');
      ann.className = 'ws-annotation ws-active-annotation';
      ann.textContent = annotText;
      document.body.appendChild(ann);

      // Position the tooltip
      setTimeout(() => {
        const ar = ann.getBoundingClientRect();
        let top, left;
        if (position === 'bottom') {
          top  = Math.min(rect.bottom + 12, window.innerHeight - ar.height - 10);
          left = Math.max(rect.left, 10);
        } else {
          top  = Math.max(rect.top - ar.height - 12, 10);
          left = Math.max(rect.left, 10);
        }
        ann.style.top  = top + 'px';
        ann.style.left = Math.min(left, window.innerWidth - ar.width - 10) + 'px';
      }, 0);

      // Auto-remove annotation after 2s
      setTimeout(() => ann.remove(), 2000);
    }
  }

  function clearAllHighlights() {
    document.querySelectorAll('.ws-spotlight').forEach(el => el.classList.remove('ws-spotlight'));
  }

  function clearAnnotations() {
    document.querySelectorAll('.ws-active-annotation').forEach(el => el.remove());
  }

  function clickTab(tabId) {
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (btn) btn.click();
  }

  function closeAllModals() {
    ['alarmModal','disarmModal','celebrationModal','forfeitModal'].forEach(id => {
      const m = document.getElementById(id);
      if (m) m.classList.remove('active');
    });
    // Also stop any alarm loop
    try { window.wakeStakeSound && window.wakeStakeSound.stopAlarmLoop(); } catch(e) {}
  }

  // ─── INDIVIDUAL DEMO STEPS ────────────────────────────────────────────────

  function showWelcomeBanner() {
    // Flash a full-page banner briefly
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;z-index:99997;
      background:rgba(7,9,13,0.92);display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:16px;
      font-family:'Plus Jakarta Sans',sans-serif;
      animation:wsAnnotIn 0.3s cubic-bezier(0.16,1,0.3,1);
      pointer-events:none;
    `;
    banner.innerHTML = `
      <div style="font-size:2.8rem;font-weight:900;color:#fff;letter-spacing:-0.04em;">
        ⚡ WAKE<strong style="color:#FF2B4E">STAKE</strong>
      </div>
      <div style="font-size:1.1rem;color:#A0AEC0;font-weight:600;">
        Loss-Aversion Alarm Clock &bull; Hackathon Demo
      </div>
      <div style="font-size:0.82rem;color:#718096;margin-top:8px;">
        Stake real money. Walk to your kitchen QR. Or pay your flatmates.
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => { banner.style.opacity = '0'; banner.style.transition = 'opacity 0.5s'; }, 2000);
    setTimeout(() => banner.remove(), 2600);
  }

  function demoSetAlarmTime() {
    clickTab('tab-alarm');
    setTimeout(() => {
      const input = document.getElementById('alarmTimeInput');
      if (!input) return;
      input.value = '07:30';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      spotlight(input, '⏰ Wake target: 07:30 AM — set & locked');
    }, 400);
  }

  function demoPresetChip() {
    const chip = document.querySelector('.preset-chips .chip[data-time="07:30"]');
    if (chip) {
      chip.click();
      spotlight(chip, '🎓 One-tap presets: Gym / Lecture / Exam', 'top');
    }
  }

  function demoBumpStake() {
    const chip20 = document.querySelector('.stake-chip[data-amount="20"]');
    if (chip20) {
      chip20.click();
      spotlight(chip20, '💰 Stake £20 — the higher the stake, the louder the motivation!', 'top');
    }
  }

  function demoSliderStake() {
    const slider = document.getElementById('stakeSlider');
    if (!slider) return;
    // Animate slider from 20 → 25
    let val = 20;
    const iv = setInterval(() => {
      val++;
      slider.value = val;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      if (val >= 25) clearInterval(iv);
    }, 60);
    spotlight(slider, '🎚️ Drag to dial in the exact pain level', 'top');
  }

  function demoLossEquivalent() {
    const pill = document.getElementById('lossEquivalentPill');
    spotlight(pill, '🍕 Real-world equivalency — makes the loss tangible', 'top');
    // Pulse it
    if (pill) {
      pill.style.transform = 'scale(1.04)';
      pill.style.transition = 'transform 0.2s';
      setTimeout(() => { pill.style.transform = ''; }, 800);
    }
  }

  function demoBeerPot() {
    // Click the Friday Beer Pot destination card
    const card = document.querySelector('.dest-pill-card[data-target="drinks"]');
    if (card) {
      card.click();
      spotlight(card, '🍺 Friday Beer Pot — forfeit funds the flat pub night!', 'top');
    }
  }

  function demoLockIn() {
    const btn = document.getElementById('saveAlarmBtn');
    if (!btn) return;
    spotlight(btn, '🔒 Lock In — escrow contract armed. No backing out!', 'top');
    // Visual press
    btn.style.transform = 'scale(0.97)';
    btn.style.transition = 'transform 0.15s';
    setTimeout(() => {
      btn.style.transform = '';
      btn.click();
    }, 400);
  }

  function demoNavWarRoom() {
    clickTab('tab-leaderboard');
    setTimeout(() => {
      const section = document.getElementById('tab-leaderboard');
      spotlight(section, '⚔️ Flat 4B War Room — communal beer kitty & Hall of Shame');
    }, 350);
  }

  function demoSimulateSnooze() {
    const btn = document.getElementById('addSimulatedSnoozeBtn');
    if (!btn) return;
    spotlight(btn, '💸 Dave just snoozed! +£5 straight into the pub kitty 🍻', 'top');
    setTimeout(() => btn.click(), 300);
  }

  function demoNavStreaks() {
    clickTab('tab-streak');
    setTimeout(() => {
      const grid = document.getElementById('streakCalendarGrid');
      spotlight(grid, '📅 30-day Discipline Heatmap — green = safe, red = forfeited');
    }, 400);
  }

  function demoStreakHeatmap() {
    const table = document.querySelector('.audit-table');
    if (table) {
      spotlight(table, '🔐 Immutable Verification Ledger — cryptographic wake log');
      table.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Also highlight stats cards
    setTimeout(() => {
      const statCard = document.querySelector('.metric-emerald');
      if (statCard) spotlight(statCard, '🛡️ £140 protected — real money saved by getting up!', 'top');
    }, 900);
  }

  function demoNavQR() {
    clickTab('tab-station');
    setTimeout(() => {
      const placard = document.getElementById('printableQrPlacard');
      spotlight(placard, '📷 Physical kitchen terminal — print & tape to your kettle!');
    }, 400);
  }

  function demoQRTerminal() {
    const printBtn = document.getElementById('printQrBtn');
    spotlight(printBtn, '🖨️ One-click high-res print for your kitchen or bathroom mirror', 'top');
    // Shimmer the QR code
    const qr = document.getElementById('qrCanvasHolder');
    if (qr) {
      qr.style.filter = 'drop-shadow(0 0 12px #00E599)';
      setTimeout(() => { qr.style.filter = ''; }, 1200);
    }
  }

  function demoNavPro() {
    clickTab('tab-pro');
    setTimeout(() => {
      const proCard = document.querySelector('.featured-tier');
      spotlight(proCard, '🚀 WakeStake Pro — House wars, GPS geo-fence & WhatsApp shame bot');
    }, 400);
  }

  function demoProTier() {
    const proBtn = document.getElementById('upgradeProBtn');
    spotlight(proBtn, '💳 Only £2.99/mo — free if you wake up on time. We only monetise snoozes!', 'top');
    // Animate the price card
    const featuredCard = document.querySelector('.featured-tier');
    if (featuredCard) {
      featuredCard.style.transform = 'scale(1.02)';
      featuredCard.style.transition = 'transform 0.25s';
      setTimeout(() => { featuredCard.style.transform = ''; }, 900);
    }
  }

  function demoNavAlarm() {
    clickTab('tab-alarm');
    setTimeout(() => {
      const simBtn = document.getElementById('triggerAlarmSimBtn');
      spotlight(simBtn, '⚡ Time for the big moment — the morning simulation!', 'top');
    }, 400);
  }

  function demoLaunchSim() {
    const btn = document.getElementById('triggerAlarmSimBtn');
    if (btn) {
      spotlight(btn, '🚨 LAUNCHING wake-up simulation! 5-minute grace clock starts…', 'top');
      setTimeout(() => btn.click(), 600);
    }
  }

  function demoDisarmQR() {
    // Emergency modal should be up — click disarm
    const disarmBtn = document.getElementById('openDisarmModalBtn');
    if (disarmBtn && document.getElementById('alarmModal').classList.contains('active')) {
      spotlight(disarmBtn, '🏃 I\'m out of bed! Opening QR verification scanner…', 'top');
      setTimeout(() => disarmBtn.click(), 700);
    }
  }

  function demoSkipToCelebration() {
    // Trigger QR scan success
    const scanBtn = document.getElementById('simulateQrScanSuccessBtn');
    if (scanBtn && document.getElementById('disarmModal').classList.contains('active')) {
      spotlight(scanBtn, '📷 Scanning kettle QR terminal… VERIFIED! Stake returned!', 'top');
      setTimeout(() => scanBtn.click(), 700);
    } else {
      // disarm modal may not be open; force success directly
      closeAllModals();
      // Manually trigger success via internal call if possible
      const celebModal = document.getElementById('celebrationModal');
      if (celebModal && !celebModal.classList.contains('active')) {
        // Show the celebration modal directly
        const savedStake = document.getElementById('savedStakeDisplay');
        const disarmTs = document.getElementById('disarmTimestamp');
        const newStreak = document.getElementById('newStreakDisplay');
        if (savedStake) savedStake.textContent = '25.00';
        if (disarmTs) disarmTs.textContent = 'Demo, just now';
        if (newStreak) newStreak.textContent = '15 Days 🔥';
        celebModal.classList.add('active');
        // Fire confetti manually
        const confettiEl = document.getElementById('confettiContainer');
        if (confettiEl) fireConfetti(confettiEl);
      }
    }
  }

  function demoComplete() {
    clearAllHighlights();
    clearAnnotations();
    const celebModal = document.getElementById('celebrationModal');

    // Ensure celebration modal is visible
    if (celebModal) {
      if (!celebModal.classList.contains('active')) {
        celebModal.classList.add('active');
        const confettiEl = document.getElementById('confettiContainer');
        if (confettiEl) fireConfetti(confettiEl);
      }
    }

    // Update the panel
    updatePanelLabel(`
      <strong style="color:#00E599">🎉 Demo Complete!</strong><br>
      <span style="color:#718096;font-size:0.72rem;">
        Full 2-min tour finished. WakeStake: loss-aversion that actually works.
      </span>
    `);
    updateProgressBar(100);

    // Show a big overlay banner
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
      z-index:99996;background:linear-gradient(135deg,rgba(0,229,153,0.95),rgba(0,180,120,0.95));
      color:#07090D;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;
      font-size:1rem;padding:16px 28px;border-radius:16px;
      box-shadow:0 8px 40px rgba(0,229,153,0.45);
      animation:wsAnnotIn 0.3s cubic-bezier(0.16,1,0.3,1);
      text-align:center;pointer-events:none;
    `;
    banner.innerHTML = `🛡️ WakeStake Demo Complete — Put Skin in the Game. Wake Up on Time.`;
    document.body.appendChild(banner);
    setTimeout(() => { banner.style.opacity='0'; banner.style.transition='opacity 0.5s'; }, 4000);
    setTimeout(() => banner.remove(), 4600);
  }

  // ─── CONFETTI (standalone, no dependency on internal app fn) ─────────────
  function fireConfetti(container) {
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#00E599','#FF2B4E','#F5A623','#00D2FF','#FFFFFF','#FFB020'];
    for (let i = 0; i < 45; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position:absolute;
        width:${Math.random()*8+5}px;
        height:${Math.random()*12+7}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:${Math.random()*100}%;
        top:${Math.random()*30}%;
        transform:rotate(${Math.random()*360}deg);
        border-radius:2px;
        animation:confettiFall ${0.8+Math.random()*0.8}s ease-out ${Math.random()*0.4}s forwards;
        opacity:1;
      `;
      container.appendChild(piece);
    }

    // Add keyframes if not already present
    if (!document.getElementById('ws-confetti-anim')) {
      const s = document.createElement('style');
      s.id = 'ws-confetti-anim';
      s.textContent = `
        @keyframes confettiFall {
          to { transform: translateY(180px) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }
  }

  // ─── AUTO-INIT ────────────────────────────────────────────────────────────
  function init() {
    injectControlPanel();
    console.log(
      '%c⚡ WakeStake Demo Mode Active',
      'background:#FF2B4E;color:#fff;font-size:14px;font-weight:bold;padding:4px 12px;border-radius:6px'
    );
    console.log('Click ▶ Start Demo in the floating panel to begin the 2-minute tour.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/**
 * WakeStake — The Loss-Aversion Alarm Clock That Actually Gets You Up
 * Core Interactive Application Engine
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. STATE & STORAGE MANAGEMENT
  // =========================================================================
  const STORAGE_KEY = 'wakestake_v1_state';

  const defaultState = {
    alarm: {
      time: '07:30',
      label: 'Econ 201 Midterm — Lecture Theatre A',
      stake: 10,
      destination: 'monzo', // 'monzo' | 'anticharity' | 'drinks'
      flatmateMonzo: 'jamie_flat4',
      antiCharity: 'millwall',
      verifyMethod: 'qr', // 'qr' | 'photo'
      isActive: true
    },
    userStats: {
      totalProtected: 140.00,
      currentStreak: 14,
      personalBest: 21,
      totalForfeited: 15.00,
      pubDonated: 10.00,
      totalSnoozes: 2
    },
    drinksFund: {
      amount: 45.00,
      goal: 60.00,
      flatName: 'Flat 4B'
    },
    leaderboard: [
      { id: '1', name: 'Sarah M.', streak: 19, protected: 95.00, forfeits: 0, tagline: 'Unstoppable 6:45 AM Machine', avatar: 'SM', rank: '🥇' },
      { id: '2', name: 'Alex (You)', streak: 14, protected: 140.00, forfeits: 15.00, tagline: 'Recovering Duvet Prisoner', avatar: 'AY', rank: '🥈', isUser: true },
      { id: '3', name: 'Liam K.', streak: 8, protected: 40.00, forfeits: 10.00, tagline: 'Bathroom QR Ninja', avatar: 'LK', rank: '🥉' },
      { id: '4', name: 'Dave T.', streak: 1, protected: 5.00, forfeits: 35.00, tagline: 'Drinks Fund Chief Sponsor 👑', avatar: 'DT', rank: '4' }
    ],
    flatActivity: [
      { id: 'act-1', text: 'Dave snoozed at 08:15 AM! £10 added to Drinks Fund 🍺', time: 'Yesterday', icon: '💸' },
      { id: 'act-2', text: 'Sarah scanned kettle QR at 06:45 AM. £5 protected 🛡️', time: 'Yesterday', icon: '⚡' },
      { id: 'act-3', text: 'Alex (You) disarmed at 07:31 AM. Streak: 14 days 🔥', time: 'Today', icon: '🎉' }
    ],
    auditLedger: [
      { date: '17 Oct 2026, 07:31', mission: 'Econ 201 Midterm', method: 'Kitchen QR', outcome: '+£10.00 Kept', target: 'Self (Protected)', status: 'Verified' },
      { date: '16 Oct 2026, 07:29', mission: 'Stats Problem Set', method: 'Kettle Photo', outcome: '+£10.00 Kept', target: 'Self (Protected)', status: 'Verified' },
      { date: '15 Oct 2026, 07:35', mission: 'Gym Legs Day', method: 'Snoozed 5m', outcome: '-£5.00 Forfeit', target: 'Drinks Fund 🍺', status: 'Deducted' },
      { date: '14 Oct 2026, 07:28', mission: 'Macro Seminar', method: 'Kitchen QR', outcome: '+£10.00 Kept', target: 'Self (Protected)', status: 'Verified' },
      { date: '13 Oct 2026, 07:30', mission: '9 AM Lab Prep', method: 'Kitchen QR', outcome: '+£10.00 Kept', target: 'Self (Protected)', status: 'Verified' }
    ]
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaultState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage error, using defaults', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Unable to persist to LocalStorage', e);
    }
  }

  // =========================================================================
  // 2. WEB AUDIO API SYNTHESIZER ENGINE (Loss-Aversion Sound Effects)
  // =========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.alarmLoopTimer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) {
        this.stopAlarmLoop();
      }
      return this.isMuted;
    }

    // High urgency alternating dual-frequency alarm siren
    playAlarmTone() {
      if (this.isMuted) return;
      this.init();

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Pitch sweep siren
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(700, now + 0.35);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(350, now + 0.35);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    }

    startAlarmLoop() {
      if (this.isMuted) return;
      this.stopAlarmLoop();
      this.playAlarmTone();
      this.alarmLoopTimer = setInterval(() => {
        this.playAlarmTone();
      }, 750);
    }

    stopAlarmLoop() {
      if (this.alarmLoopTimer) {
        clearInterval(this.alarmLoopTimer);
        this.alarmLoopTimer = null;
      }
    }

    // Ticking heartbeat countdown pulse
    playCountdownTick() {
      if (this.isMuted) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    }

    // Upbeat victory chime (Protected stake)
    playSuccessChime() {
      if (this.isMuted) return;
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.6);
      });
    }

    // Heavy downward penalty drop (Snooze loss)
    playForfeitDrop() {
      if (this.isMuted) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    }
  }

  const sound = new SoundEngine();

  // =========================================================================
  // 3. DOM ELEMENT REFERENCES
  // =========================================================================
  const DOM = {
    // Nav & Controls
    tabs: document.querySelectorAll('.tab-link, .nav-pill, .nav-tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    viewModeBtns: document.querySelectorAll('.view-btn, .view-opt'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIconOn: document.getElementById('soundIconOn'),
    soundIconOff: document.getElementById('soundIconOff'),
    soundWaveBars: document.getElementById('soundWaveBars'),
    soundStatusLabel: document.getElementById('soundStatusLabel'),
    triggerAlarmSimBtn: document.getElementById('triggerAlarmSimBtn'),
    previewLaunchSimBtn: document.getElementById('previewLaunchSimBtn'),
    headerPillText: document.getElementById('headerPillText'),
    navStreakBadge: document.getElementById('navStreakBadge'),
    navBeerBadge: document.getElementById('navBeerBadge'),
    deviceStatusTime: document.getElementById('deviceStatusTime'),

    // Tab 1: Form
    alarmTimeInput: document.getElementById('alarmTimeInput'),
    alarmLabelInput: document.getElementById('alarmLabelInput'),
    timeMinus15Btn: document.getElementById('timeMinus15Btn'),
    timePlus15Btn: document.getElementById('timePlus15Btn'),
    timePeriodTag: document.getElementById('timePeriodTag'),
    sleepDurationTag: document.getElementById('sleepDurationTag'),
    stakeDisplay: document.getElementById('stakeDisplay'),
    stakeChips: document.querySelectorAll('.stake-chip'),
    stakeSlider: document.getElementById('stakeSlider'),
    lossAversionBadge: document.getElementById('lossAversionBadge'),
    lossEquivalentPill: document.getElementById('lossEquivalentPill'),
    lossMeterFill: document.getElementById('lossMeterFill'),
    calloutStake: document.getElementById('calloutStake'),
    destCards: document.querySelectorAll('.dest-option-card, .dest-card-clean, .dest-pill-card'),
    destRadios: document.querySelectorAll('.dest-radio'),
    flatmateMonzoTag: document.getElementById('flatmateMonzoTag'),
    antiCharitySelect: document.getElementById('antiCharitySelect'),
    cardPotAmount: document.getElementById('cardPotAmount'),
    verifyChips: document.querySelectorAll('.verify-chip, .verify-btn-card, .verify-pill-card'),
    verifyRadios: document.querySelectorAll('.verify-radio'),
    saveAlarmBtn: document.getElementById('saveAlarmBtn'),
    saveBtnText: document.getElementById('saveBtnText'),

    // Live Threat Preview
    previewTime: document.getElementById('previewTime'),
    previewStake: document.getElementById('previewStake'),
    previewVerify: document.getElementById('previewVerify'),
    previewDestIcon: document.getElementById('previewDestIcon'),
    previewDestTitle: document.getElementById('previewDestTitle'),
    previewDestSub: document.getElementById('previewDestSub'),
    activeContractHud: document.getElementById('activeContractHud'),

    // Tab 2: Stats
    statProtected: document.getElementById('statProtected'),
    statStreak: document.getElementById('statStreak'),
    statForfeited: document.getElementById('statForfeited'),
    statPubDonated: document.getElementById('statPubDonated'),
    streakCalendarGrid: document.getElementById('streakCalendarGrid'),
    auditTableBody: document.getElementById('auditTableBody'),
    exportAuditBtn: document.getElementById('exportAuditBtn'),

    // Tab 3: Drinks & Leaderboard
    potDisplayAmount: document.getElementById('potDisplayAmount'),
    potBeersCalc: document.getElementById('potBeersCalc'),
    addSimulatedSnoozeBtn: document.getElementById('addSimulatedSnoozeBtn'),
    claimPotBtn: document.getElementById('claimPotBtn'),
    flatActivityFeed: document.getElementById('flatActivityFeed'),
    leaderboardList: document.getElementById('leaderboardList'),
    inviteFlatmateBtn: document.getElementById('inviteFlatmateBtn'),

    // Tab 4: QR Station
    qrCanvasHolder: document.getElementById('qrCanvasHolder'),
    printQrBtn: document.getElementById('printQrBtn'),
    testScanQrBtn: document.getElementById('testScanQrBtn'),

    // Tab 5: Pro
    upgradeProBtn: document.getElementById('upgradeProBtn'),
    dormDemoBtn: document.getElementById('dormDemoBtn'),

    // Emergency HUD Takeover
    alarmModal: document.getElementById('alarmModal'),
    activeAlarmReason: document.getElementById('activeAlarmReason'),
    activeClockTime: document.getElementById('activeClockTime'),
    activeStakeAmt: document.getElementById('activeStakeAmt'),
    graceTimerDigits: document.getElementById('graceTimerDigits'),
    graceProgressBar: document.getElementById('graceProgressBar'),
    activeBeneficiaryName: document.getElementById('activeBeneficiaryName'),
    snoozeDestLabel: document.getElementById('snoozeDestLabel'),
    openDisarmModalBtn: document.getElementById('openDisarmModalBtn'),
    snoozePenaltyBtn: document.getElementById('snoozePenaltyBtn'),
    testMuteBtn: document.getElementById('testMuteBtn'),
    closeEmergencyModalBtn: document.getElementById('closeEmergencyModalBtn'),

    // Disarm Verification Modal
    disarmModal: document.getElementById('disarmModal'),
    verifyStakeLabel: document.getElementById('verifyStakeLabel'),
    closeDisarmBtn: document.getElementById('closeDisarmBtn'),
    modeQrTab: document.getElementById('modeQrTab'),
    modePhotoTab: document.getElementById('modePhotoTab'),
    qrVerifyPanel: document.getElementById('qrVerifyPanel'),
    photoVerifyPanel: document.getElementById('photoVerifyPanel'),
    simulateQrScanSuccessBtn: document.getElementById('simulateQrScanSuccessBtn'),
    toggleWebcamBtn: document.getElementById('toggleWebcamBtn'),
    webcamVideo: document.getElementById('webcamVideo'),
    viewfinderPlaceholder: document.getElementById('viewfinderPlaceholder'),
    runAiPhotoVerificationBtn: document.getElementById('runAiPhotoVerificationBtn'),
    userPhotoInput: document.getElementById('userPhotoInput'),
    photoPreviewArea: document.getElementById('photoPreviewArea'),
    aiAnalysisOutput: document.getElementById('aiAnalysisOutput'),
    photoMetaLabel: document.getElementById('photoMetaLabel'),

    // Celebration Modal
    celebrationModal: document.getElementById('celebrationModal'),
    savedStakeDisplay: document.getElementById('savedStakeDisplay'),
    disarmTimestamp: document.getElementById('disarmTimestamp'),
    newStreakDisplay: document.getElementById('newStreakDisplay'),
    dismissCelebrationBtn: document.getElementById('dismissCelebrationBtn'),
    confettiContainer: document.getElementById('confettiContainer'),

    // Forfeit Modal
    forfeitModal: document.getElementById('forfeitModal'),
    forfeitStakeDisplay: document.getElementById('forfeitStakeDisplay'),
    receiptTimestamp: document.getElementById('receiptTimestamp'),
    receiptBeneficiary: document.getElementById('receiptBeneficiary'),
    dismissForfeitBtn: document.getElementById('dismissForfeitBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Grace Countdown variables
  let graceCountdownSecs = 300; // 5 minutes (300 seconds)
  let graceInterval = null;
  let emergencyClockInterval = null;
  let webcamStream = null;

  // =========================================================================
  // 4. UI INITIALIZATION & SYNC
  // =========================================================================
  function init() {
    renderTabs();
    renderFormFromState();
    updateThreatPreview();
    updateSleepDurationTag();
    updateDeviceClock();
    renderStats();
    renderCalendar();
    renderAuditLedger();
    renderDrinksFund();
    renderLeaderboard();
    renderFlatActivity();
    renderKitchenQrCode();
    bindEvents();
    startHeaderClock();
  }

  function renderFormFromState() {
    DOM.alarmTimeInput.value = state.alarm.time;
    DOM.alarmLabelInput.value = state.alarm.label;
    setStakeAmount(state.alarm.stake);

    // Destination
    DOM.destRadios.forEach(radio => {
      radio.checked = (radio.value === state.alarm.destination);
      const card = radio.closest('.dest-option-card');
      if (card) {
        card.classList.toggle('active', radio.checked);
      }
    });

    if (DOM.flatmateMonzoTag) DOM.flatmateMonzoTag.value = state.alarm.flatmateMonzo;
    if (DOM.antiCharitySelect) DOM.antiCharitySelect.value = state.alarm.antiCharity;

    // Verify method
    DOM.verifyRadios.forEach(radio => {
      radio.checked = (radio.value === state.alarm.verifyMethod);
      const chip = radio.closest('.verify-chip');
      if (chip) {
        chip.classList.toggle('active', radio.checked);
      }
    });
  }

  function getAntiCharityName(key) {
    const map = {
      millwall: 'Millwall FC Supporters Fund',
      rival_uni: 'Rival University Boat Club',
      pineapple_pizza: 'Pineapple On Pizza Lobby',
      landlord_tip: 'Voluntary Landlord Appreciation Fund'
    };
    return map[key] || 'Bitter Rival Fund';
  }

  function getBeneficiaryDetails() {
    const dest = state.alarm.destination;
    if (dest === 'monzo') {
      const tag = (DOM.flatmateMonzoTag ? DOM.flatmateMonzoTag.value : state.alarm.flatmateMonzo) || 'jamie_flat4';
      return {
        icon: '💳',
        title: `Flatmate Jamie (@${tag})`,
        subtitle: `Instantly transferred via Monzo Faster Payments to buy their lunch.`
      };
    } else if (dest === 'anticharity') {
      const acKey = (DOM.antiCharitySelect ? DOM.antiCharitySelect.value : state.alarm.antiCharity) || 'millwall';
      const name = getAntiCharityName(acKey);
      return {
        icon: '☠️',
        title: `${name}`,
        subtitle: `Forfeit penalty sent straight to your sworn enemy's account.`
      };
    } else {
      return {
        icon: '🍺',
        title: `Flat 4B Friday Beer Kitty`,
        subtitle: `Directly funds free pints of Camden Hells for your flatmates.`
      };
    }
  }

  function updateThreatPreview() {
    const stake = state.alarm.stake;
    const formattedStake = `£${stake.toFixed(2)}`;
    
    // Header pill
    if (DOM.headerPillText) {
      DOM.headerPillText.innerHTML = `Next: <strong>${state.alarm.time} AM</strong> (${formattedStake} Staked)`;
    }

    // Threat box & HUD
    if (DOM.previewTime) DOM.previewTime.textContent = `${state.alarm.time} AM`;
    if (DOM.previewStake) DOM.previewStake.textContent = formattedStake;
    if (DOM.previewVerify) DOM.previewVerify.textContent = state.alarm.verifyMethod === 'qr' ? 'Kitchen QR' : 'Kettle Photo';

    const ben = getBeneficiaryDetails();
    if (DOM.previewDestIcon) DOM.previewDestIcon.textContent = ben.icon;
    if (DOM.previewDestTitle) DOM.previewDestTitle.textContent = ben.title;
    if (DOM.previewDestSub) DOM.previewDestSub.textContent = ben.subtitle;

    // Save button label
    if (DOM.saveBtnText) {
      DOM.saveBtnText.textContent = `LOCK IN STAKE (${formattedStake} COMMITTED)`;
    }

    // Psych label & loss equivalency
    updateLossPsychology(stake);
  }

  function updateLossPsychology(amount) {
    let text = '⚡ Mild Sting';
    let eqText = '1 Flat White & Warm Croissant';
    let eqIcon = '☕';

    if (amount >= 100) {
      text = '☢️ Nuclear Forfeit';
      eqText = 'London to Edinburgh Return Train Ticket';
      eqIcon = '✈️';
    } else if (amount >= 50) {
      text = '☠️ Financial Heart Attack';
      eqText = 'Full Weekly Supermarket Grocery Shop';
      eqIcon = '🛒';
    } else if (amount >= 25) {
      text = '🚨 Severe Agony';
      eqText = 'Deliveroo Feast & Sides for Two';
      eqIcon = '🍕';
    } else if (amount >= 15) {
      text = '⚠️ Serious Pain';
      eqText = '3 Pints & Bar Snacks at the Pub';
      eqIcon = '🍻';
    } else if (amount >= 10) {
      text = '🔥 Definite Ouch';
      eqText = '2 Pints of Camden Hells at the Pub';
      eqIcon = '🍺';
    } else if (amount >= 5) {
      text = '⚡ Mild Sting';
      eqText = 'Specialty Flat White & Pastry';
      eqIcon = '☕';
    } else {
      text = '⚡ Gentle Nudge';
      eqText = 'Espresso Shot';
      eqIcon = '☕';
    }

    if (DOM.lossAversionBadge) DOM.lossAversionBadge.textContent = text;
    if (DOM.calloutStake) DOM.calloutStake.textContent = `£${amount.toFixed(2)}`;

    if (DOM.lossEquivalentPill) {
      DOM.lossEquivalentPill.innerHTML = `
        <span class="loss-eq-icon">${eqIcon}</span>
        <span class="loss-eq-text">Real-World Loss: <strong>${eqText}</strong></span>
      `;
    }

    if (DOM.lossMeterFill) {
      const fillPct = Math.min(100, Math.max(5, (amount / 100) * 100));
      DOM.lossMeterFill.style.width = `${fillPct}%`;
    }
  }

  function updateSleepDurationTag() {
    if (!DOM.sleepDurationTag || !state.alarm.time) return;
    
    const [alarmHrs, alarmMins] = state.alarm.time.split(':').map(Number);
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(alarmHrs, alarmMins, 0, 0);

    // If alarm is earlier than now, it's for tomorrow
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const diffMs = alarmDate - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Ideal bedtime for 8 hrs of rest
    const bedtime = new Date(alarmDate.getTime() - 8 * 60 * 60 * 1000);
    const bedHrs = String(bedtime.getHours()).padStart(2, '0');
    const bedMins = String(bedtime.getMinutes()).padStart(2, '0');

    DOM.sleepDurationTag.textContent = `⏰ In ${diffHrs}h ${diffMins}m (Sleep by ${bedHrs}:${bedMins} for 8h)`;
  }

  function adjustAlarmTime(deltaMinutes) {
    if (!state.alarm.time) return;
    const [h, m] = state.alarm.time.split(':').map(Number);
    let totalMinutes = h * 60 + m + deltaMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const newM = String(totalMinutes % 60).padStart(2, '0');
    const newTime = `${newH}:${newM}`;
    
    state.alarm.time = newTime;
    DOM.alarmTimeInput.value = newTime;

    // Remove active preset chips
    document.querySelectorAll('.preset-chips .chip').forEach(c => {
      c.classList.toggle('active', c.dataset.time === newTime);
    });

    updateThreatPreview();
    updateSleepDurationTag();
  }

  function setStakeAmount(amount) {
    amount = Math.max(2, Math.min(100, Math.round(amount)));
    state.alarm.stake = amount;
    DOM.stakeDisplay.textContent = amount;
    DOM.stakeSlider.value = amount;

    // Update preset chip highlights
    DOM.stakeChips.forEach(chip => {
      const chipAmt = parseInt(chip.dataset.amount, 10);
      chip.classList.toggle('active', chipAmt === amount);
    });

    updateThreatPreview();
  }

  function updateDeviceClock() {
    if (!DOM.deviceStatusTime) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    DOM.deviceStatusTime.textContent = `${hrs}:${mins}`;
  }

  // =========================================================================
  // 5. STATS, STREAKS & CALENDAR RENDERING
  // =========================================================================
  function renderStats() {
    DOM.statProtected.textContent = `£${state.userStats.totalProtected.toFixed(2)}`;
    DOM.statStreak.textContent = `${state.userStats.currentStreak} Days`;
    DOM.statForfeited.textContent = `£${state.userStats.totalForfeited.toFixed(2)}`;
    DOM.statPubDonated.textContent = `£${state.userStats.pubDonated.toFixed(2)}`;
    DOM.navStreakBadge.textContent = `${state.userStats.currentStreak}d`;
  }

  function renderCalendar() {
    const grid = DOM.streakCalendarGrid;
    grid.innerHTML = '';

    // Generate 30 days grid
    const totalDays = 28;
    const verifiedDaysCount = state.userStats.currentStreak;
    const forfeitDays = [5, 12]; // Simulated past forfeit days

    for (let i = 1; i <= totalDays; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      cell.textContent = i;

      if (forfeitDays.includes(i)) {
        cell.classList.add('forfeited');
        cell.title = `Day ${i}: Snoozed (£5 Forfeited to Flat Drinks Fund)`;
      } else if (i <= verifiedDaysCount) {
        cell.classList.add('verified');
        cell.title = `Day ${i}: Out of bed on-time! (£10 Protected)`;
      } else {
        cell.classList.add('upcoming');
        cell.title = `Day ${i}: Upcoming alarm`;
      }

      grid.appendChild(cell);
    }
  }

  function renderAuditLedger() {
    const tbody = DOM.auditTableBody;
    tbody.innerHTML = '';

    state.auditLedger.forEach(item => {
      const row = document.createElement('tr');
      const isPositive = item.outcome.startsWith('+');
      
      row.innerHTML = `
        <td><strong>${item.date}</strong></td>
        <td>${item.mission}</td>
        <td><span class="badge ${item.method.includes('QR') ? 'badge-emerald' : 'badge-pro'}">${item.method}</span></td>
        <td class="${isPositive ? 'text-emerald' : 'text-danger'}" style="font-family: var(--font-mono); font-weight: 800;">
          ${item.outcome}
        </td>
        <td>${item.target}</td>
        <td><span class="badge ${isPositive ? 'badge-emerald' : 'badge-danger'}">${item.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  // =========================================================================
  // 6. DRINKS FUND & LEADERBOARD RENDERING
  // =========================================================================
  function renderDrinksFund() {
    DOM.potDisplayAmount.textContent = state.drinksFund.amount.toFixed(2);
    DOM.cardPotAmount.textContent = `£${state.drinksFund.amount.toFixed(2)}`;
    DOM.navBeerBadge.textContent = `£${state.drinksFund.amount.toFixed(0)} Pot`;

    const pints = Math.floor(state.drinksFund.amount / 5.00);
    DOM.potBeersCalc.textContent = `≈ ${pints} Pints of Camden Hells 🍻`;

    const fillPercent = Math.min(100, Math.round((state.drinksFund.amount / state.drinksFund.goal) * 100));
    const fillBar = document.querySelector('.pot-progress-fill');
    if (fillBar) fillBar.style.width = `${fillPercent}%`;
  }

  function renderLeaderboard() {
    const list = DOM.leaderboardList;
    list.innerHTML = '';

    state.leaderboard.forEach(member => {
      const row = document.createElement('div');
      row.className = `leaderboard-row ${member.isUser ? 'user-row' : ''}`;
      
      row.innerHTML = `
        <div class="rank-badge">${member.rank}</div>
        <div class="avatar-initials">${member.avatar}</div>
        <div class="member-info">
          <div class="member-name">${member.name}</div>
          <div class="member-tagline">${member.tagline}</div>
        </div>
        <div class="member-stats">
          <div class="member-streak">🔥 ${member.streak} Days</div>
          <div class="member-forfeits">£${member.forfeits.toFixed(2)} Lost</div>
        </div>
      `;
      list.appendChild(row);
    });
  }

  function renderFlatActivity() {
    const feed = DOM.flatActivityFeed;
    feed.innerHTML = '';

    state.flatActivity.forEach(act => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <span class="item-icon">${act.icon}</span>
        <span class="item-text">${act.text}</span>
        <span class="item-time">${act.time}</span>
      `;
      feed.appendChild(item);
    });
  }

  // =========================================================================
  // 7. HIGH-CONTRAST KITCHEN QR CODE GENERATOR (SVG Vector)
  // =========================================================================
  function renderKitchenQrCode() {
    const holder = DOM.qrCanvasHolder;
    holder.innerHTML = `
      <svg viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="250" height="250" fill="white"/>
        <!-- Top Left Position Marker -->
        <rect x="20" y="20" width="60" height="60" fill="black"/>
        <rect x="30" y="30" width="40" height="40" fill="white"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        <!-- Top Right Position Marker -->
        <rect x="170" y="20" width="60" height="60" fill="black"/>
        <rect x="180" y="30" width="40" height="40" fill="white"/>
        <rect x="190" y="40" width="20" height="20" fill="black"/>
        <!-- Bottom Left Position Marker -->
        <rect x="20" y="170" width="60" height="60" fill="black"/>
        <rect x="30" y="180" width="40" height="40" fill="white"/>
        <rect x="40" y="190" width="20" height="20" fill="black"/>
        <!-- High Density Data Matrix Modules -->
        <rect x="90" y="25" width="10" height="10" fill="black"/>
        <rect x="110" y="25" width="20" height="10" fill="black"/>
        <rect x="140" y="25" width="10" height="10" fill="black"/>
        <rect x="90" y="45" width="30" height="10" fill="black"/>
        <rect x="130" y="45" width="10" height="10" fill="black"/>
        <rect x="150" y="45" width="10" height="10" fill="black"/>
        <rect x="100" y="65" width="20" height="10" fill="black"/>
        <rect x="130" y="65" width="20" height="10" fill="black"/>
        <!-- Middle Band -->
        <rect x="25" y="90" width="15" height="10" fill="black"/>
        <rect x="50" y="90" width="10" height="10" fill="black"/>
        <rect x="70" y="90" width="25" height="10" fill="black"/>
        <rect x="110" y="90" width="30" height="10" fill="black"/>
        <rect x="155" y="90" width="20" height="10" fill="black"/>
        <rect x="190" y="90" width="15" height="10" fill="black"/>
        <rect x="215" y="90" width="15" height="10" fill="black"/>
        
        <rect x="25" y="110" width="20" height="15" fill="black"/>
        <rect x="65" y="110" width="30" height="15" fill="black"/>
        <rect x="110" y="110" width="30" height="30" rx="4" fill="#FF2B4E"/>
        <text x="125" y="130" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">⚡</text>
        <rect x="155" y="110" width="20" height="15" fill="black"/>
        <rect x="190" y="110" width="35" height="15" fill="black"/>

        <rect x="25" y="135" width="15" height="15" fill="black"/>
        <rect x="55" y="135" width="25" height="15" fill="black"/>
        <rect x="90" y="135" width="10" height="15" fill="black"/>
        <rect x="150" y="135" width="35" height="15" fill="black"/>
        <rect x="200" y="135" width="25" height="15" fill="black"/>
        <!-- Bottom Band -->
        <rect x="90" y="170" width="20" height="15" fill="black"/>
        <rect x="120" y="170" width="15" height="15" fill="black"/>
        <rect x="145" y="170" width="30" height="15" fill="black"/>
        <rect x="185" y="170" width="15" height="15" fill="black"/>
        <rect x="210" y="170" width="20" height="15" fill="black"/>
        
        <rect x="90" y="195" width="15" height="20" fill="black"/>
        <rect x="115" y="195" width="25" height="20" fill="black"/>
        <rect x="150" y="195" width="20" height="20" fill="black"/>
        <rect x="180" y="195" width="30" height="20" fill="black"/>
        <rect x="220" y="195" width="10" height="20" fill="black"/>
      </svg>
    `;
  }

  // =========================================================================
  // 8. EMERGENCY MORNING ALARM TAKEOVER SIMULATOR
  // =========================================================================
  function launchEmergencySimulator() {
    // Reset grace countdown
    graceCountdownSecs = 300; // 5:00
    updateGraceCountdownDisplay();

    // Populate HUD
    DOM.activeAlarmReason.textContent = state.alarm.label;
    DOM.activeStakeAmt.textContent = state.alarm.stake.toFixed(2);
    DOM.verifyStakeLabel.textContent = `£${state.alarm.stake.toFixed(2)}`;

    const ben = getBeneficiaryDetails();
    DOM.activeBeneficiaryName.textContent = ben.title;
    DOM.snoozeDestLabel.textContent = ben.title;

    // Show modal takeover
    DOM.alarmModal.classList.add('active');
    DOM.alarmModal.setAttribute('aria-hidden', 'false');

    // Start Alarm Siren Sound Loop
    sound.startAlarmLoop();
    DOM.testMuteBtn.textContent = '🔊 Siren Blaring (Click to Silence)';

    // Start interval
    clearInterval(graceInterval);
    graceInterval = setInterval(() => {
      graceCountdownSecs--;
      updateGraceCountdownDisplay();

      // Sound pulse every few seconds or last minute
      if (graceCountdownSecs % 5 === 0 || graceCountdownSecs <= 60) {
        sound.playCountdownTick();
      }

      // If time expires, automatic forfeit!
      if (graceCountdownSecs <= 0) {
        clearInterval(graceInterval);
        handleForfeitTrigger('Grace period expired (5m exceeded)');
      }
    }, 1000);

    // Live Clock display
    startEmergencyClock();
  }

  function startEmergencyClock() {
    clearInterval(emergencyClockInterval);
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      DOM.activeClockTime.textContent = `${hrs}:${mins}:${secs}`;
    };
    updateTime();
    emergencyClockInterval = setInterval(updateTime, 1000);
  }

  function updateGraceCountdownDisplay() {
    const mins = Math.floor(graceCountdownSecs / 60);
    const secs = graceCountdownSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    DOM.graceTimerDigits.textContent = formatted;

    const percent = (graceCountdownSecs / 300) * 100;
    DOM.graceProgressBar.style.width = `${percent}%`;

    if (graceCountdownSecs < 60) {
      DOM.graceProgressBar.style.background = 'var(--crimson-hazard)';
    } else {
      DOM.graceProgressBar.style.background = 'linear-gradient(90deg, var(--emerald-protected), var(--crimson-hazard))';
    }
  }

  function closeEmergencyModal() {
    clearInterval(graceInterval);
    clearInterval(emergencyClockInterval);
    sound.stopAlarmLoop();
    DOM.alarmModal.classList.remove('active');
    DOM.alarmModal.setAttribute('aria-hidden', 'true');
  }

  // =========================================================================
  // 9. SNOOZE PENALTY HANDLER (Loss-Aversion Enforcement)
  // =========================================================================
  function handleSnoozePenalty() {
    sound.stopAlarmLoop();
    sound.playForfeitDrop();

    const stakeAmt = state.alarm.stake;
    const ben = getBeneficiaryDetails();

    // Deduct stake & update stats
    state.userStats.totalForfeited += stakeAmt;
    state.userStats.totalSnoozes += 1;
    state.userStats.currentStreak = 0; // Reset streak on snooze penalty

    // If destination is drinks fund, add to communal pot
    if (state.alarm.destination === 'drinks') {
      const flatKittyAddition = stakeAmt * 0.90; // 90% to kitty, 10% platform fee
      state.drinksFund.amount += flatKittyAddition;
      state.userStats.pubDonated += flatKittyAddition;
    }

    // Add activity entry
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.flatActivity.unshift({
      id: `act-${Date.now()}`,
      text: `Alex (You) just snoozed at ${timeNow}! £${stakeAmt.toFixed(2)} sent to ${ben.title} 💸`,
      time: 'Just now',
      icon: '🚨'
    });

    // Add audit entry
    state.auditLedger.unshift({
      date: `Today, ${timeNow}`,
      mission: state.alarm.label,
      method: 'Snooze Penalty',
      outcome: `-£${stakeAmt.toFixed(2)} Lost`,
      target: ben.title,
      status: 'Forfeited'
    });

    saveState();
    renderStats();
    renderCalendar();
    renderDrinksFund();
    renderAuditLedger();
    renderFlatActivity();

    // Show Forfeit Settlement Receipt Modal
    closeEmergencyModal();
    DOM.forfeitStakeDisplay.textContent = stakeAmt.toFixed(2);
    DOM.receiptBeneficiary.textContent = ben.title;
    DOM.receiptTimestamp.textContent = `Today, ${timeNow}`;
    DOM.forfeitModal.classList.add('active');

    showToast(`💸 £${stakeAmt.toFixed(2)} docked! Sent to ${ben.title}`, 'toast-danger');
  }

  function handleForfeitTrigger(reasonText) {
    handleSnoozePenalty();
  }

  // =========================================================================
  // 10. DISARM VERIFICATION ENGINE (QR Scanner & AI Photo Analyzer)
  // =========================================================================
  function openDisarmModal() {
    DOM.disarmModal.classList.add('active');
    DOM.disarmModal.setAttribute('aria-hidden', 'false');

    // Default to whatever method is set in state
    if (state.alarm.verifyMethod === 'photo') {
      switchToPhotoTab();
    } else {
      switchToQrTab();
    }
  }

  function closeDisarmModal() {
    stopWebcamStream();
    DOM.disarmModal.classList.remove('active');
    DOM.disarmModal.setAttribute('aria-hidden', 'true');
  }

  function switchToQrTab() {
    DOM.modeQrTab.classList.add('active');
    DOM.modePhotoTab.classList.remove('active');
    DOM.qrVerifyPanel.classList.add('active');
    DOM.photoVerifyPanel.classList.remove('active');
  }

  function switchToPhotoTab() {
    DOM.modePhotoTab.classList.add('active');
    DOM.modeQrTab.classList.remove('active');
    DOM.photoVerifyPanel.classList.add('active');
    DOM.qrVerifyPanel.classList.remove('active');
  }

  // Physical Webcam integration with fallback
  function toggleWebcam() {
    if (webcamStream) {
      stopWebcamStream();
      DOM.toggleWebcamBtn.textContent = 'Enable Physical Webcam';
      DOM.viewfinderPlaceholder.classList.remove('hidden');
      DOM.webcamVideo.classList.add('hidden');
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            webcamStream = stream;
            DOM.webcamVideo.srcObject = stream;
            DOM.webcamVideo.classList.remove('hidden');
            DOM.viewfinderPlaceholder.classList.add('hidden');
            DOM.toggleWebcamBtn.textContent = 'Disable Physical Webcam';
            showToast('Webcam active! Align camera to kitchen QR terminal', 'toast-success');
          })
          .catch(err => {
            console.warn('Webcam access error', err);
            showToast('Webcam permission not granted. Use instant simulator button.', 'toast-warning');
          });
      } else {
        showToast('Webcam API not supported in this browser environment', 'toast-warning');
      }
    }
  }

  function stopWebcamStream() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
  }

  // Celebration Confetti Animation
  function triggerConfettiBurst() {
    if (!DOM.confettiContainer) return;
    DOM.confettiContainer.innerHTML = '';
    const colors = ['#00E599', '#FF2B4E', '#F5A623', '#00D2FF', '#FFFFFF', '#FFB020'];

    for (let i = 0; i < 35; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti-piece';
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.left = `${Math.random() * 100}%`;
      conf.style.top = `${Math.random() * 20}%`;
      conf.style.transform = `rotate(${Math.random() * 360}deg)`;
      conf.style.animationDelay = `${Math.random() * 0.4}s`;
      conf.style.width = `${Math.random() * 8 + 6}px`;
      conf.style.height = `${Math.random() * 12 + 8}px`;
      DOM.confettiContainer.appendChild(conf);
    }
  }

  // Successful Disarm Flow (Both QR and Photo)
  function handleDisarmSuccess(verificationType) {
    stopWebcamStream();
    sound.stopAlarmLoop();
    sound.playSuccessChime();

    const stakeAmt = state.alarm.stake;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update stats: Money Protected & Streak increment
    state.userStats.totalProtected += stakeAmt;
    state.userStats.currentStreak += 1;
    if (state.userStats.currentStreak > state.userStats.personalBest) {
      state.userStats.personalBest = state.userStats.currentStreak;
    }

    // Update leaderboard member
    const userMember = state.leaderboard.find(m => m.isUser);
    if (userMember) {
      userMember.streak = state.userStats.currentStreak;
      userMember.protected = state.userStats.totalProtected;
    }

    // Add activity entry
    state.flatActivity.unshift({
      id: `act-${Date.now()}`,
      text: `Alex (You) verified via ${verificationType} at ${timeNow}! £${stakeAmt.toFixed(2)} protected 🛡️`,
      time: 'Just now',
      icon: '🎉'
    });

    // Add audit entry
    state.auditLedger.unshift({
      date: `Today, ${timeNow}`,
      mission: state.alarm.label,
      method: verificationType,
      outcome: `+£${stakeAmt.toFixed(2)} Kept`,
      target: 'Self (Protected)',
      status: 'Verified'
    });

    saveState();
    renderStats();
    renderCalendar();
    renderAuditLedger();
    renderLeaderboard();
    renderFlatActivity();

    // Close modals and open celebration modal
    closeDisarmModal();
    closeEmergencyModal();

    DOM.savedStakeDisplay.textContent = stakeAmt.toFixed(2);
    DOM.disarmTimestamp.textContent = timeNow;
    DOM.newStreakDisplay.textContent = `${state.userStats.currentStreak} Days`;
    DOM.celebrationModal.classList.add('active');

    triggerConfettiBurst();
    showToast(`🎉 Stake Protected! +£${stakeAmt.toFixed(2)} defended!`, 'toast-success');
  }

  // Photo AI Computer Vision Verification Sequence
  function runPhotoAiAnalysis() {
    const output = DOM.aiAnalysisOutput;
    output.classList.remove('hidden');
    DOM.runAiPhotoVerificationBtn.disabled = true;
    DOM.runAiPhotoVerificationBtn.textContent = '🧠 Analyzing Neural Signatures...';

    const step1 = document.getElementById('aiStep1');
    const step2 = document.getElementById('aiStep2');
    const step3 = document.getElementById('aiStep3');

    step1.style.opacity = '0.3';
    step2.style.opacity = '0.3';
    step3.style.opacity = '0.3';

    // Step 1
    setTimeout(() => {
      step1.style.opacity = '1';
      sound.playCountdownTick();
    }, 400);

    // Step 2
    setTimeout(() => {
      step2.style.opacity = '1';
      sound.playCountdownTick();
    }, 1000);

    // Step 3 & Success
    setTimeout(() => {
      step3.style.opacity = '1';
      DOM.runAiPhotoVerificationBtn.disabled = false;
      DOM.runAiPhotoVerificationBtn.textContent = 'Verified! Disarming Alarm...';
      
      setTimeout(() => {
        handleDisarmSuccess('Kettle Photo AI');
      }, 500);
    }, 1600);
  }

  // =========================================================================
  // 11. TAB & VIEWPORT SWITCHING
  // =========================================================================
  function renderTabs() {
    const tabButtons = document.querySelectorAll('.tab-link, .nav-pill, .nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.dataset.tab;
        if (!targetId) return;

        tabButtons.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach(pane => pane.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  function startHeaderClock() {
    setInterval(() => {
      const now = new Date();
      if (DOM.timePeriodTag) {
        DOM.timePeriodTag.textContent = (now.getHours() >= 12) ? 'Tomorrow Morning' : 'Today';
      }
      updateSleepDurationTag();
      updateDeviceClock();
    }, 30000);
  }

  // =========================================================================
  // 12. TOAST NOTIFICATION ENGINE
  // =========================================================================
  function showToast(message, type = 'toast-info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // =========================================================================
  // 13. EVENT LISTENERS
  // =========================================================================
  function bindEvents() {
    // Sound Toggle in Header
    DOM.soundToggleBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      DOM.soundIconOn.classList.toggle('hidden', isMuted);
      DOM.soundIconOff.classList.toggle('hidden', !isMuted);
      if (DOM.soundWaveBars) {
        DOM.soundWaveBars.style.display = isMuted ? 'none' : 'flex';
      }
      DOM.soundStatusLabel.textContent = isMuted ? 'Muted' : 'Audio Active';
      showToast(isMuted ? '🔇 Audio muted' : '🔊 Loss-aversion siren synthesizer ready!', 'toast-info');
    });

    // View Mode Toggle (Desktop vs Phone Mockup)
    DOM.viewModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.viewModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        document.body.classList.toggle('mode-mobile-frame', mode === 'mobile');
        showToast(mode === 'mobile' ? 'Switched to Mobile Phone Frame' : 'Command Center View Active', 'toast-info');
      });
    });

    // Steppers (-15m and +15m)
    if (DOM.timeMinus15Btn) {
      DOM.timeMinus15Btn.addEventListener('click', () => adjustAlarmTime(-15));
    }
    if (DOM.timePlus15Btn) {
      DOM.timePlus15Btn.addEventListener('click', () => adjustAlarmTime(15));
    }

    // Time Presets
    document.querySelectorAll('.preset-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const timeVal = chip.dataset.time;
        DOM.alarmTimeInput.value = timeVal;
        state.alarm.time = timeVal;
        updateThreatPreview();
        updateSleepDurationTag();
      });
    });

    DOM.alarmTimeInput.addEventListener('change', (e) => {
      state.alarm.time = e.target.value;
      updateThreatPreview();
      updateSleepDurationTag();
    });

    DOM.alarmLabelInput.addEventListener('input', (e) => {
      state.alarm.label = e.target.value;
    });

    // Stake Chips & Slider
    DOM.stakeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.classList.contains('custom-chip')) {
          const custom = prompt('Enter your custom stake in £ (Min £2, Max £100):', '25');
          if (custom && !isNaN(custom)) {
            setStakeAmount(parseFloat(custom));
          }
        } else {
          setStakeAmount(parseFloat(chip.dataset.amount));
        }
      });
    });

    DOM.stakeSlider.addEventListener('input', (e) => {
      setStakeAmount(parseFloat(e.target.value));
    });

    // Stake Destination Radio Cards
    const destCards = document.querySelectorAll('.dest-option-card, .dest-card-clean, .dest-pill-card');
    destCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent event duplication from sub-inputs
        if (e.target.tagName === 'INPUT' && e.target.type !== 'radio' || e.target.tagName === 'SELECT') {
          return;
        }
        const radio = card.querySelector('.dest-radio');
        if (radio) {
          radio.checked = true;
          state.alarm.destination = radio.value;
          destCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          updateThreatPreview();
        }
      });
    });

    if (DOM.flatmateMonzoTag) {
      DOM.flatmateMonzoTag.addEventListener('input', (e) => {
        state.alarm.flatmateMonzo = e.target.value;
        updateThreatPreview();
      });
    }

    if (DOM.antiCharitySelect) {
      DOM.antiCharitySelect.addEventListener('change', (e) => {
        state.alarm.antiCharity = e.target.value;
        updateThreatPreview();
      });
    }

    // Verification Chips
    const verifyCards = document.querySelectorAll('.verify-chip, .verify-btn-card, .verify-pill-card');
    verifyCards.forEach(chip => {
      chip.addEventListener('click', () => {
        const radio = chip.querySelector('.verify-radio');
        if (radio) {
          radio.checked = true;
          state.alarm.verifyMethod = radio.value;
          verifyCards.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          updateThreatPreview();
        }
      });
    });

    // Save Alarm Button
    DOM.saveAlarmBtn.addEventListener('click', () => {
      saveState();
      sound.init();
      showToast(`🔒 Contract locked! £${state.alarm.stake.toFixed(2)} staked for ${state.alarm.time} AM.`, 'toast-success');
    });

    // Emergency Alarm Simulator Triggers
    DOM.triggerAlarmSimBtn.addEventListener('click', launchEmergencySimulator);
    if (DOM.previewLaunchSimBtn) {
      DOM.previewLaunchSimBtn.addEventListener('click', launchEmergencySimulator);
    }

    // Emergency HUD Buttons
    DOM.openDisarmModalBtn.addEventListener('click', openDisarmModal);
    DOM.snoozePenaltyBtn.addEventListener('click', handleSnoozePenalty);
    DOM.testMuteBtn.addEventListener('click', () => {
      sound.stopAlarmLoop();
      DOM.testMuteBtn.textContent = 'Siren Silenced';
    });
    DOM.closeEmergencyModalBtn.addEventListener('click', closeEmergencyModal);

    // Disarm Modal Tabs & Actions
    DOM.modeQrTab.addEventListener('click', switchToQrTab);
    DOM.modePhotoTab.addEventListener('click', switchToPhotoTab);
    DOM.closeDisarmBtn.addEventListener('click', closeDisarmModal);
    DOM.simulateQrScanSuccessBtn.addEventListener('click', () => handleDisarmSuccess('Kitchen QR Code'));
    DOM.toggleWebcamBtn.addEventListener('click', toggleWebcam);
    DOM.runAiPhotoVerificationBtn.addEventListener('click', runPhotoAiAnalysis);

    // User photo file upload
    DOM.userPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          DOM.photoPreviewArea.innerHTML = `<img src="${event.target.result}" style="max-width:100%; max-height:200px; border-radius:12px; object-fit:contain;" alt="Uploaded evidence">`;
          DOM.photoMetaLabel.textContent = `Evidence Uploaded: ${file.name}`;
          showToast('Custom photo loaded! Ready for neural verification.', 'toast-info');
        };
        reader.readAsDataURL(file);
      }
    });

    // Modal Dismissals
    DOM.dismissCelebrationBtn.addEventListener('click', () => {
      DOM.celebrationModal.classList.remove('active');
    });

    DOM.dismissForfeitBtn.addEventListener('click', () => {
      DOM.forfeitModal.classList.remove('active');
    });

    // Keyboard ESC shortcut to close any active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.disarmModal.classList.contains('active')) closeDisarmModal();
        else if (DOM.alarmModal.classList.contains('active')) closeEmergencyModal();
        else if (DOM.celebrationModal.classList.contains('active')) DOM.celebrationModal.classList.remove('active');
        else if (DOM.forfeitModal.classList.contains('active')) DOM.forfeitModal.classList.remove('active');
      }
    });

    // Flatmate War Room: Simulate Dave Snoozing
    DOM.addSimulatedSnoozeBtn.addEventListener('click', () => {
      state.drinksFund.amount += 5.00;
      state.flatActivity.unshift({
        id: `act-${Date.now()}`,
        text: `Dave snoozed again! £5.00 transferred to Friday Beer Kitty 🍺`,
        time: 'Just now',
        icon: '🍻'
      });
      renderDrinksFund();
      renderFlatActivity();
      sound.playSuccessChime();
      showToast('🍻 Dave snoozed! +£5.00 added to Friday pub kitty!', 'toast-success');
    });

    DOM.claimPotBtn.addEventListener('click', () => {
      alert(`Communal Pot Settlement for ${state.drinksFund.flatName}:\nCurrent Kitty: £${state.drinksFund.amount.toFixed(2)}\nPints Covered: ${Math.floor(state.drinksFund.amount / 5.00)}\nTop Sponsor: Dave T. (£35.00 donated)\nReady for Friday evening settlement at The Crown & Anchor! 🍻`);
    });

    DOM.inviteFlatmateBtn.addEventListener('click', () => {
      const inviteUrl = 'https://wakestake.app/join/flat-4b-war-room';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl);
        showToast('📋 Flat invite link copied to clipboard!', 'toast-success');
      } else {
        prompt('Copy your Flatmate War Room invite link:', inviteUrl);
      }
    });

    // Kitchen QR Station Print & Test
    DOM.printQrBtn.addEventListener('click', () => {
      window.print();
    });

    DOM.testScanQrBtn.addEventListener('click', () => {
      openDisarmModal();
      switchToQrTab();
    });

    // Business & Pro Buttons
    DOM.upgradeProBtn.addEventListener('click', () => {
      showToast('🚀 Welcome to WakeStake Pro! 14-day free trial activated.', 'toast-success');
    });

    DOM.dormDemoBtn.addEventListener('click', () => {
      alert('Campus Hall Pass Demo Request:\nWakeStake for University Halls & Rowing Squads.\nOur campus team will email your student union committee with a trial package!');
    });

    DOM.exportAuditBtn.addEventListener('click', () => {
      const csv = 'Date,Mission,Method,Outcome,Target,Status\n' +
        state.auditLedger.map(i => `"${i.date}","${i.mission}","${i.method}","${i.outcome}","${i.target}","${i.status}"`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wakestake-audit-ledger.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('📁 Audit ledger exported as CSV!', 'toast-info');
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

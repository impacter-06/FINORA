'use strict';

// ─── STATE ────────────────────────────────────────────
const STATE = {
  xp: 0,
  level: 1,
  completedLessons: new Set(),
  currentLesson: null,
  currentSlide: 0,
  budgetData: null,
  csvData: [],
  categoryChart: null,
  cashflowChart: null,
  tgToken: '',
  tgChatId: '',
};

// persist across refreshes
(function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('ssi_state') || '{}');
    if (saved.xp)       STATE.xp = saved.xp;
    if (saved.level)    STATE.level = saved.level;
    if (saved.completed) STATE.completedLessons = new Set(saved.completed);
    if (saved.tgToken)  STATE.tgToken = saved.tgToken;
    if (saved.tgChatId) STATE.tgChatId = saved.tgChatId;
  } catch (e) {}
})();

function saveState() {
  localStorage.setItem('ssi_state', JSON.stringify({
    xp: STATE.xp,
    level: STATE.level,
    completed: [...STATE.completedLessons],
    tgToken: STATE.tgToken,
    tgChatId: STATE.tgChatId,
  }));
}

// ─── DATA: LESSONS ────────────────────────────────────
const LESSONS = [
  {
    id: 'saving',
    icon: '🐷',
    name: 'Saving Basics',
    xp: 20,
    color: '#E8F5F0',
    slides: [
      {
        emoji: '🐷',
        title: 'Why Should You Save?',
        body: 'Saving means keeping some of your money aside for the future. Even small amounts add up over time — like drops of water filling a bucket!',
        tips: { heading: '💡 Key Points', items: ['Save at least 10–20% of your income', 'Pay yourself first before spending', 'An emergency fund = 3–6 months of expenses'] },
      },
      {
        emoji: '🏦',
        title: 'Where to Save?',
        body: 'A Savings Bank Account is the safest place to start. In India, banks give 2.5–4% interest per year on savings accounts.',
        tips: { heading: '🏦 Good Options', items: ['Savings Account (SBI, HDFC, etc.)', 'Recurring Deposit (RD) – save monthly', 'Post Office Savings Scheme'] },
      },
      {
        emoji: '🎯',
        title: 'The Golden Rule',
        body: 'The 50/30/20 rule: Use 50% for needs (food, rent, bills), 30% for wants (fun, gadgets), and 20% for savings. Start small and increase over time!',
        tips: null,
      },
    ],
    quiz: {
      question: 'What percentage of income should you ideally save each month?',
      options: ['5%', '10–20%', '50%', '1%'],
      correct: 1,
      explanation: 'Experts suggest saving at least 10–20% of your monthly income to build a strong financial base.',
    },
  },
  {
    id: 'budgeting',
    icon: '📋',
    name: 'Budgeting 101',
    xp: 20,
    color: '#EEF2FF',
    slides: [
      {
        emoji: '📋',
        title: 'What is a Budget?',
        body: 'A budget is a simple plan for how you spend your money. It helps you know where your money goes every month — no more surprise empty wallets!',
        tips: { heading: '📋 Budget Basics', items: ['Track every rupee you earn & spend', 'Separate needs from wants', 'Review your budget every month'] },
      },
      {
        emoji: '✍️',
        title: 'How to Make a Budget',
        body: 'Step 1: Write down your monthly income. Step 2: List all your fixed expenses (rent, EMI). Step 3: List variable expenses (food, fun). Step 4: Calculate what is left!',
        tips: { heading: '✅ Pro Tips', items: ['Use our Smart Budget tool in the app', 'Keep a small "oops" fund for surprises', 'Avoid lifestyle inflation'] },
      },
    ],
    quiz: {
      question: 'What is the first step to making a budget?',
      options: ['Buy things on EMI', 'Write down your monthly income', 'Spend freely', 'Take a loan'],
      correct: 1,
      explanation: 'You always start a budget by knowing how much money you earn each month. Then plan your spending!',
    },
  },
  {
    id: 'loans',
    icon: '🏦',
    name: 'Loans & Interest',
    xp: 25,
    color: '#FEF9EC',
    slides: [
      {
        emoji: '🏦',
        title: 'What is a Loan?',
        body: 'A loan is borrowed money that you must pay back with extra charges called Interest. Banks, NBFCs, and microfinance groups give loans in India.',
        tips: { heading: '⚠️ Watch Out', items: ['Always read the interest rate (APR)', 'Avoid loan sharks / chit fund traps', 'Compare banks before taking a loan'] },
      },
      {
        emoji: '📉',
        title: 'How Interest Works',
        body: 'If you borrow ₹10,000 at 12% per year, you pay ₹1,200 extra after one year. The longer you take to repay, the more you pay! Always repay on time.',
        tips: { heading: '💡 Good vs Bad Debt', items: ['Good debt: Home loan, Education loan', 'Bad debt: Credit card debt at 36–48% p.a.', 'Avoid payday loans — very expensive!'] },
      },
      {
        emoji: '📊',
        title: 'EMI Made Simple',
        body: 'EMI = Equated Monthly Instalment. It is a fixed amount you pay every month to clear your loan. EMI = (Principal + Interest) ÷ Months.',
        tips: null,
      },
    ],
    quiz: {
      question: 'You borrow ₹10,000 at 10% annual interest. How much do you pay back in 1 year?',
      options: ['₹10,000', '₹11,000', '₹9,000', '₹12,500'],
      correct: 1,
      explanation: '10% of ₹10,000 = ₹1,000 interest. So total repayment = ₹10,000 + ₹1,000 = ₹11,000.',
    },
  },
  {
    id: 'investing',
    icon: '🚀',
    name: 'Investing Basics',
    xp: 30,
    color: '#F0FDF4',
    slides: [
      {
        emoji: '🚀',
        title: 'Why Invest?',
        body: 'Saving keeps money safe. Investing makes money grow! When you invest, your money earns more money over time — this is called the Power of Compounding.',
        tips: { heading: '🌱 Start Small', items: ['SIP in Mutual Funds from ₹100/month', 'PPF: safe government savings', 'Fixed Deposits: low risk, stable returns'] },
      },
      {
        emoji: '⏳',
        title: 'The Magic of Compounding',
        body: 'If you invest ₹1,000/month for 20 years at 12% return, you could grow it to over ₹9 lakh! The key is to start EARLY and stay CONSISTENT.',
        tips: { heading: '🧠 Remember', items: ['Higher return = higher risk', 'Never invest money you cannot afford to lose', 'Diversify across different investments'] },
      },
    ],
    quiz: {
      question: 'What does "Power of Compounding" mean?',
      options: ['Spending fast', 'Your interest earns more interest over time', 'Taking large loans', 'Keeping cash at home'],
      correct: 1,
      explanation: 'Compounding means you earn returns on your original investment AND on the previous returns — your money multiplies faster!',
    },
  },
];

// ─── DATA: INVESTMENTS ────────────────────────────────
const INVESTMENTS = [
  {
    icon: '📊', bg: '#EEF2FF', name: 'Mutual Funds', type: 'Market-linked',
    risk: 'medium', riskLabel: '🟡 Medium Risk', returns: '10–15% p.a.',
    desc: 'A pool of money collected from many investors, managed by professionals. Invested in stocks, bonds, or both.',
    detail: 'SIP from ₹100/month. SEBI-regulated. Types: Equity, Debt, Hybrid.',
    links: [
      { label:'Groww',       url:'https://groww.in/mutual-funds',             color:'#00D09C' },
      { label:'Zerodha Coin',url:'https://coin.zerodha.com',                  color:'#387ED1' },
      { label:'Upstox MF',   url:'https://upstox.com/mutual-fund/',           color:'#6C63FF' },
      { label:'ET Money',    url:'https://www.etmoney.com/mutual-funds',      color:'#E85D04' },
      { label:'ICICI Pru',   url:'https://www.icicipruamc.com',               color:'#E31C3D' },
    ],
  },
  {
    icon: '🏛️', bg: '#F0FDF4', name: 'Fixed Deposits', type: 'Bank / Post Office',
    risk: 'low', riskLabel: '🟢 Low Risk', returns: '6–8% p.a.',
    desc: 'Deposit a lump sum with a bank for a fixed period. Guaranteed interest — very safe!',
    detail: 'DICGC insured up to ₹5 lakh. Tenure: 7 days–10 years. Senior citizens get 0.5% extra.',
    links: [
      { label:'SBI FD',    url:'https://retail.onlinesbi.sbi/retail/login.htm',                                              color:'#1A3C8F' },
      { label:'HDFC Bank', url:'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit',                             color:'#004C8F' },
      { label:'ICICI Bank',url:'https://www.icicibank.com/personal-banking/deposits/fixed-deposit',                         color:'#E31C3D' },
      { label:'Axis Bank', url:'https://www.axisbank.com/retail/deposits/fixed-deposits',                                   color:'#97233F' },
      { label:'Yes Bank',  url:'https://www.yesbank.in/personal-banking/yes-individual/deposits/fixed-deposits',            color:'#0072BC' },
      { label:'PNB',       url:'https://www.pnbindia.in/retail-deposits.html',                                              color:'#D04E00' },
    ],
  },
  {
    icon: '📈', bg: '#FFF7ED', name: 'Stocks', type: 'Stock Market',
    risk: 'high', riskLabel: '🔴 High Risk', returns: '12–20% p.a.',
    desc: 'Own a part of a company. Prices rise and fall with the market.',
    detail: 'Trade on NSE/BSE via SEBI-registered broker. Long-term (5+ yrs) reduces risk.',
    links: [
      { label:'Zerodha',  url:'https://zerodha.com',            color:'#387ED1' },
      { label:'Groww',    url:'https://groww.in/stocks',        color:'#00D09C' },
      { label:'Upstox',   url:'https://upstox.com',             color:'#6C63FF' },
      { label:'NSE India',url:'https://www.nseindia.com',       color:'#0057A8' },
    ],
  },
  {
    icon: '🏅', bg: '#FEF9EC', name: 'PPF', type: 'Government Scheme',
    risk: 'low', riskLabel: '🟢 Low Risk', returns: '7–8% p.a. (tax-free!)',
    desc: 'Govt-backed 15-year savings. Tax-free returns. Fully safe.',
    detail: 'Min ₹500 · Max ₹1.5L/yr. Section 80C deduction.',
    links: [
      { label:'India Post', url:'https://www.indiapost.gov.in',                                                color:'#B5272D' },
      { label:'SBI PPF',    url:'https://retail.onlinesbi.sbi/retail/login.htm',                              color:'#1A3C8F' },
      { label:'HDFC PPF',   url:'https://www.hdfcbank.com/personal/save/deposits/public-provident-fund',      color:'#004C8F' },
    ],
  },
  {
    icon: '🥇', bg: '#FFFBEB', name: 'Digital Gold', type: 'Commodity',
    risk: 'medium', riskLabel: '🟡 Medium Risk', returns: '8–12% p.a.',
    desc: 'Invest in gold without storing physically. Easy to buy/sell.',
    detail: 'Sovereign Gold Bonds (RBI), Gold ETFs, Digital Gold on Paytm/PhonePe.',
    links: [
      { label:'RBI Bonds', url:'https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=4303', color:'#4B2D83' },
      { label:'Groww Gold',url:'https://groww.in/etf/gold',                                  color:'#00D09C' },
      { label:'Paytm Gold',url:'https://paytm.com/invest/digital-gold',                      color:'#002970' },
    ],
  },
];

// ─── DATA: FRAUD TIPS ─────────────────────────────────
const FRAUD_TIPS = [
  { icon: '📱', title: 'OTP Fraud', body: 'Never share your OTP with anyone — not even bank employees. Banks will NEVER ask for your OTP over phone or SMS.' },
  { icon: '💸', title: 'UPI Scams', body: 'Scammers send "collect" requests on UPI pretending to give you money. Do NOT scan a QR code or approve a request to RECEIVE money.' },
  { icon: '🎣', title: 'Phishing Links', body: 'Fake website links that look like real bank sites. Always check the URL. Real bank sites use https:// and have no typos.' },
  { icon: '🧓', title: 'KYC Fraud', body: '"Your account will be blocked — do KYC now." This is a scam. Always visit the bank branch or use the official bank app for KYC.' },
  { icon: '🎁', title: 'Lottery / Prize Fraud', body: '"You won ₹50 lakh! Pay ₹500 to claim." — There is NO prize. Legitimate lotteries do not ask you to pay to claim winnings.' },
  { icon: '📲', title: 'Remote Access Apps', body: 'Never install apps like AnyDesk or TeamViewer at a "bank executive\'s" request. This gives them full control of your phone.' },
];

// ─── NAVIGATION ───────────────────────────────────────
let currentSection = 'learn';

function navigate(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-' + section).classList.add('active');
  document.getElementById('nav-' + section).classList.add('active');
  document.getElementById('scrollArea').scrollTop = 0;
  currentSection = section;

  if (section === 'chat' && document.getElementById('chatHistory').children.length === 0) {
    addBotMessage("👋 Hi! I'm your Budget Assistant. Ask me about budgeting, savings, or investments. You can also type things like \"add expense 500\" to track spending!");
  }

  if (section === 'telegram') {
    const token = document.getElementById('tgToken');
    const chatId = document.getElementById('tgChatId');
    if (token) token.value = STATE.tgToken;
    if (chatId) chatId.value = STATE.tgChatId;
  }
}

// ─── GREETING ─────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good Morning!' : h < 17 ? 'Good Afternoon!' : 'Good Evening!';
  document.getElementById('greetMsg').textContent = greet + ' 👋';
}

// ─── XP SYSTEM ────────────────────────────────────────
function addXP(amount) {
  STATE.xp += amount;
  const xpPerLevel = 100;
  STATE.level = Math.floor(STATE.xp / xpPerLevel) + 1;
  updateXPUI();
  saveState();
}

function updateXPUI() {
  const xpPerLevel = 100;
  const xpInLevel = STATE.xp % xpPerLevel;
  const pct = (xpInLevel / xpPerLevel) * 100;
  document.getElementById('topXPVal').textContent = STATE.xp;
  document.getElementById('xpBarFill').style.width = pct + '%';
  document.getElementById('xpBarText').textContent = `Level ${STATE.level} · ${xpInLevel} / ${xpPerLevel} XP`;
  document.getElementById('levelBadge').textContent = STATE.level;
  document.getElementById('lessonsCount').textContent = STATE.completedLessons.size;
}

// ─── LESSON GRID ──────────────────────────────────────
function renderLessonGrid() {
  const grid = document.getElementById('lessonGrid');
  grid.innerHTML = LESSONS.map(l => {
    const done = STATE.completedLessons.has(l.id);
    return `
    <div class="lesson-card${done ? ' done' : ''}" onclick="openLesson('${l.id}')" style="background:${l.color}">
      ${done ? '<span class="done-badge">✓ Done</span>' : ''}
      <div class="lc-icon">${l.icon}</div>
      <div class="lc-name">${l.name}</div>
      <div class="lc-xp">+${l.xp} XP</div>
      <div class="lc-bar"><div class="lc-bar-fill" style="width:${done ? '100' : '0'}%"></div></div>
    </div>`;
  }).join('');
}

// ─── LESSON MODAL ─────────────────────────────────────
function openLesson(id) {
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;
  STATE.currentLesson = lesson;
  STATE.currentSlide = 0;

  document.getElementById('modalTitle').textContent = lesson.icon + ' ' + lesson.name;
  renderSlides(lesson);
  showSlide(0);

  document.getElementById('quizWrap').classList.remove('active');
  document.getElementById('quizResult').classList.remove('show');
  document.getElementById('quizOptions').innerHTML = '';

  document.getElementById('lessonOverlay').classList.add('open');
}

function renderSlides(lesson) {
  const container = document.getElementById('slidesContainer');
  container.innerHTML = lesson.slides.map((s, i) => `
    <div class="lesson-slide${i === 0 ? ' active' : ''}" id="slide-${i}">
      <div class="slide-emoji">${s.emoji}</div>
      <div class="slide-title">${s.title}</div>
      <div class="slide-body">${s.body}</div>
      ${s.tips ? `<div class="slide-tips"><p>${s.tips.heading}</p><ul>${s.tips.items.map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}
    </div>
  `).join('');
}

function showSlide(idx) {
  const lesson = STATE.currentLesson;
  document.querySelectorAll('.lesson-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
  const total = lesson.slides.length;
  document.getElementById('slideCounter').textContent = `${idx + 1} / ${total}`;
  document.getElementById('btnPrev').disabled = idx === 0;

  const isLast = idx === total - 1;
  const btn = document.getElementById('btnNext');
  btn.textContent = isLast ? '🎯 Take Quiz' : 'Next →';
  document.getElementById('slideNavBar').style.display = 'flex';
}

function nextSlide() {
  const lesson = STATE.currentLesson;
  if (STATE.currentSlide < lesson.slides.length - 1) {
    STATE.currentSlide++;
    showSlide(STATE.currentSlide);
  } else {
    showQuiz(lesson);
  }
}

function prevSlide() {
  if (STATE.currentSlide > 0) {
    STATE.currentSlide--;
    showSlide(STATE.currentSlide);
  }
}

function showQuiz(lesson) {
  document.getElementById('slideNavBar').style.display = 'none';
  document.querySelectorAll('.lesson-slide').forEach(s => s.classList.remove('active'));
  const qw = document.getElementById('quizWrap');
  qw.classList.add('active');
  document.getElementById('quizQuestion').textContent = lesson.quiz.question;
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = lesson.quiz.options.map((o, i) =>
    `<button class="quiz-opt" id="qopt-${i}" onclick="answerQuiz(${i})">${o}</button>`
  ).join('');
}

function answerQuiz(chosen) {
  const lesson = STATE.currentLesson;
  const correct = lesson.quiz.correct;
  document.querySelectorAll('.quiz-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    if (i === chosen && chosen !== correct) btn.classList.add('wrong');
  });

  const isRight = chosen === correct;
  const xpGain = isRight ? lesson.xp : Math.floor(lesson.xp / 2);
  const result = document.getElementById('quizResult');
  result.classList.add('show');
  document.getElementById('quizEmoji').textContent = isRight ? '🎉' : '😊';
  document.getElementById('quizResultTitle').textContent = isRight ? 'Correct! Great Job!' : 'Not quite — Keep going!';
  document.getElementById('quizResultMsg').textContent = lesson.quiz.explanation;
  document.getElementById('xpEarned').textContent = `+${xpGain} XP Earned!`;

  if (!STATE.completedLessons.has(lesson.id)) {
    STATE.completedLessons.add(lesson.id);
    addXP(xpGain);
    renderLessonGrid();
  }
}

function closeLesson(event) {
  if (event && event.target !== document.getElementById('lessonOverlay')) return;
  document.getElementById('lessonOverlay').classList.remove('open');
}

// ─── INVESTMENT CARDS ─────────────────────────────────
function renderInvestCards() {
  const container = document.getElementById('investCards');
  container.innerHTML = INVESTMENTS.map((inv, i) => {
    const riskClass = inv.risk === 'low' ? 'pill-low' : inv.risk === 'medium' ? 'pill-medium' : 'pill-high';
    const linksHTML = inv.links ? `
      <div class="ic-links-label">🔗 Invest Now</div>
      <div class="ic-links">${inv.links.map(lk =>
        `<a href="${lk.url}" target="_blank" rel="noopener" class="ic-link-btn" style="background:${lk.color}">${lk.label} ↗</a>`
      ).join('')}</div>` : '';
    return `
    <div class="invest-card">
      <div class="ic-top" onclick="toggleInvest(${i})" style="cursor:pointer">
        <div class="ic-icon-wrap" style="background:${inv.bg}">${inv.icon}</div>
        <div>
          <div class="ic-name">${inv.name}</div>
          <div class="ic-type">${inv.type}</div>
        </div>
      </div>
      <div class="ic-pills">
        <span class="pill ${riskClass}">${inv.riskLabel}</span>
        <span class="pill pill-return">📈 ${inv.returns}</span>
      </div>
      <div class="ic-desc">${inv.desc}</div>
      <div class="ic-expand" id="inv-exp-${i}">
        <p style="margin-bottom:${inv.links ? '10px' : '0'}">${inv.detail}</p>
        ${linksHTML}
      </div>
      <div style="text-align:right;margin-top:8px;font-size:11px;color:var(--muted)" onclick="toggleInvest(${i})"><span id="inv-lbl-${i}">expand ▼</span></div>
    </div>`;
  }).join('');
}

function toggleInvest(i) {
  const exp = document.getElementById('inv-exp-' + i);
  const lbl = document.getElementById('inv-lbl-' + i);
  exp.classList.toggle('open');
  lbl.textContent = exp.classList.contains('open') ? 'collapse ▲' : 'expand ▼';
}

// ─── BUDGET CALCULATOR ────────────────────────────────
function getCategoryRows(containerId) {
  const rows = [];
  document.querySelectorAll(`#${containerId} .cat-row`).forEach(row => {
    const inputs = row.querySelectorAll('input');
    const name = inputs[0].value.trim() || 'Expense';
    const amt  = parseFloat(inputs[1].value) || 0;
    rows.push({ name, amt });
  });
  return rows;
}

function addCategory(type) {
  const containerId = type === 'fixed' ? 'fixedCats' : 'variableCats';
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'cat-row';
  div.innerHTML = `
    <input type="text" placeholder="Category name"/>
    <div class="input-prefix" style="flex:0 0 auto">
      <span>₹</span>
      <input type="number" placeholder="Amount" style="padding-left:24px"/>
    </div>
    <button class="del-cat" onclick="deleteCat(this)">×</button>`;
  container.appendChild(div);
}

function deleteCat(btn) {
  btn.parentElement.remove();
}

function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function calculateBudget() {
  const income = parseFloat(document.getElementById('income').value) || 0;
  if (income <= 0) { alert('Please enter your monthly income first.'); return; }

  const fixed    = getCategoryRows('fixedCats');
  const variable = getCategoryRows('variableCats');
  const allCats  = [...fixed.map(c => ({ ...c, type: 'Fixed' })), ...variable.map(c => ({ ...c, type: 'Variable' }))];
  const totalExp = allCats.reduce((s, c) => s + c.amt, 0);
  const savings  = income - totalExp;

  const needs        = income * 0.50;
  const wants        = income * 0.30;
  const savingsIdeal = income * 0.20;

  const actualNeedsPct   = Math.min((fixed.reduce((s, c) => s + c.amt, 0) / income) * 100, 100);
  const actualWantsPct   = Math.min((variable.reduce((s, c) => s + c.amt, 0) / income) * 100, 100);
  const actualSavingsPct = Math.max(0, ((savings / income) * 100));

  document.getElementById('needsAmt').textContent   = fmt(needs);
  document.getElementById('wantsAmt').textContent   = fmt(wants);
  document.getElementById('savingsAmt').textContent = fmt(savingsIdeal);

  document.getElementById('rNeeds').textContent   = fmt(income * 0.5);
  document.getElementById('rWants').textContent   = fmt(income * 0.3);
  document.getElementById('rSavings').textContent = fmt(income * 0.2);

  setTimeout(() => {
    document.getElementById('needsBar').style.width   = Math.min(actualNeedsPct, 100) + '%';
    document.getElementById('wantsBar').style.width   = Math.min(actualWantsPct, 100) + '%';
    document.getElementById('savingsBar').style.width = Math.min(actualSavingsPct, 100) + '%';
  }, 50);

  const breakdown = document.getElementById('catBreakdown');
  breakdown.innerHTML = allCats.map(c => `
    <div class="cat-breakdown-row">
      <span>${c.name} <span style="font-size:10px;color:var(--muted)">(${c.type})</span></span>
      <span style="font-weight:600">${fmt(c.amt)}</span>
    </div>`).join('') + `
    <div class="cat-breakdown-row" style="font-weight:700;color:${savings >= 0 ? 'var(--primary)' : 'var(--danger)'}">
      <span>${savings >= 0 ? '💎 Available Savings' : '⚠️ Over Budget by'}</span>
      <span>${fmt(Math.abs(savings))}</span>
    </div>`;

  const tip = savings < 0
    ? 'You are spending more than you earn! Try cutting variable expenses first.'
    : savings < income * 0.1
    ? 'Your savings are very low. Try the 50/30/20 rule to improve your finances.'
    : savings >= income * 0.2
    ? '🎉 Great job! You are saving well. Consider investing your surplus!'
    : '👍 Good start! Try to increase savings to at least 20% of income.';
  document.getElementById('budgetTip').querySelector('p').textContent = tip;

  STATE.budgetData = { income, totalExp, savings, allCats };

  document.getElementById('budgetResult').classList.add('show');
  document.getElementById('budgetResult').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Telegram notification
  if (document.getElementById('tgNBudget') && document.getElementById('tgNBudget').checked) {
    const msg = `💰 *Finora Budget Update*\n\nIncome: ${fmt(income)}\nTotal Expenses: ${fmt(totalExp)}\nSavings: ${fmt(savings)}\n\n${tip}`;
    sendTelegramMessage(msg, true);
  }
  if (savings < 0 && document.getElementById('tgNOverspend') && document.getElementById('tgNOverspend').checked) {
    sendTelegramMessage(`⚠️ *Overspending Alert!*\n\nYou are over budget by ${fmt(Math.abs(savings))}. Review your expenses immediately!`, true);
  }
}

function resetBudget() {
  document.getElementById('budgetResult').classList.remove('show');
  document.getElementById('scrollArea').scrollTop = 0;
}

// ─── CHATBOT ──────────────────────────────────────────
const BOT_RESPONSES = [
  { triggers: ['50/30/20', '50 30 20', 'rule'], reply: '📊 The 50/30/20 Rule:\n• 50% → Needs (rent, food, bills)\n• 30% → Wants (entertainment, dining)\n• 20% → Savings & investments\n\nStart with this simple framework!' },
  { triggers: ['save', 'saving', 'savings'], reply: '🐷 To save more:\n1. Pay yourself first — transfer savings on salary day\n2. Use auto-debit to RD or mutual fund SIP\n3. Track expenses for one month\n4. Cut one unnecessary subscription\n\nEven ₹500/month grows over time!' },
  { triggers: ['sip', 'mutual fund', 'mf'], reply: '📈 SIP (Systematic Investment Plan) lets you invest a fixed amount (min ₹100) every month in a mutual fund. It averages out market ups & downs — great for beginners!\n\nGo to the Invest tab for more details.' },
  { triggers: ['fd', 'fixed deposit'], reply: '🏛️ Fixed Deposits are the safest investment. Lock your money for 1–5 years and earn 6–8% p.a. Senior citizens get extra interest. Insured up to ₹5 lakh by DICGC.' },
  { triggers: ['budget'], reply: '💰 Use the Budget tab to enter your income and expenses. The app will calculate your 50/30/20 split automatically!' },
  { triggers: ['loan', 'emi', 'borrow'], reply: '🏦 Loans come with interest costs. Always compare rates. Credit cards charge 36–48% p.a. — avoid carrying a balance!\n\nBefore taking any loan, make sure the EMI is less than 40% of your monthly income.' },
  { triggers: ['fraud', 'scam', 'otp', 'upi', 'safe'], reply: '🛡️ Never share your OTP with anyone. UPI collect requests are for you to SEND money, not receive. Go to the Safety tab for full fraud protection tips!' },
  { triggers: ['invest', 'stock', 'share', 'ppf', 'gold'], reply: '📈 Great question! Go to the Invest tab to explore Mutual Funds, FDs, Stocks, PPF, and Gold with risk level and expected returns for each.' },
  { triggers: ['reduce', 'cut', 'expense', 'less'], reply: '✂️ To reduce expenses:\n1. Track every spend for 2 weeks\n2. Identify subscriptions you don\'t use\n3. Cook at home instead of ordering food\n4. Use public transport when possible\n5. Wait 24 hours before buying non-essentials' },
  { triggers: ['emergency', 'fund'], reply: '🆘 An emergency fund = 3–6 months of your monthly expenses kept in a savings account or liquid fund. This protects you from job loss, medical bills, or unexpected repairs.' },
  { triggers: ['csv', 'statement', 'upload'], reply: '📂 Go to the Statements tab to upload your bank CSV file! I\'ll show you interactive charts of your spending by category and monthly cash flow.' },
  { triggers: ['telegram', 'alert', 'notify', 'notification'], reply: '✈️ Go to the Alerts tab to connect your Telegram bot! You\'ll get real-time notifications for budget updates, overspending warnings, and more.' },
  { triggers: ['hello', 'hi', 'hey', 'namaste'], reply: '🙏 Namaste! I\'m your Budget Assistant. Ask me about saving, budgeting, investing, loans, or fraud protection. How can I help you today?' },
];

let sessionExpenses = 0;

function getBotReply(msg) {
  const lower = msg.toLowerCase();

  const addMatch = lower.match(/add\s+expense\s+(\d+)/);
  if (addMatch) {
    const amt = parseInt(addMatch[1]);
    sessionExpenses += amt;
    return `✅ Got it! I've recorded ₹${amt.toLocaleString('en-IN')} as an expense.\n📊 Total tracked this session: ₹${sessionExpenses.toLocaleString('en-IN')}`;
  }

  if (lower.includes('total') || lower.includes('my expense')) {
    return `📊 You've tracked ₹${sessionExpenses.toLocaleString('en-IN')} in expenses this session.\n${STATE.budgetData ? `Your budget allows ₹${Math.round(STATE.budgetData.income * 0.8).toLocaleString('en-IN')} for needs+wants.` : 'Go to the Budget tab to set up your full budget!'}`;
  }

  for (const rule of BOT_RESPONSES) {
    if (rule.triggers.some(t => lower.includes(t))) {
      return rule.reply;
    }
  }

  return "🤔 I'm not sure about that. Try asking about:\n• Saving tips\n• 50/30/20 rule\n• SIP or mutual funds\n• Fraud protection\n• How to upload bank statements";
}

function addBotMessage(text) {
  const history = document.getElementById('chatHistory');
  const div = document.createElement('div');
  div.className = 'chat-bubble bot';
  div.style.whiteSpace = 'pre-line';
  div.textContent = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

function addUserMessage(text) {
  const history = document.getElementById('chatHistory');
  const div = document.createElement('div');
  div.className = 'chat-bubble user';
  div.textContent = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addUserMessage(msg);
  setTimeout(() => addBotMessage(getBotReply(msg)), 400);
}

function sendQuick(msg) {
  addUserMessage(msg);
  setTimeout(() => addBotMessage(getBotReply(msg)), 400);
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendChat();
}

// ─── FRAUD TIPS ───────────────────────────────────────
function renderFraudTips() {
  const container = document.getElementById('fraudTips');
  container.innerHTML = FRAUD_TIPS.map(t => `
    <div class="fraud-tip">
      <div class="ft-icon">${t.icon}</div>
      <div class="ft-body">
        <h4>${t.title}</h4>
        <p>${t.body}</p>
      </div>
    </div>`).join('');
}

// ─── CSV UPLOAD & PARSER ──────────────────────────────
const SAMPLE_CSV = `Date,Description,Category,Amount,Type
2024-01-03,Salary Credit,Income,55000,credit
2024-01-05,BigBasket Grocery,Food & Dining,2200,debit
2024-01-07,Swiggy Order,Food & Dining,480,debit
2024-01-08,Uber Ride,Transport,320,debit
2024-01-10,Netflix Subscription,Entertainment,649,debit
2024-01-12,HDFC Bank EMI,Loans & EMI,8500,debit
2024-01-14,Electricity Bill,Utilities,1200,debit
2024-01-15,Amazon Purchase,Shopping,1850,debit
2024-01-18,Zomato Order,Food & Dining,390,debit
2024-01-20,Metro Card Recharge,Transport,500,debit
2024-01-22,Freelance Payment,Income,12000,credit
2024-01-23,Pharmacy,Health,760,debit
2024-01-25,Petrol,Transport,2000,debit
2024-01-27,Movie Tickets,Entertainment,600,debit
2024-01-28,Rent Payment,Housing,15000,debit
2024-02-01,Salary Credit,Income,55000,credit
2024-02-03,BigBasket Grocery,Food & Dining,1900,debit
2024-02-05,Ola Ride,Transport,250,debit
2024-02-07,Spotify Premium,Entertainment,119,debit
2024-02-10,HDFC Bank EMI,Loans & EMI,8500,debit
2024-02-11,Water Bill,Utilities,450,debit
2024-02-14,Valentine Gift,Shopping,2200,debit
2024-02-16,Swiggy Order,Food & Dining,560,debit
2024-02-18,Doctor Visit,Health,500,debit
2024-02-20,Petrol,Transport,1800,debit
2024-02-22,Freelance Payment,Income,8000,credit
2024-02-25,Gym Membership,Health,1500,debit
2024-02-28,Rent Payment,Housing,15000,debit`;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < 3) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
    rows.push(obj);
  }
  return rows;
}

function categoriseAuto(desc) {
  const d = desc.toLowerCase();
  if (/food|swiggy|zomato|bigbasket|restaurant|cafe|dining/.test(d)) return 'Food & Dining';
  if (/uber|ola|metro|petrol|transport|fuel|cab/.test(d)) return 'Transport';
  if (/amazon|flipkart|myntra|shopping|mall/.test(d)) return 'Shopping';
  if (/netflix|spotify|movie|entertain|prime|hotstar/.test(d)) return 'Entertainment';
  if (/rent|housing/.test(d)) return 'Housing';
  if (/electricity|water|bill|utility/.test(d)) return 'Utilities';
  if (/emi|loan|bank/.test(d)) return 'Loans & EMI';
  if (/doctor|hospital|pharmacy|health|gym|medic/.test(d)) return 'Health';
  if (/salary|freelance|income|credit/.test(d)) return 'Income';
  return 'Other';
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => processCSVData(e.target.result, file.name);
  reader.readAsText(file);
}

function loadSampleCSV() {
  processCSVData(SAMPLE_CSV, 'sample_statement.csv');
}

function processCSVData(text, filename) {
  const rows = parseCSV(text);
  if (!rows.length) { alert('Could not parse CSV. Please check the format.'); return; }

  STATE.csvData = rows.map(r => {
    const amount = parseFloat(r.amount || r.debit || r.credit || 0);
    const type   = r.type || (amount >= 0 ? 'credit' : 'debit');
    const category = r.category || categoriseAuto(r.description || r.narration || r.particulars || '');
    return {
      date: r.date || '—',
      description: r.description || r.narration || r.particulars || '—',
      category,
      amount: Math.abs(amount),
      type: type.toLowerCase().includes('credit') ? 'credit' : 'debit',
    };
  });

  renderCSVResults(filename);

  // Telegram notification
  if (document.getElementById('tgNCSV') && document.getElementById('tgNCSV').checked) {
    const debits = STATE.csvData.filter(r => r.type === 'debit');
    const total = debits.reduce((s, r) => s + r.amount, 0);
    sendTelegramMessage(`📂 *Statement Uploaded*: ${filename}\n\n${STATE.csvData.length} transactions found\nTotal Debits: ${fmt(total)}`, true);
  }
}

function renderCSVResults(filename) {
  const data = STATE.csvData;
  const debits  = data.filter(r => r.type === 'debit');
  const credits = data.filter(r => r.type === 'credit');
  const totalDebit  = debits.reduce((s, r) => s + r.amount, 0);
  const totalCredit = credits.reduce((s, r) => s + r.amount, 0);

  // Summary cards
  document.getElementById('csvSummaryCards').innerHTML = `
    <div class="csv-sum-card">
      <div class="csv-sum-icon">💳</div>
      <div class="csv-sum-val">${fmt(totalDebit)}</div>
      <div class="csv-sum-lbl">Total Spent</div>
    </div>
    <div class="csv-sum-card">
      <div class="csv-sum-icon">📥</div>
      <div class="csv-sum-val" style="color:#0B6E4F">${fmt(totalCredit)}</div>
      <div class="csv-sum-lbl">Total Income</div>
    </div>
    <div class="csv-sum-card">
      <div class="csv-sum-icon">📊</div>
      <div class="csv-sum-val">${data.length}</div>
      <div class="csv-sum-lbl">Transactions</div>
    </div>
    <div class="csv-sum-card">
      <div class="csv-sum-icon">${totalCredit - totalDebit >= 0 ? '💎' : '⚠️'}</div>
      <div class="csv-sum-val" style="color:${totalCredit - totalDebit >= 0 ? 'var(--primary)' : 'var(--danger)'}">${fmt(Math.abs(totalCredit - totalDebit))}</div>
      <div class="csv-sum-lbl">${totalCredit - totalDebit >= 0 ? 'Net Savings' : 'Net Deficit'}</div>
    </div>`;

  // Category chart
  const catMap = {};
  debits.forEach(r => {
    catMap[r.category] = (catMap[r.category] || 0) + r.amount;
  });
  const catLabels = Object.keys(catMap);
  const catValues = catLabels.map(k => catMap[k]);
  const PALETTE = ['#0B6E4F','#F4A261','#2196F3','#E63946','#9B59B6','#1ABC9C','#F39C12','#E74C3C'];

  if (STATE.categoryChart) STATE.categoryChart.destroy();
  STATE.categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{ data: catValues, backgroundColor: PALETTE, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` } }
      }
    }
  });

  // Cash flow chart — group by month
  const monthMap = {};
  data.forEach(r => {
    const m = r.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 };
    if (r.type === 'credit') monthMap[m].income += r.amount;
    else monthMap[m].expense += r.amount;
  });
  const months = Object.keys(monthMap).sort();
  const incomeData  = months.map(m => monthMap[m].income);
  const expenseData = months.map(m => monthMap[m].expense);
  const monthNames  = months.map(m => {
    const [yr, mo] = m.split('-');
    return new Date(yr, mo - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
  });

  if (STATE.cashflowChart) STATE.cashflowChart.destroy();
  STATE.cashflowChart = new Chart(document.getElementById('cashflowChart'), {
    type: 'bar',
    data: {
      labels: monthNames,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: '#0B6E4F', borderRadius: 6 },
        { label: 'Expenses', data: expenseData, backgroundColor: '#F4A261', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 10 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
      },
      scales: {
        x: { ticks: { font: { family: 'Poppins', size: 10 } } },
        y: { ticks: { font: { family: 'Poppins', size: 10 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });

  // Render transaction table
  renderTransactionTable(data);

  document.getElementById('csvUploadCard').style.display = 'none';
  document.getElementById('csvResults').style.display = 'block';
}

function renderTransactionTable(data) {
  const tbody = document.getElementById('txBody');
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.date}</td>
      <td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.description}">${r.description}</td>
      <td><span class="tx-cat-pill">${r.category}</span></td>
      <td class="${r.type === 'debit' ? 'tx-debit' : 'tx-credit'}">${r.type === 'debit' ? '−' : '+'}${fmt(r.amount)}</td>
    </tr>`).join('');
  document.getElementById('txCount').textContent = `${data.length} transactions`;
}

function filterTransactions() {
  const q = document.getElementById('txSearch').value.toLowerCase();
  if (!q) { renderTransactionTable(STATE.csvData); return; }
  const filtered = STATE.csvData.filter(r =>
    r.description.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.date.includes(q)
  );
  renderTransactionTable(filtered);
}

function clearCSV() {
  STATE.csvData = [];
  if (STATE.categoryChart) { STATE.categoryChart.destroy(); STATE.categoryChart = null; }
  if (STATE.cashflowChart) { STATE.cashflowChart.destroy(); STATE.cashflowChart = null; }
  document.getElementById('csvFileInput').value = '';
  document.getElementById('csvUploadCard').style.display = 'block';
  document.getElementById('csvResults').style.display = 'none';
}

// ─── TELEGRAM ──────────────────────────────────────────
function saveTGCredentials() {
  STATE.tgToken  = document.getElementById('tgToken').value.trim();
  STATE.tgChatId = document.getElementById('tgChatId').value.trim();
  saveState();
  showTGStatus('✅ Credentials saved!', 'var(--primary)');
}

function showTGStatus(msg, color) {
  const el = document.getElementById('tgStatus');
  el.textContent = msg;
  el.style.color = color || 'var(--text)';
  setTimeout(() => { el.textContent = ''; }, 4000);
}

async function sendTelegramMessage(text, silent = false) {
  const token  = STATE.tgToken || document.getElementById('tgToken').value.trim();
  const chatId = STATE.tgChatId || document.getElementById('tgChatId').value.trim();
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_notification: silent,
      }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function sendTGTest() {
  STATE.tgToken  = document.getElementById('tgToken').value.trim();
  STATE.tgChatId = document.getElementById('tgChatId').value.trim();
  if (!STATE.tgToken || !STATE.tgChatId) {
    showTGStatus('⚠️ Enter Bot Token & Chat ID first', 'var(--danger)'); return;
  }
  showTGStatus('📤 Sending…', 'var(--muted)');
  const ok = await sendTelegramMessage(`🎉 *Finora Connected!*\n\nHello from Finora India 🇮🇳\n\nYour Telegram alerts are now set up. You'll receive budget updates, spending alerts, and financial tips here.\n\n_Powered by Finora India_`);
  if (ok) {
    showTGStatus('✅ Test message sent! Check your Telegram.', 'var(--primary)');
    saveState();
  } else {
    showTGStatus('❌ Failed. Check your token & chat ID, then try again.', 'var(--danger)');
  }
}

async function sendTGCustom() {
  const msg = document.getElementById('tgCustomMsg').value.trim();
  if (!msg) return;
  showTGStatus('📤 Sending…', 'var(--muted)');
  const ok = await sendTelegramMessage(`📨 *Custom Alert from Finora*\n\n${msg}`);
  if (ok) {
    showTGStatus('✅ Message sent!', 'var(--primary)');
    document.getElementById('tgCustomMsg').value = '';
  } else {
    showTGStatus('❌ Failed. Check credentials in the credentials card.', 'var(--danger)');
  }
}

// ─── INIT ─────────────────────────────────────────────
function init() {
  setGreeting();
  updateXPUI();
  renderLessonGrid();
  renderInvestCards();
  renderFraudTips();
}

init();

'use strict';
// web-app.js – Desktop format for Finora India
// Reuses lesson/investment/fraud data inline

const W_STATE = {
  xp:0, level:1, completedLessons:new Set(),
  currentLesson:null, currentSlide:0,
  budgetData:null, csvData:[],
  catChart:null, flowChart:null, budgetChart:null,
  tgToken:'', tgChatId:'',
};

(function load(){
  try {
    const s = JSON.parse(localStorage.getItem('ssi_state')||'{}');
    if(s.xp) W_STATE.xp=s.xp;
    if(s.level) W_STATE.level=s.level;
    if(s.completed) W_STATE.completedLessons=new Set(s.completed);
    if(s.tgToken) W_STATE.tgToken=s.tgToken;
    if(s.tgChatId) W_STATE.tgChatId=s.tgChatId;
  }catch(e){}
})();

function wSave(){
  localStorage.setItem('ssi_state',JSON.stringify({
    xp:W_STATE.xp,level:W_STATE.level,
    completed:[...W_STATE.completedLessons],
    tgToken:W_STATE.tgToken,tgChatId:W_STATE.tgChatId,
  }));
}

// ── DATA (same as app.js) ──────────────────────────────
const W_LESSONS=[
  {id:'saving',icon:'🐷',name:'Saving Basics',xp:20,color:'#E8F5F0',
    slides:[{emoji:'🐷',title:'Why Should You Save?',body:'Saving means keeping money aside for the future. Even small amounts add up — like drops filling a bucket!',tips:{heading:'💡 Key Points',items:['Save at least 10–20% of income','Pay yourself first','Emergency fund = 3–6 months expenses']}},
            {emoji:'🏦',title:'Where to Save?',body:'A Savings Bank Account is the safest place to start. Banks give 2.5–4% interest per year in India.',tips:{heading:'🏦 Good Options',items:['Savings Account (SBI, HDFC)','Recurring Deposit (RD)','Post Office Savings']}},
            {emoji:'🎯',title:'The Golden Rule',body:'The 50/30/20 rule: 50% needs, 30% wants, 20% savings.',tips:null}],
    quiz:{question:'What % of income should you ideally save?',options:['5%','10–20%','50%','1%'],correct:1,explanation:'Save 10–20% monthly to build a strong financial base.'}},
  {id:'budgeting',icon:'📋',name:'Budgeting 101',xp:20,color:'#EEF2FF',
    slides:[{emoji:'📋',title:'What is a Budget?',body:'A plan for how you spend money — no more surprise empty wallets!',tips:{heading:'📋 Basics',items:['Track every rupee','Separate needs from wants','Review monthly']}},
            {emoji:'✍️',title:'How to Budget',body:'1. Write monthly income. 2. List fixed expenses. 3. List variable expenses. 4. Calculate what\'s left!',tips:{heading:'✅ Pro Tips',items:['Use the Budget tool','Keep a surprise fund','Avoid lifestyle inflation']}}],
    quiz:{question:'First step to making a budget?',options:['Buy on EMI','Write monthly income','Spend freely','Take a loan'],correct:1,explanation:'Always start by knowing your monthly income!'}},
  {id:'loans',icon:'🏦',name:'Loans & Interest',xp:25,color:'#FEF9EC',
    slides:[{emoji:'🏦',title:'What is a Loan?',body:'Borrowed money you repay with interest. Banks, NBFCs, and microfinance groups give loans in India.',tips:{heading:'⚠️ Watch Out',items:['Always read the APR','Avoid loan sharks','Compare banks']}},
            {emoji:'📉',title:'How Interest Works',body:'Borrow ₹10,000 at 12%/yr = ₹1,200 extra after 1 year. Always repay on time!',tips:{heading:'💡 Good vs Bad Debt',items:['Good: Home loan, Education','Bad: Credit cards at 36–48%','Avoid payday loans']}},
            {emoji:'📊',title:'EMI Explained',body:'EMI = fixed monthly amount to repay a loan. EMI = (Principal + Interest) ÷ Months.',tips:null}],
    quiz:{question:'Borrow ₹10,000 at 10% p.a. Repayment?',options:['₹10,000','₹11,000','₹9,000','₹12,500'],correct:1,explanation:'10% of ₹10,000 = ₹1,000 interest. Total = ₹11,000.'}},
  {id:'investing',icon:'🚀',name:'Investing Basics',xp:30,color:'#F0FDF4',
    slides:[{emoji:'🚀',title:'Why Invest?',body:'Investing makes money grow via the Power of Compounding!',tips:{heading:'🌱 Start Small',items:['SIP from ₹100/month','PPF: government savings','FDs: low risk']}},
            {emoji:'⏳',title:'Magic of Compounding',body:'₹1,000/month for 20 years at 12% = over ₹9 lakh. Start EARLY, stay CONSISTENT.',tips:{heading:'🧠 Remember',items:['Higher return = higher risk','Never invest borrowed money','Diversify']}}],
    quiz:{question:'What is Power of Compounding?',options:['Spending fast','Interest earns interest','Taking loans','Cash at home'],correct:1,explanation:'Compounding = returns on original + previous returns. Money multiplies faster!'}},
];

const W_INVESTMENTS=[
  {icon:'📊',bg:'#EEF2FF',name:'Mutual Funds',type:'Market-linked',risk:'medium',riskLabel:'🟡 Medium Risk',returns:'10–15% p.a.',
    desc:'Professionally managed pool of investor money. Invested in stocks, bonds, or both.',
    detail:'SIP from ₹100/month. SEBI-regulated. Types: Equity, Debt, Hybrid.',
    links:[
      {label:'Groww',url:'https://groww.in/mutual-funds',color:'#00D09C'},
      {label:'Zerodha Coin',url:'https://coin.zerodha.com',color:'#387ED1'},
      {label:'Upstox MF',url:'https://upstox.com/mutual-fund/',color:'#6C63FF'},
      {label:'ET Money',url:'https://www.etmoney.com/mutual-funds',color:'#E85D04'},
      {label:'ICICI Pru',url:'https://www.icicipruamc.com',color:'#E31C3D'},
    ]},
  {icon:'🏛️',bg:'#F0FDF4',name:'Fixed Deposits',type:'Bank / Post Office',risk:'low',riskLabel:'🟢 Low Risk',returns:'6–8% p.a.',
    desc:'Lump sum deposit for fixed period. Guaranteed interest. Very safe!',
    detail:'DICGC insured up to ₹5 lakh. 7 days–10 years. Senior citizens get 0.5% extra.',
    links:[
      {label:'SBI FD',url:'https://retail.onlinesbi.sbi/retail/login.htm',color:'#1A3C8F'},
      {label:'HDFC Bank',url:'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit',color:'#004C8F'},
      {label:'ICICI Bank',url:'https://www.icicibank.com/personal-banking/deposits/fixed-deposit',color:'#E31C3D'},
      {label:'Axis Bank',url:'https://www.axisbank.com/retail/deposits/fixed-deposits',color:'#97233F'},
      {label:'Yes Bank',url:'https://www.yesbank.in/personal-banking/yes-individual/deposits/fixed-deposits',color:'#0072BC'},
      {label:'PNB',url:'https://www.pnbindia.in/retail-deposits.html',color:'#D04E00'},
    ]},
  {icon:'📈',bg:'#FFF7ED',name:'Stocks',type:'Stock Market',risk:'high',riskLabel:'🔴 High Risk',returns:'12–20% p.a.',
    desc:'Own part of a company. Prices rise and fall with the market.',
    detail:'Trade on NSE/BSE via SEBI-registered broker. Long-term (5+ yrs) reduces risk.',
    links:[
      {label:'Zerodha',url:'https://zerodha.com',color:'#387ED1'},
      {label:'Groww',url:'https://groww.in/stocks',color:'#00D09C'},
      {label:'Upstox',url:'https://upstox.com',color:'#6C63FF'},
      {label:'NSE India',url:'https://www.nseindia.com',color:'#0057A8'},
    ]},
  {icon:'🏅',bg:'#FEF9EC',name:'PPF',type:'Government Scheme',risk:'low',riskLabel:'🟢 Low Risk',returns:'7–8% p.a. tax-free',
    desc:'Govt-backed 15-year savings. Tax-free returns. Fully safe.',
    detail:'Min ₹500 · Max ₹1.5L/yr. Section 80C deduction.',
    links:[
      {label:'India Post PPF',url:'https://www.indiapost.gov.in/VAS/pages/FindPinCode.aspx',color:'#B5272D'},
      {label:'SBI PPF',url:'https://retail.onlinesbi.sbi/retail/login.htm',color:'#1A3C8F'},
      {label:'HDFC PPF',url:'https://www.hdfcbank.com/personal/save/deposits/public-provident-fund',color:'#004C8F'},
    ]},
  {icon:'🥇',bg:'#FFFBEB',name:'Digital Gold',type:'Commodity',risk:'medium',riskLabel:'🟡 Medium Risk',returns:'8–12% p.a.',
    desc:'Invest in gold without storing physically. Easy to buy/sell.',
    detail:'Sovereign Gold Bonds (RBI), Gold ETFs, Digital Gold on Paytm/PhonePe.',
    links:[
      {label:'RBI Bonds (SGB)',url:'https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=4303',color:'#4B2D83'},
      {label:'Groww Gold ETF',url:'https://groww.in/etf/gold',color:'#00D09C'},
      {label:'Paytm Gold',url:'https://paytm.com/invest/digital-gold',color:'#002970'},
    ]},
];

const W_FRAUD=[
  {icon:'📱',title:'OTP Fraud',body:'Never share your OTP. Banks NEVER ask for OTP over phone.'},
  {icon:'💸',title:'UPI Scams',body:'Scammers send "collect" requests pretending to give money. Never approve collect requests to receive money.'},
  {icon:'🎣',title:'Phishing Links',body:'Fake sites mimicking real banks. Check the URL — real banks use https:// with no typos.'},
  {icon:'🧓',title:'KYC Fraud',body:'"Your account will be blocked — do KYC." Always use the official bank app or branch.'},
  {icon:'🎁',title:'Lottery Fraud',body:'"You won ₹50 lakh!" There is no such prize. Real lotteries don\'t ask you to pay to claim.'},
  {icon:'📲',title:'Remote Access',body:'Never install AnyDesk/TeamViewer for a "bank executive." They get full phone control.'},
];

const W_BOT=[
  {t:['50/30/20','rule'],r:'📊 50/30/20 Rule:\n• 50% Needs\n• 30% Wants\n• 20% Savings\nSimple and effective!'},
  {t:['save','saving'],r:'🐷 Pay yourself first. Set up auto-debit to SIP or RD on salary day. Even ₹500/month grows!'},
  {t:['sip','mutual fund'],r:'📈 SIP: Invest fixed amount monthly in mutual fund from ₹100. Averages out market ups & downs.'},
  {t:['fd','fixed deposit'],r:'🏛️ FDs: Lock money 1–5 years, earn 6–8% p.a. DICGC insured up to ₹5 lakh.'},
  {t:['budget'],r:'💰 Go to Budget section — enter income & expenses and get a personalised 50/30/20 plan!'},
  {t:['loan','emi'],r:'🏦 Loans cost money! Credit cards = 36–48% p.a. Keep EMI under 40% of income.'},
  {t:['fraud','scam','otp'],r:'🛡️ Never share OTP. Check Safety section for full fraud protection tips!'},
  {t:['invest','ppf','gold','stock'],r:'📈 Explore Mutual Funds, FDs, Stocks, PPF & Gold in the Invest section with risk & return details.'},
  {t:['reduce','cut','expense'],r:'✂️ Track spending 2 weeks, cut unused subscriptions, cook more, use public transport.'},
  {t:['emergency'],r:'🆘 Emergency fund = 3–6 months expenses in a savings account or liquid fund.'},
  {t:['csv','statement','upload'],r:'📂 Go to the Statements section to upload your bank CSV and see interactive charts!'},
  {t:['telegram','alert'],r:'✈️ Go to Alerts section to connect Telegram and get real-time budget notifications!'},
  {t:['hello','hi','namaste'],r:'🙏 Namaste! Ask me about budgeting, investing, loans or fraud. How can I help?'},
];

// ── NAVIGATION ────────────────────────────────────────
const W_TITLES={learn:'📚 Financial Lessons',invest:'📈 Investment Options',budget:'💰 Smart Budget Planner',chat:'🤖 Budget Assistant',statements:'📂 Financial Statements',telegram:'✈️ Telegram Alerts',fraud:'🛡️ Fraud Protection'};
function wNavigate(sec){
  document.querySelectorAll('.wsection').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('wsec-'+sec).classList.add('active');
  document.getElementById('snav-'+sec).classList.add('active');
  document.getElementById('webMain').scrollTop=0;
  const tb=document.getElementById('topBarTitle');
  if(tb)tb.textContent=W_TITLES[sec]||'';
  if(sec==='chat'&&document.getElementById('wChatHistory').children.length===0)
    wAddBot("👋 Hi! I'm your Finora assistant. Ask me about budgeting, investing, fraud, or CSV statements!");
  if(sec==='telegram'){
    document.getElementById('wTgToken').value=W_STATE.tgToken;
    document.getElementById('wTgChatId').value=W_STATE.tgChatId;
  }
}

// ── XP ────────────────────────────────────────────────
function wAddXP(n){
  W_STATE.xp+=n;
  W_STATE.level=Math.floor(W_STATE.xp/100)+1;
  wUpdateXP(); wSave();
}
function wUpdateXP(){
  const inLv=W_STATE.xp%100;
  const pct=(inLv/100)*100;
  document.getElementById('sbXPVal').textContent=W_STATE.xp;
  document.getElementById('sbLevel').textContent=W_STATE.level;
  document.getElementById('wXpFill').style.width=pct+'%';
  document.getElementById('wXpText').textContent=`Level ${W_STATE.level} · ${inLv} / 100 XP`;
  document.getElementById('wLessons').textContent=W_STATE.completedLessons.size;
  document.getElementById('wLevel').textContent=W_STATE.level;
  document.getElementById('wXPTotal').textContent=W_STATE.xp;
}

// ── LESSONS ───────────────────────────────────────────
function wRenderLessons(){
  document.getElementById('wLessonGrid').innerHTML=W_LESSONS.map(l=>{
    const done=W_STATE.completedLessons.has(l.id);
    return `<div class="w-lesson-card${done?' done':''}" onclick="wOpenLesson('${l.id}')" style="background:${l.color}">
      ${done?'<span class="w-done-badge">✓ Done</span>':''}
      <div class="w-lc-icon">${l.icon}</div>
      <div class="w-lc-name">${l.name}</div>
      <div class="w-lc-xp">+${l.xp} XP</div>
      <div class="w-lc-bar"><div class="w-lc-bar-fill" style="width:${done?100:0}%"></div></div>
    </div>`;
  }).join('');
}

let wCurLesson=null, wCurSlide=0;
function wOpenLesson(id){
  const l=W_LESSONS.find(x=>x.id===id); if(!l)return;
  wCurLesson=l; wCurSlide=0;
  document.getElementById('wModalTitle').textContent=l.icon+' '+l.name;
  document.getElementById('wSlidesContainer').innerHTML=l.slides.map((s,i)=>`
    <div class="w-slide${i===0?' active':''}" id="wslide-${i}">
      <div class="w-slide-emoji">${s.emoji}</div>
      <div class="w-slide-title">${s.title}</div>
      <div class="w-slide-body">${s.body}</div>
      ${s.tips?`<div class="w-slide-tips"><p>${s.tips.heading}</p><ul>${s.tips.items.map(t=>`<li>${t}</li>`).join('')}</ul></div>`:''}
    </div>`).join('');
  document.getElementById('wQuizWrap').classList.remove('active');
  document.getElementById('wQuizResult').classList.remove('show');
  document.getElementById('wQuizOpts').innerHTML='';
  wShowSlide(0);
  document.getElementById('wLessonOverlay').classList.add('open');
}
function wShowSlide(i){
  document.querySelectorAll('.w-slide').forEach((s,j)=>s.classList.toggle('active',j===i));
  document.getElementById('wSlideCounter').textContent=`${i+1} / ${wCurLesson.slides.length}`;
  document.getElementById('wBtnPrev').disabled=i===0;
  document.getElementById('wBtnNext').textContent=i===wCurLesson.slides.length-1?'🎯 Take Quiz':'Next →';
  document.getElementById('wSlideNav').style.display='flex';
}
function wNext(){
  if(wCurSlide<wCurLesson.slides.length-1){wCurSlide++;wShowSlide(wCurSlide);}
  else wShowQuiz();
}
function wPrev(){if(wCurSlide>0){wCurSlide--;wShowSlide(wCurSlide);}}
function wShowQuiz(){
  document.getElementById('wSlideNav').style.display='none';
  document.querySelectorAll('.w-slide').forEach(s=>s.classList.remove('active'));
  document.getElementById('wQuizWrap').classList.add('active');
  document.getElementById('wQuizQ').textContent=wCurLesson.quiz.question;
  document.getElementById('wQuizOpts').innerHTML=wCurLesson.quiz.options.map((o,i)=>
    `<button class="quiz-opt" onclick="wAnswer(${i})">${o}</button>`).join('');
}
function wAnswer(chosen){
  const q=wCurLesson.quiz; const right=q.correct;
  document.querySelectorAll('.quiz-opt').forEach((b,i)=>{
    b.disabled=true;
    if(i===right)b.classList.add('correct');
    if(i===chosen&&chosen!==right)b.classList.add('wrong');
  });
  const ok=chosen===right;
  const xp=ok?wCurLesson.xp:Math.floor(wCurLesson.xp/2);
  const r=document.getElementById('wQuizResult');r.classList.add('show');
  document.getElementById('wQuizEmoji').textContent=ok?'🎉':'😊';
  document.getElementById('wQuizTitle').textContent=ok?'Correct! Great job!':'Not quite — keep going!';
  document.getElementById('wQuizMsg').textContent=q.explanation;
  document.getElementById('wXpEarned').textContent=`+${xp} XP Earned!`;
  if(!W_STATE.completedLessons.has(wCurLesson.id)){
    W_STATE.completedLessons.add(wCurLesson.id);
    wAddXP(xp); wRenderLessons();
  }
}
function wCloseLesson(e){
  if(e&&e.target!==document.getElementById('wLessonOverlay'))return;
  document.getElementById('wLessonOverlay').classList.remove('open');
}

// ── INVESTMENTS ───────────────────────────────────────
function wRenderInvest(){
  document.getElementById('wInvestGrid').innerHTML=W_INVESTMENTS.map((inv,i)=>`
    <div class="w-invest-card">
      <div class="w-ic-header" onclick="wToggleInv(${i})" style="cursor:pointer">
        <div class="w-ic-icon" style="background:${inv.bg}">${inv.icon}</div>
        <div><div class="w-ic-name">${inv.name}</div><div class="w-ic-type">${inv.type}</div></div>
      </div>
      <div class="w-ic-pills">
        <span class="pill ${inv.risk==='low'?'pill-low':inv.risk==='medium'?'pill-medium':'pill-high'}">${inv.riskLabel}</span>
        <span class="pill pill-return">📈 ${inv.returns}</span>
      </div>
      <div class="w-ic-desc">${inv.desc}</div>
      <div class="w-ic-expand" id="winv-${i}">
        <p style="margin-bottom:12px">${inv.detail}</p>
        ${inv.links && inv.links.length ? `
        <div class="w-inv-links-label">🔗 Invest Now</div>
        <div class="w-inv-links">${inv.links.map(lk=>`
          <a href="${lk.url}" target="_blank" rel="noopener" class="w-inv-link-btn" style="--lk-color:${lk.color}">${lk.label} ↗</a>
        `).join('')}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:11px;color:#6B7280;margin-top:8px" onclick="wToggleInv(${i})" style="cursor:pointer"><span id="winvlbl-${i}">Tap to expand ▼</span></div>
    </div>`).join('');
}
function wToggleInv(i){
  const e=document.getElementById('winv-'+i);
  const l=document.getElementById('winvlbl-'+i);
  e.classList.toggle('open');
  l.textContent=e.classList.contains('open')?'Collapse ▲':'Tap to expand ▼';
}

// ── BUDGET ────────────────────────────────────────────
function wFmt(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
function wAddCat(type){
  const cid=type==='fixed'?'wFixedCats':'wVariableCats';
  const d=document.createElement('div');d.className='w-cat-row';
  d.innerHTML=`<input type="text" class="w-input-sm" placeholder="Category"/><input type="number" class="w-input-sm w-amt" placeholder="₹ Amount"/><button onclick="wDelCat(this)">×</button>`;
  document.getElementById(cid).appendChild(d);
}
function wDelCat(b){b.parentElement.remove();}
function wGetCats(id){
  const rows=[];
  document.querySelectorAll(`#${id} .w-cat-row`).forEach(r=>{
    const ins=r.querySelectorAll('input');
    rows.push({name:ins[0].value.trim()||'Expense',amt:parseFloat(ins[1].value)||0});
  });
  return rows;
}
function wCalcBudget(){
  const income=parseFloat(document.getElementById('wIncome').value)||0;
  if(!income){alert('Enter monthly income first.');return;}
  const fixed=wGetCats('wFixedCats');
  const variable=wGetCats('wVariableCats');
  const all=[...fixed.map(c=>({...c,type:'Fixed'})),...variable.map(c=>({...c,type:'Variable'}))];
  const totalExp=all.reduce((s,c)=>s+c.amt,0);
  const savings=income-totalExp;
  W_STATE.budgetData={income,totalExp,savings,allCats:all};

  const tip=savings<0?'⚠️ Over budget! Cut variable expenses.':savings<income*0.1?'💡 Savings very low. Try 50/30/20 rule.':savings>=income*0.2?'🎉 Great saving! Consider investing surplus.':'👍 Good start! Aim for 20% savings.';
  document.getElementById('wBudgetTip').textContent=tip;

  document.getElementById('wBudgetRows').innerHTML=all.map(c=>`
    <div class="w-budget-rows-item"><span>${c.name} <small style="color:#6B7280">(${c.type})</small></span><span style="font-weight:600">${wFmt(c.amt)}</span></div>`).join('')+`
    <div class="w-budget-rows-item" style="font-weight:700;color:${savings>=0?'#0B6E4F':'#E63946'}">
      <span>${savings>=0?'💎 Available Savings':'⚠️ Over Budget by'}</span><span>${wFmt(Math.abs(savings))}</span>
    </div>`;

  if(W_STATE.budgetChart)W_STATE.budgetChart.destroy();
  W_STATE.budgetChart=new Chart(document.getElementById('wBudgetChart'),{
    type:'doughnut',
    data:{labels:['Needs 50%','Wants 30%','Savings 20%'],datasets:[{data:[income*.5,income*.3,income*.2],backgroundColor:['#2196F3','#F4A261','#0B6E4F'],borderWidth:3,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{label:c=>`${c.label}: ${wFmt(c.parsed)}`}},legend:{position:'bottom',labels:{font:{family:'Poppins',size:12},padding:12}}}}
  });

  document.getElementById('wBudgetResult').style.display='block';

  if(document.getElementById('wTgBudget')&&document.getElementById('wTgBudget').checked)
    wTGSend(`💰 *Budget Update*\nIncome: ${wFmt(income)}\nExpenses: ${wFmt(totalExp)}\nSavings: ${wFmt(savings)}\n\n${tip}`,true);
  if(savings<0&&document.getElementById('wTgOver')&&document.getElementById('wTgOver').checked)
    wTGSend(`⚠️ *Overspending Alert!*\nOver budget by ${wFmt(Math.abs(savings))}. Review expenses!`,true);
}
function wResetBudget(){
  document.getElementById('wBudgetResult').style.display='none';
  if(W_STATE.budgetChart){W_STATE.budgetChart.destroy();W_STATE.budgetChart=null;}
}

// ── CHAT ──────────────────────────────────────────────
let wSessionExp=0;
function wGetReply(msg){
  const lo=msg.toLowerCase();
  const m=lo.match(/add\s+expense\s+(\d+)/);
  if(m){wSessionExp+=parseInt(m[1]);return `✅ Recorded ₹${parseInt(m[1]).toLocaleString('en-IN')}. Session total: ₹${wSessionExp.toLocaleString('en-IN')}`;}
  if(lo.includes('total')||lo.includes('my expense'))return `📊 Session expenses: ₹${wSessionExp.toLocaleString('en-IN')}`;
  for(const r of W_BOT)if(r.t.some(t=>lo.includes(t)))return r.r;
  return "🤔 Try asking about: saving, budgeting, SIP, fraud, or uploading a bank statement.";
}
function wAddBot(text){
  const h=document.getElementById('wChatHistory');
  const d=document.createElement('div');d.className='w-bubble bot';d.textContent=text;
  h.appendChild(d);h.scrollTop=h.scrollHeight;
}
function wAddUser(text){
  const h=document.getElementById('wChatHistory');
  const d=document.createElement('div');d.className='w-bubble user';d.textContent=text;
  h.appendChild(d);h.scrollTop=h.scrollHeight;
}
function wSendChat(){
  const i=document.getElementById('wChatInput');
  const msg=i.value.trim();if(!msg)return;
  i.value='';wAddUser(msg);setTimeout(()=>wAddBot(wGetReply(msg)),400);
}
function wSendQuick(msg){wAddUser(msg);setTimeout(()=>wAddBot(wGetReply(msg)),400);}

// ── CSV ───────────────────────────────────────────────
const W_SAMPLE=`Date,Description,Category,Amount,Type
2024-01-03,Salary Credit,Income,55000,credit
2024-01-05,BigBasket Grocery,Food & Dining,2200,debit
2024-01-07,Swiggy Order,Food & Dining,480,debit
2024-01-08,Uber Ride,Transport,320,debit
2024-01-10,Netflix,Entertainment,649,debit
2024-01-12,HDFC EMI,Loans & EMI,8500,debit
2024-01-14,Electricity,Utilities,1200,debit
2024-01-15,Amazon,Shopping,1850,debit
2024-01-18,Zomato,Food & Dining,390,debit
2024-01-20,Metro Card,Transport,500,debit
2024-01-22,Freelance,Income,12000,credit
2024-01-25,Petrol,Transport,2000,debit
2024-01-28,Rent,Housing,15000,debit
2024-02-01,Salary Credit,Income,55000,credit
2024-02-05,Ola Ride,Transport,250,debit
2024-02-10,HDFC EMI,Loans & EMI,8500,debit
2024-02-14,Gift,Shopping,2200,debit
2024-02-20,Petrol,Transport,1800,debit
2024-02-22,Freelance,Income,8000,credit
2024-02-25,Gym,Health,1500,debit
2024-02-28,Rent,Housing,15000,debit`;

function wParseCSV(txt){
  const lines=txt.trim().split('\n');
  const hds=lines[0].split(',').map(h=>h.trim().toLowerCase());
  return lines.slice(1).filter(l=>l.trim()).map(l=>{
    const v=l.split(',').map(x=>x.trim());
    const o={};hds.forEach((h,i)=>o[h]=v[i]||'');
    const cat=o.category||wAutoCat(o.description||'');
    return {date:o.date||'—',description:o.description||'—',category:cat,amount:Math.abs(parseFloat(o.amount||0)),type:(o.type||'debit').includes('credit')?'credit':'debit'};
  });
}
function wAutoCat(d){
  const lo=d.toLowerCase();
  if(/food|swiggy|zomato|bigbasket|restaurant/.test(lo))return 'Food & Dining';
  if(/uber|ola|metro|petrol|transport|cab/.test(lo))return 'Transport';
  if(/amazon|flipkart|shopping/.test(lo))return 'Shopping';
  if(/netflix|spotify|movie|entertain/.test(lo))return 'Entertainment';
  if(/rent|housing/.test(lo))return 'Housing';
  if(/electric|water|bill/.test(lo))return 'Utilities';
  if(/emi|loan/.test(lo))return 'Loans & EMI';
  if(/doctor|pharmacy|gym|health/.test(lo))return 'Health';
  if(/salary|freelance|income/.test(lo))return 'Income';
  return 'Other';
}
function wHandleCSV(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>wProcessCSV(ev.target.result,f.name);r.readAsText(f);
}
function wLoadSample(){wProcessCSV(W_SAMPLE,'sample_statement.csv');}
function wProcessCSV(txt,fname){
  W_STATE.csvData=wParseCSV(txt);
  if(!W_STATE.csvData.length){alert('Could not parse CSV. Check format.');return;}
  wRenderCSV();
  if(document.getElementById('wTgCSV')&&document.getElementById('wTgCSV').checked){
    const debits=W_STATE.csvData.filter(r=>r.type==='debit');
    const total=debits.reduce((s,r)=>s+r.amount,0);
    wTGSend(`📂 *Statement Uploaded*: ${fname}\n${W_STATE.csvData.length} transactions · Debits: ${wFmt(total)}`,true);
  }
}
function wRenderCSV(){
  const data=W_STATE.csvData;
  const debits=data.filter(r=>r.type==='debit');
  const credits=data.filter(r=>r.type==='credit');
  const td=debits.reduce((s,r)=>s+r.amount,0);
  const tc=credits.reduce((s,r)=>s+r.amount,0);
  document.getElementById('wCsvSummary').innerHTML=`
    <div class="w-sum-card"><div class="w-sum-icon">💳</div><div class="w-sum-val">${wFmt(td)}</div><div class="w-sum-lbl">Total Spent</div></div>
    <div class="w-sum-card"><div class="w-sum-icon">📥</div><div class="w-sum-val" style="color:#0B6E4F">${wFmt(tc)}</div><div class="w-sum-lbl">Total Income</div></div>
    <div class="w-sum-card"><div class="w-sum-icon">📊</div><div class="w-sum-val">${data.length}</div><div class="w-sum-lbl">Transactions</div></div>
    <div class="w-sum-card"><div class="w-sum-icon">${tc-td>=0?'💎':'⚠️'}</div><div class="w-sum-val" style="color:${tc-td>=0?'#0B6E4F':'#E63946'}">${wFmt(Math.abs(tc-td))}</div><div class="w-sum-lbl">${tc-td>=0?'Net Savings':'Net Deficit'}</div></div>`;
  const catMap={};debits.forEach(r=>{catMap[r.category]=(catMap[r.category]||0)+r.amount;});
  const cats=Object.keys(catMap);const vals=cats.map(k=>catMap[k]);
  const PAL=['#0B6E4F','#F4A261','#2196F3','#E63946','#9B59B6','#1ABC9C','#F39C12','#E74C3C'];
  if(W_STATE.catChart)W_STATE.catChart.destroy();
  W_STATE.catChart=new Chart(document.getElementById('wCatChart'),{type:'doughnut',data:{labels:cats,datasets:[{data:vals,backgroundColor:PAL,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Poppins',size:11},padding:10,boxWidth:14}},tooltip:{callbacks:{label:c=>`${c.label}: ${wFmt(c.parsed)}`}}}}});
  const mMap={};data.forEach(r=>{const m=r.date.substring(0,7);if(!mMap[m])mMap[m]={i:0,e:0};if(r.type==='credit')mMap[m].i+=r.amount;else mMap[m].e+=r.amount;});
  const mos=Object.keys(mMap).sort();
  const mNames=mos.map(m=>{const[y,mo]=m.split('-');return new Date(y,mo-1).toLocaleString('en-IN',{month:'short',year:'2-digit'});});
  if(W_STATE.flowChart)W_STATE.flowChart.destroy();
  W_STATE.flowChart=new Chart(document.getElementById('wFlowChart'),{type:'bar',data:{labels:mNames,datasets:[{label:'Income',data:mos.map(m=>mMap[m].i),backgroundColor:'#0B6E4F',borderRadius:6},{label:'Expenses',data:mos.map(m=>mMap[m].e),backgroundColor:'#F4A261',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Poppins',size:11},boxWidth:14}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${wFmt(c.parsed.y)}`}}},scales:{x:{ticks:{font:{family:'Poppins',size:10}}},y:{ticks:{font:{family:'Poppins',size:10},callback:v=>'₹'+(v/1000).toFixed(0)+'k'}}}}});
  wRenderTxTable(data);
  document.getElementById('wCsvUpload').style.display='none';
  document.getElementById('wCsvResults').style.display='block';
}
function wRenderTxTable(data){
  document.getElementById('wTxBody').innerHTML=data.map(r=>`<tr>
    <td>${r.date}</td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.description}">${r.description}</td>
    <td><span class="tx-cat-pill">${r.category}</span></td>
    <td class="${r.type==='debit'?'tx-debit':'tx-credit'}">${r.type==='debit'?'−':'+'}${wFmt(r.amount)}</td>
  </tr>`).join('');
  document.getElementById('wTxCount').textContent=`${data.length} transactions`;
}
function wFilterTx(){
  const q=document.getElementById('wTxSearch').value.toLowerCase();
  if(!q){wRenderTxTable(W_STATE.csvData);return;}
  wRenderTxTable(W_STATE.csvData.filter(r=>r.description.toLowerCase().includes(q)||r.category.toLowerCase().includes(q)||r.date.includes(q)));
}
function wClearCSV(){
  W_STATE.csvData=[];
  if(W_STATE.catChart){W_STATE.catChart.destroy();W_STATE.catChart=null;}
  if(W_STATE.flowChart){W_STATE.flowChart.destroy();W_STATE.flowChart=null;}
  document.getElementById('wCsvFile').value='';
  document.getElementById('wCsvUpload').style.display='block';
  document.getElementById('wCsvResults').style.display='none';
}

// ── TELEGRAM ──────────────────────────────────────────
function wSaveTG(){
  W_STATE.tgToken=document.getElementById('wTgToken').value.trim();
  W_STATE.tgChatId=document.getElementById('wTgChatId').value.trim();
  wSave();wShowTGStatus('✅ Saved!','#0B6E4F');
}
function wShowTGStatus(msg,color){
  const el=document.getElementById('wTgStatus');
  el.textContent=msg;el.style.color=color||'#1A1A2E';
  setTimeout(()=>el.textContent='',4000);
}
async function wTGSend(text,silent=false){
  const tok=W_STATE.tgToken;const cid=W_STATE.tgChatId;
  if(!tok||!cid)return false;
  try{
    const r=await fetch(`https://api.telegram.org/bot${tok}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:cid,text,parse_mode:'Markdown',disable_notification:silent})});
    return r.ok;
  }catch(e){return false;}
}
async function wTestTG(){
  W_STATE.tgToken=document.getElementById('wTgToken').value.trim();
  W_STATE.tgChatId=document.getElementById('wTgChatId').value.trim();
  if(!W_STATE.tgToken||!W_STATE.tgChatId){wShowTGStatus('⚠️ Enter bot token & chat ID first','#E63946');return;}
  wShowTGStatus('📤 Sending…','#6B7280');
  const ok=await wTGSend('🎉 *Finora Web Connected!*\n\nHello from Finora India 🇮🇳\nYour Telegram alerts are now active!\n\n_Powered by Finora India_');
  wShowTGStatus(ok?'✅ Test sent! Check Telegram.':'❌ Failed. Check token & chat ID.',ok?'#0B6E4F':'#E63946');
  if(ok)wSave();
}
async function wSendCustomTG(){
  const msg=document.getElementById('wTgMsg').value.trim();if(!msg)return;
  wShowTGStatus('📤 Sending…','#6B7280');
  const ok=await wTGSend(`📨 *Custom Alert*\n\n${msg}`);
  wShowTGStatus(ok?'✅ Sent!':'❌ Failed. Check credentials.',ok?'#0B6E4F':'#E63946');
  if(ok)document.getElementById('wTgMsg').value='';
}

// ── FRAUD ─────────────────────────────────────────────
function wRenderFraud(){
  document.getElementById('wFraudGrid').innerHTML=W_FRAUD.map(f=>`
    <div class="w-fraud-card">
      <div class="w-fraud-icon">${f.icon}</div>
      <div><div class="w-fraud-title">${f.title}</div><div class="w-fraud-body">${f.body}</div></div>
    </div>`).join('');
}

// ── LOGIN / AUTH ──────────────────────────────────────
const DEMO_EMAIL='demo@finora.in';
const DEMO_PASS='finora123';
const DEMO_NAME='Demo User';

function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value.trim();
  const err=document.getElementById('loginError');
  if(email===DEMO_EMAIL && pass===DEMO_PASS){
    err.style.display='none';
    document.getElementById('loginPage').style.opacity='0';
    document.getElementById('loginPage').style.transition='opacity .4s';
    setTimeout(()=>{
      document.getElementById('loginPage').style.display='none';
      const app=document.getElementById('web-app');
      app.style.display='flex';
      app.style.opacity='0';
      app.style.transition='opacity .4s';
      setTimeout(()=>app.style.opacity='1',50);
      // Set profile
      const initials=DEMO_NAME.split(' ').map(w=>w[0]).join('').toUpperCase();
      document.getElementById('profileInitials').textContent=initials;
      document.getElementById('acctInitialsLg').textContent=initials;
      document.getElementById('acctName').textContent=DEMO_NAME;
      document.getElementById('acctEmail').textContent=DEMO_EMAIL;
      document.getElementById('acctNameVal').textContent=DEMO_NAME;
      document.getElementById('acctEmailVal').textContent=DEMO_EMAIL;
    },400);
  } else {
    err.style.display='block';
    const card=document.querySelector('.login-card');
    card.style.animation='loginShake .3s ease';
    setTimeout(()=>card.style.animation='',400);
  }
}

function doLogout(){
  document.getElementById('accountSettingsOverlay').classList.remove('open');
  const app=document.getElementById('web-app');
  app.style.opacity='0';
  setTimeout(()=>{
    app.style.display='none';
    const lp=document.getElementById('loginPage');
    lp.style.display='flex';
    lp.style.opacity='0';
    setTimeout(()=>lp.style.opacity='1',50);
    lp.style.transition='opacity .4s';
  },300);
}

function togglePass(){
  const p=document.getElementById('loginPass');
  p.type=p.type==='password'?'text':'password';
  document.getElementById('eyeBtn').textContent=p.type==='password'?'👁️':'🙈';
}

// ── ACCOUNT SETTINGS ──────────────────────────────────
function toggleAccountSettings(){
  const ov=document.getElementById('accountSettingsOverlay');
  // Refresh stats
  document.getElementById('acctXpVal').textContent=`${W_STATE.xp} XP · Level ${W_STATE.level}`;
  document.getElementById('acctLessonsVal').textContent=W_STATE.completedLessons.size;
  ov.classList.toggle('open');
}
function closeAccountSettings(e){
  if(e&&e.target!==document.getElementById('accountSettingsOverlay'))return;
  document.getElementById('accountSettingsOverlay').classList.remove('open');
}
function toggleDarkMode(){
  document.documentElement.classList.toggle('dark-mode');
}

// ── INIT ──────────────────────────────────────────────
(function init(){
  wUpdateXP();
  wRenderLessons();
  wRenderInvest();
  wRenderFraud();
  // Allow Enter on login
  document.getElementById('loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
})();

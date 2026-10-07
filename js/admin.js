// ===== DEFAULT DATA =====
const DEFAULT_DATA = {
  credentials: { user: 'admin', pass: 'admin123' },
  email: 'contact@streampro.tv',
  brand: 'StreamPro IPTV',
  plans: [
    { price: 9,  name: 'الباقة الشهرية', period: '/شهر',    devices: 2, save: '',        popular: false },
    { price: 22, name: 'باقة 3 أشهر',    period: '/3 أشهر', devices: 3, save: 'وفر 19%', popular: true  },
    { price: 60, name: 'الباقة السنوية', period: '/سنة',    devices: 5, save: 'وفر 44%', popular: false }
  ],
  testimonials: [
    { id: 1, name: 'أحمد ب.', loc: 'المغرب',  stars: 5, text: 'أفضل خدمة IPTV جربتها — الصورة نقية جداً والقنوات لا تنقطع أبداً. أنصح بها بشدة!' },
    { id: 2, name: 'سارة م.', loc: 'الجزائر', stars: 5, text: 'اشتركت منذ سنة ولم أندم أبداً. الدعم سريع والأسعار معقولة جداً مقارنة بالمنافسين.' },
    { id: 3, name: 'محمد ك.', loc: 'تونس',    stars: 5, text: 'كل مباريات كأس العالم بجودة 4K! لا أتخيل الاشتراك في أي خدمة أخرى بعد الآن.' }
  ],
  faqs: [
    { id: 1, q: 'كيف أبدأ الاشتراك؟',             a: 'بعد اختيار باقتك وإرسال طلبك عبر نموذج التواصل، سيصلك الاشتراك خلال دقائق على بريدك الإلكتروني.' },
    { id: 2, q: 'على أي أجهزة يعمل الاشتراك؟',    a: 'يعمل على Smart TV، Android، iPhone، iPad، PC، Mac، Amazon Firestick، MAG Box وأي جهاز يدعم IPTV.' },
    { id: 3, q: 'هل هناك فترة تجريبية مجانية؟',    a: 'نعم! نوفر تجربة مجانية لمدة 24 ساعة. تواصل معنا وسنرسل لك خطوط تجريبية فوراً.' },
    { id: 4, q: 'ما هي طرق الدفع المتاحة؟',        a: 'نقبل الدفع عبر Crypto، PayPal، بطاقات Visa/Mastercard، وتحويل بنكي. للمزيد تواصل معنا.' },
    { id: 5, q: 'ماذا لو واجهت مشكلة تقنية؟',      a: 'فريق الدعم متاح 24/7 عبر الإيميل. نضمن حل أي مشكلة خلال ساعة واحدة.' }
  ]
};

// ===== STORAGE HELPERS =====
const STORE_KEY = 'streampro_admin';

function loadData() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  const now = new Date().toLocaleString('ar-MA');
  localStorage.setItem(STORE_KEY + '_lastSave', now);
  const el = document.getElementById('lastSaved');
  if (el) el.textContent = now;
}

let DB = loadData();
let nextId = Math.max(
  ...DB.testimonials.map(t => t.id),
  ...DB.faqs.map(f => f.id),
  10
) + 1;

// ===== TOAST =====
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ===== CONFIRM MODAL =====
function confirm(title, msg, onConfirm, isDanger = true) {
  const overlay = document.getElementById('confirmModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent = msg;
  const btn = document.getElementById('modalConfirm');
  btn.className = 'btn-modal-confirm' + (isDanger ? ' danger' : '');
  overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');
  btn.onclick = () => { close(); onConfirm(); };
  document.getElementById('modalCancel').onclick = close;
  overlay.onclick = e => { if (e.target === overlay) close(); };
}

// ===== LOGIN =====
document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (u === DB.credentials.user && p === DB.credentials.pass) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    initDashboard();
  } else {
    err.classList.add('show');
    document.getElementById('loginPass').value = '';
    setTimeout(() => err.classList.remove('show'), 3000);
  }
}

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', () => {
  confirm('تسجيل الخروج', 'هل تريد الخروج من لوحة التحكم؟', () => {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginUser').value = '';
  }, false);
});

// ===== TABS =====
const TITLES = {
  overview: 'نظرة عامة', pricing: 'الأسعار والباقات',
  testimonials: 'آراء العملاء', faq: 'الأسئلة الشائعة', settings: 'الإعدادات'
};

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === 'tab-' + tabId));
  document.getElementById('topbarTitle').textContent = TITLES[tabId] || '';
  closeSidebar();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.goto));
});

// ===== SIDEBAR TOGGLE (mobile) =====
const sidebar = document.getElementById('sidebar');
document.getElementById('sidebarToggle').addEventListener('click', () => sidebar.classList.toggle('open'));
function closeSidebar() { sidebar.classList.remove('open'); }

// ===== SAVE ALL =====
document.getElementById('btnSaveAll').addEventListener('click', () => {
  savePricing();
  saveData(DB);
  toast('تم حفظ كل التغييرات بنجاح');
  updateOverview();
});

// ===== INIT =====
function initDashboard() {
  renderPricing();
  renderTestimonials();
  renderFaqs();
  updateOverview();
  loadSettings();
  const saved = localStorage.getItem(STORE_KEY + '_lastSave');
  if (saved) { const el = document.getElementById('lastSaved'); if (el) el.textContent = saved; }
}

// ===== OVERVIEW UPDATER =====
function updateOverview() {
  const p = DB.plans[0];
  document.getElementById('ov-price1').textContent = '$' + p.price;
  document.getElementById('ov-tcount').textContent = DB.testimonials.length;
  document.getElementById('ov-fcount').textContent = DB.faqs.length;
  document.getElementById('ov-email').textContent = DB.email;
  document.getElementById('sum-p1').textContent = '$' + DB.plans[0].price + DB.plans[0].period;
  document.getElementById('sum-p2').textContent = '$' + DB.plans[1].price + DB.plans[1].period;
  document.getElementById('sum-p3').textContent = '$' + DB.plans[2].price + DB.plans[2].period;
  document.getElementById('sum-email').textContent = DB.email;
  document.getElementById('s-tcount').textContent = DB.testimonials.length;
  document.getElementById('s-fcount').textContent = DB.faqs.length;
}

// ===== PRICING =====
function renderPricing() {
  DB.plans.forEach((plan, i) => {
    const n = i + 1;
    document.getElementById(`p${n}-price`).value   = plan.price;
    document.getElementById(`p${n}-name`).value    = plan.name;
    document.getElementById(`p${n}-devices`).value = plan.devices;
    document.getElementById(`p${n}-save`).value    = plan.save;
    document.getElementById(`p${n}-popular`).checked = plan.popular;
  });
}

function savePricing() {
  DB.plans.forEach((plan, i) => {
    const n = i + 1;
    plan.price   = parseInt(document.getElementById(`p${n}-price`).value) || plan.price;
    plan.name    = document.getElementById(`p${n}-name`).value.trim() || plan.name;
    plan.devices = parseInt(document.getElementById(`p${n}-devices`).value) || plan.devices;
    plan.save    = document.getElementById(`p${n}-save`).value.trim();
    plan.popular = document.getElementById(`p${n}-popular`).checked;
  });
}

document.querySelectorAll('.btn-plan-save').forEach(btn => {
  btn.addEventListener('click', () => {
    savePricing();
    saveData(DB);
    applyPricingToSite();
    toast('تم حفظ الأسعار وتطبيقها على الموقع');
    updateOverview();
  });
});

// Apply pricing changes to index.html pricing section via localStorage flag
function applyPricingToSite() {
  localStorage.setItem('streampro_prices', JSON.stringify(DB.plans));
  localStorage.setItem('streampro_email', DB.email);
  localStorage.setItem('streampro_brand', DB.brand);
  localStorage.setItem('streampro_testimonials', JSON.stringify(DB.testimonials));
  localStorage.setItem('streampro_faqs', JSON.stringify(DB.faqs));
}

// ===== TESTIMONIALS =====
let selectedStars = 5;
document.querySelectorAll('.star-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.star-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    selectedStars = parseInt(opt.dataset.val);
    document.getElementById('t-stars').value = selectedStars;
  });
});

function starStr(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

function renderTestimonials() {
  const list = document.getElementById('testiList');
  if (!DB.testimonials.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>لا توجد آراء بعد. أضف أول رأي!</p></div>`;
    return;
  }
  list.innerHTML = DB.testimonials.map(t => `
    <div class="item-card" data-id="${t.id}">
      <span class="drag-handle" title="سحب للترتيب">⠿</span>
      <div class="item-body">
        <div class="item-title">
          ${t.name}
          <span style="color:var(--gold);font-size:0.85rem">${starStr(t.stars)}</span>
          <span style="color:var(--text-dim);font-size:0.8rem;font-weight:400">${t.loc}</span>
        </div>
        <div class="item-sub">"${t.text}"</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="editTesti(${t.id})">✏️ تعديل</button>
        <button class="btn-del"  onclick="deleteTesti(${t.id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('btnAddTesti').addEventListener('click', () => {
  const name = document.getElementById('t-name').value.trim();
  const loc  = document.getElementById('t-loc').value.trim();
  const text = document.getElementById('t-text').value.trim();
  if (!name || !text) { toast('الاسم والنص مطلوبان', 'error'); return; }
  DB.testimonials.push({ id: nextId++, name, loc: loc || '—', stars: selectedStars, text });
  saveData(DB);
  applyPricingToSite();
  renderTestimonials();
  updateOverview();
  document.getElementById('t-name').value = '';
  document.getElementById('t-loc').value  = '';
  document.getElementById('t-text').value = '';
  toast('تمت إضافة الرأي بنجاح');
});

function deleteTesti(id) {
  confirm('حذف الرأي', 'هل تريد حذف هذا الرأي نهائياً؟', () => {
    DB.testimonials = DB.testimonials.filter(t => t.id !== id);
    saveData(DB);
    applyPricingToSite();
    renderTestimonials();
    updateOverview();
    toast('تم حذف الرأي');
  });
}

function editTesti(id) {
  const t = DB.testimonials.find(x => x.id === id);
  if (!t) return;
  document.getElementById('editModalTitle').textContent = '✏️ تعديل الرأي';
  document.getElementById('editModalBody').innerHTML = `
    <div class="form-row-2" style="gap:12px">
      <div class="field-group"><label>الاسم</label><input type="text" id="em-name" value="${escHtml(t.name)}" /></div>
      <div class="field-group"><label>البلد</label><input type="text" id="em-loc" value="${escHtml(t.loc)}" /></div>
    </div>
    <div class="field-group"><label>النص</label><textarea id="em-text" rows="3">${escHtml(t.text)}</textarea></div>
    <div class="field-group">
      <label>التقييم</label>
      <div class="star-picker" id="em-stars">
        ${[5,4,3].map(v => `<span class="star-opt ${t.stars===v?'active':''}" data-val="${v}">${starStr(v)}</span>`).join('')}
      </div>
      <input type="hidden" id="em-starsval" value="${t.stars}" />
    </div>
  `;
  document.querySelectorAll('#em-stars .star-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#em-stars .star-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      document.getElementById('em-starsval').value = opt.dataset.val;
    });
  });
  const modal = document.getElementById('editModal');
  modal.classList.add('open');
  document.getElementById('editModalSave').onclick = () => {
    t.name  = document.getElementById('em-name').value.trim() || t.name;
    t.loc   = document.getElementById('em-loc').value.trim()  || t.loc;
    t.text  = document.getElementById('em-text').value.trim() || t.text;
    t.stars = parseInt(document.getElementById('em-starsval').value) || t.stars;
    saveData(DB);
    applyPricingToSite();
    renderTestimonials();
    modal.classList.remove('open');
    toast('تم تحديث الرأي');
  };
  document.getElementById('editModalCancel').onclick = () => modal.classList.remove('open');
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
}

// ===== FAQ =====
function renderFaqs() {
  const list = document.getElementById('faqList');
  if (!DB.faqs.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">❓</div><p>لا توجد أسئلة بعد. أضف أول سؤال!</p></div>`;
    return;
  }
  list.innerHTML = DB.faqs.map((f, idx) => `
    <div class="item-card" data-id="${f.id}">
      <span class="drag-handle" title="سحب للترتيب">⠿</span>
      <div class="item-body">
        <div class="item-title">${idx + 1}. ${escHtml(f.q)}</div>
        <div class="item-sub">${escHtml(f.a)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="editFaq(${f.id})">✏️ تعديل</button>
        <button class="btn-del"  onclick="deleteFaq(${f.id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('btnAddFaq').addEventListener('click', () => {
  const q = document.getElementById('f-q').value.trim();
  const a = document.getElementById('f-a').value.trim();
  if (!q || !a) { toast('السؤال والجواب مطلوبان', 'error'); return; }
  DB.faqs.push({ id: nextId++, q, a });
  saveData(DB);
  applyPricingToSite();
  renderFaqs();
  updateOverview();
  document.getElementById('f-q').value = '';
  document.getElementById('f-a').value = '';
  toast('تمت إضافة السؤال بنجاح');
});

function deleteFaq(id) {
  confirm('حذف السؤال', 'هل تريد حذف هذا السؤال نهائياً؟', () => {
    DB.faqs = DB.faqs.filter(f => f.id !== id);
    saveData(DB);
    applyPricingToSite();
    renderFaqs();
    updateOverview();
    toast('تم حذف السؤال');
  });
}

function editFaq(id) {
  const f = DB.faqs.find(x => x.id === id);
  if (!f) return;
  document.getElementById('editModalTitle').textContent = '✏️ تعديل السؤال';
  document.getElementById('editModalBody').innerHTML = `
    <div class="field-group"><label>السؤال</label><input type="text" id="em-q" value="${escHtml(f.q)}" /></div>
    <div class="field-group"><label>الجواب</label><textarea id="em-a" rows="4">${escHtml(f.a)}</textarea></div>
  `;
  const modal = document.getElementById('editModal');
  modal.classList.add('open');
  document.getElementById('editModalSave').onclick = () => {
    f.q = document.getElementById('em-q').value.trim() || f.q;
    f.a = document.getElementById('em-a').value.trim() || f.a;
    saveData(DB);
    applyPricingToSite();
    renderFaqs();
    modal.classList.remove('open');
    toast('تم تحديث السؤال');
  };
  document.getElementById('editModalCancel').onclick = () => modal.classList.remove('open');
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
}

// ===== SETTINGS =====
function loadSettings() {
  document.getElementById('s-email').value = DB.email;
  document.getElementById('s-brand').value = DB.brand;
  // EmailJS
  const ejs = DB.emailjs || {};
  document.getElementById('ejs-service').value  = ejs.serviceId  || '';
  document.getElementById('ejs-template').value = ejs.templateId || '';
  document.getElementById('ejs-pubkey').value   = ejs.publicKey  || '';
  updateEjsBadge();
}

function updateEjsBadge() {
  const ejs = DB.emailjs || {};
  const active = ejs.serviceId && ejs.templateId && ejs.publicKey;
  const badge = document.getElementById('ejsBadge');
  if (badge) {
    badge.textContent = active ? '✓ مفعّل' : 'غير مفعّل';
    badge.className   = 'ejs-badge' + (active ? ' active' : '');
  }
}

function ejsStatus(msg, type) {
  const el = document.getElementById('ejsStatus');
  el.textContent = msg;
  el.className   = `ejs-status show ${type}`;
  if (type !== 'loading') setTimeout(() => el.classList.remove('show'), 5000);
}

document.getElementById('btnSaveEmail').addEventListener('click', () => {
  const email = document.getElementById('s-email').value.trim();
  const brand = document.getElementById('s-brand').value.trim();
  if (!email) { toast('أدخل إيميلاً صحيحاً', 'error'); return; }
  DB.email = email;
  DB.brand = brand || DB.brand;
  saveData(DB);
  applyPricingToSite();
  updateOverview();
  toast('تم حفظ إعدادات الإيميل — سيُطبَّق على الموقع');
});

document.getElementById('btnChangePass').addEventListener('click', () => {
  const oldp = document.getElementById('s-oldpass').value;
  const newp = document.getElementById('s-newpass').value;
  const conf = document.getElementById('s-confirmpass').value;
  if (oldp !== DB.credentials.pass) { toast('كلمة المرور الحالية غير صحيحة', 'error'); return; }
  if (newp.length < 6) { toast('كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)', 'error'); return; }
  if (newp !== conf) { toast('كلمتا المرور غير متطابقتين', 'error'); return; }
  DB.credentials.pass = newp;
  saveData(DB);
  document.getElementById('s-oldpass').value = '';
  document.getElementById('s-newpass').value = '';
  document.getElementById('s-confirmpass').value = '';
  toast('تم تغيير كلمة المرور بنجاح');
});

document.getElementById('btnReset').addEventListener('click', () => {
  confirm(
    '⚠️ إعادة تعيين البيانات',
    'سيتم حذف كل التعديلات وإعادة البيانات الافتراضية. هذا لا يمكن التراجع عنه!',
    () => {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(STORE_KEY + '_lastSave');
      DB = JSON.parse(JSON.stringify(DEFAULT_DATA));
      nextId = 20;
      renderPricing();
      renderTestimonials();
      renderFaqs();
      loadSettings();
      updateOverview();
      applyPricingToSite();
      toast('تم إعادة تعيين كل البيانات');
    }
  );
});

// ===== EMAILJS SETTINGS =====
document.getElementById('btnSaveEJS').addEventListener('click', () => {
  const serviceId  = document.getElementById('ejs-service').value.trim();
  const templateId = document.getElementById('ejs-template').value.trim();
  const publicKey  = document.getElementById('ejs-pubkey').value.trim();
  if (!serviceId || !templateId || !publicKey) {
    ejsStatus('⚠️ يرجى ملء كل الحقول الثلاثة', 'error'); return;
  }
  DB.emailjs = { serviceId, templateId, publicKey };
  saveData(DB);
  applyPricingToSite();
  updateEjsBadge();
  ejsStatus('✓ تم حفظ إعدادات EmailJS بنجاح', 'success');
  toast('تم حفظ EmailJS');
});

document.getElementById('btnTestEJS').addEventListener('click', async () => {
  const ejs = DB.emailjs || {};
  if (!ejs.serviceId || !ejs.templateId || !ejs.publicKey) {
    ejsStatus('⚠️ احفظ إعدادات EmailJS أولاً', 'error'); return;
  }
  const btn = document.getElementById('btnTestEJS');
  btn.disabled = true;
  ejsStatus('⏳ جاري إرسال رسالة تجريبية...', 'loading');
  try {
    await sendViaEmailJS({
      to_email : DB.email,
      from_name: 'Admin Test',
      reply_to : DB.email,
      plan     : 'رسالة تجريبية',
      device   : 'لوحة التحكم',
      message  : 'هذه رسالة تجريبية للتحقق من إعدادات EmailJS.'
    }, ejs);
    ejsStatus('✅ تم الإرسال بنجاح! تحقق من صندوق الوارد.', 'success');
    toast('الرسالة التجريبية أُرسلت بنجاح');
  } catch(err) {
    ejsStatus('❌ فشل الإرسال: ' + (err.text || err.message || err), 'error');
  } finally {
    btn.disabled = false;
  }
});
// ===== EMAILJS CORE =====
async function sendViaEmailJS(params, ejs) {
  emailjs.init(ejs.publicKey);
  const res = await emailjs.send(ejs.serviceId, ejs.templateId, params);
  if (res.status !== 200) throw { text: res.text };
  return true;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== EXPOSE TO HTML onclick =====
window.editTesti  = editTesti;
window.deleteTesti = deleteTesti;
window.editFaq    = editFaq;
window.deleteFaq  = deleteFaq;

// ===== AUTO-APPLY ON LOAD =====
// Push current DB to localStorage keys that index.html reads
applyPricingToSite();

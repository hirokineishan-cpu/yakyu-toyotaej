/* セッション記録（強化と管理だけ）
   投手ごと・日付ごとに、コメントと動画のURL（YouTube など）を残す。
   保存先は Trackman のスプレッドシートの「セッション記録」シート。
   投球データは読まないので軽い（記録と、Trackman の取り込みの一覧だけ）。 */

const CSS = `
#tab-session .pw{ max-width:1180px; margin:0 auto; padding:12px 14px 60px }
#tab-session .hd{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin:6px 2px 12px }
#tab-session .hd h2{ margin:0; font-size:17px; letter-spacing:.05em }
#tab-session .hd .sub{ color:var(--muted); font-size:12px }
#tab-session .hd .sp{ margin-left:auto; display:flex; gap:6px; flex-wrap:wrap }
#tab-session button.b{ appearance:none; font:inherit; font-size:13px; cursor:pointer;
  border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:8px; padding:6px 12px }
#tab-session button.b:hover{ border-color:var(--accent) }
#tab-session button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-session button.b.danger{ color:var(--clay); border-color:var(--clay) }
#tab-session button.b[disabled]{ opacity:.45; cursor:default }
#tab-session select, #tab-session input{ font:inherit; font-size:13px; color:var(--ink);
  background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px; max-width:100% }
#tab-session textarea{ font:inherit; font-size:14px; line-height:1.65; color:var(--ink); background:var(--paper);
  border:1px solid var(--line); border-radius:8px; padding:8px 10px; width:100%; resize:vertical; min-height:6.5em }
#tab-session label.f{ display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--muted); min-width:0 }
#tab-session label.f.wide{ width:100% }
#tab-session label.f.wide input{ width:100% }
#tab-session .bar{ display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;
  background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:10px 12px; margin-bottom:12px }
#tab-session .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:12px 14px; margin-bottom:12px; min-width:0 }
#tab-session .card h3{ margin:0 0 10px; font-size:13px; letter-spacing:.05em; color:var(--ink2); display:flex; align-items:baseline; gap:8px; flex-wrap:wrap }
#tab-session .card h3 .u{ margin-left:auto; font-weight:400; font-size:11.5px; color:var(--muted) }
#tab-session .note{ font-size:11.5px; color:var(--muted); line-height:1.6; margin:2px 0 10px }
#tab-session .err{ font-size:12.5px; color:var(--clay); margin:0 0 10px }
#tab-session .empty{ border:1px dashed var(--line); border-radius:var(--r); padding:22px; text-align:center; color:var(--muted); font-size:13px }
#tab-session .ed{ display:flex; flex-direction:column; gap:10px }
#tab-session .row{ display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end }
#tab-session .act{ display:flex; gap:8px; align-items:center; flex-wrap:wrap }
#tab-session .act .st{ font-size:12px; color:var(--muted) }
#tab-session .dirty{ color:var(--clay); font-weight:700 }
#tab-session .ed.editing{ outline:2px solid color-mix(in srgb, var(--accent) 35%, transparent); outline-offset:6px; border-radius:4px }
#tab-session .list{ display:flex; flex-direction:column; gap:10px }
#tab-session .rec{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:11px 14px }
#tab-session .rec.on{ border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) }
#tab-session .rec .top{ display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; margin-bottom:6px }
#tab-session .rec .dt{ font-family:var(--num); font-size:15px; font-weight:700 }
#tab-session .rec .who{ font-weight:700; font-size:13.5px }
#tab-session .rec .tm{ font-size:11.5px; color:var(--muted) }
#tab-session .rec .top .edit{ margin-left:auto; padding:3px 10px; font-size:12px }
#tab-session .rec .tx{ white-space:pre-wrap; font-size:14px; line-height:1.75; overflow-wrap:anywhere }
#tab-session .rec .vd{ margin-top:6px; font-size:13px; overflow-wrap:anywhere }
#tab-session .rec .vd a{ color:var(--accent) }
#tab-session .rec .by{ margin-top:6px; font-size:11px; color:var(--muted) }
#tab-session .mon{ font-size:12px; color:var(--muted); font-weight:700; letter-spacing:.08em; margin:14px 2px 2px }
@media (max-width:620px){
  #tab-session .pw{ padding:10px 10px 50px }
  #tab-session .bar label.f{ flex:1 1 40% }
  #tab-session .bar select, #tab-session .bar input{ width:100% }
}
`;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + '-' +
  String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fiscalStart = () => { const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; return y + '-04-01'; };
const isUrl = u => /^https?:\/\/\S+$/i.test(String(u || '').trim());
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const dlabel = d => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(String(d || '')); if (!m) return esc(d);
  const w = new Date(+m[1], +m[2] - 1, +m[3]).getDay(); return `${+m[2]}/${+m[3]}<small style="font-size:11px;font-weight:400;color:var(--muted)">（${WEEK[w]}）</small>`; };

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-session'; st.textContent = CSS; document.head.appendChild(st);

  const CFG = CORE.cfg;
  const CONN_KEY = 'hsp-conn-' + CFG.TEAM_ID + CFG.STORE;
  const DBKEY = 'hsp-v3-' + CFG.TEAM_ID + CFG.STORE;
  const conn = () => { try { return JSON.parse(localStorage.getItem(CONN_KEY) || 'null') || {}; } catch (e) { return {}; } };
  /* 選手がログインしているとき：自分の記録を見るだけ（書けない・ほかの選手の記録は届かない） */
  const SELF = String((conn().user || {}).role || '').indexOf('選手') === 0;
  const CACHE_KEY = (SELF ? 'hsp-sess-me-' : 'hsp-sess-') + CFG.TEAM_ID + CFG.STORE;
  const appUrl = () => { let u = ''; if (CFG.APP_URL_B64) { try { u = atob(String(CFG.APP_URL_B64).trim()); } catch (e) {} }
    return conn().url || (/^https?:\/\/.+/.test(u) ? u : ''); };
  async function api(action, payload) {
    const url = appUrl(); if (!url) throw new Error('接続先が設定されていません');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, token: conn().token }, payload || {})) });
    const j = await res.json();
    if (!j.ok && j.error === 'unauthorized') throw new Error(SELF ? 'ログインが切れています。マイページからログインし直してください' : 'ログインが切れています。「ログイン」タブでログインし直してください');
    return j;
  }

  /* ---- 状態 ---- */
  let PITCHERS = [], RECS = [], SESS = [], loaded = false, busy = false, msg = '';
  const F = { pid: '', from: fiscalStart(), to: '' };
  /* 書いている途中の内容。描き直しても消えないようにここに持つ */
  const ED = { id: '', pid: '', date: today(), text: '', url: '', dirty: false, msg: '' };

  /* 名簿は「記録」タブが端末に持っているものを使う（自チームの投手） */
  function rosterFromLocal() {
    let db = null; try { db = JSON.parse(localStorage.getItem(DBKEY) || 'null'); } catch (e) {}
    if (!db || !db.teams) return [];
    const teams = Object.keys(db.teams).map(k => db.teams[k]).filter(t => t && t.mine);
    const mine = teams.length <= 1 ? teams[0] : (teams.find(t => t.name === CFG.TEAM_NAME) || teams.find(t => t.tid === 't-' + CFG.TEAM_ID) || teams[0]);
    if (!mine) return [];
    return (mine.players || []).filter(p => p.isP && p.state !== '退部' && !p.mergedTo)
      .map((p, i) => ({ id: String(p.pid), name: String(p.name || ''), ord: p.ord != null ? p.ord : i }))
      .sort((a, b) => a.ord - b.ord);
  }
  const pname = pid => { const p = PITCHERS.find(x => x.id === String(pid)); return p ? p.name : String(pid || ''); };
  function applySelf(me) { if (me && me.pid) { PITCHERS = [{ id: String(me.pid), name: String(me.name || ''), ord: 0 }]; F.pid = String(me.pid); } }
  function applyRoster() {
    if (SELF) return;
    const r = rosterFromLocal(); if (r.length || !PITCHERS.length) PITCHERS = r;
    if (!ED.pid || !PITCHERS.some(p => p.id === ED.pid)) { if (!ED.dirty) ED.pid = F.pid || (PITCHERS[0] ? PITCHERS[0].id : ''); }
  }
  let ME = null;
  function saveCache() { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ records: RECS, sessions: SESS, me: ME })); } catch (e) {} }
  function warmStart() {
    applyRoster();
    try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && c.records && (!SELF || c.me)) { RECS = c.records; SESS = c.sessions || []; if (SELF) { ME = c.me; applySelf(ME); } loaded = true; } } catch (e) {}
  }
  async function load() {
    busy = true; render();
    try {
      if (SELF) {
        const j = await api('getMyRecords', {});
        if (!j.ok) throw new Error(j.error || '読み込めませんでした');
        ME = j.me; applySelf(ME); RECS = j.records || []; SESS = j.sessions || []; saveCache(); loaded = true; msg = '';
        busy = false; render(); return;
      }
      if (!PITCHERS.length) {   // この端末に名簿がまだ無いときだけ、スプレッドシートから取る
        const m = await api('getMaster').catch(() => null);
        if (m && m.ok && m.master) {
          const ts = (m.master.teams || []).filter(t => String(t['自チーム']) === '1');
          const mine = ts.length <= 1 ? ts[0] : (ts.find(t => String(t['チーム名']) === CFG.TEAM_NAME) || ts[0]);
          const tid = mine ? String(mine['チームID']) : '';
          PITCHERS = (m.master.players || []).filter(x => String(x['チームID']) === tid && String(x['投手']) === '1' && ['退部', '引退', '卒業'].indexOf(String(x['状態'] || '')) < 0 && !String(x['備考'] || '').startsWith('統合先:'))
            .map(x => ({ id: String(x['選手ID']), name: String(x['氏名']), ord: Number(x['順'] || 0) })).sort((a, b) => a.ord - b.ord);
          if (!ED.pid && PITCHERS[0]) ED.pid = PITCHERS[0].id;
        }
      }
      const j = await api('getSessionRecords', {});
      if (!j.ok) throw new Error(j.error || '読み込めませんでした');
      RECS = j.records || []; SESS = j.sessions || []; saveCache(); loaded = true; msg = '';
    } catch (e) { msg = String(e.message || e); }
    busy = false; render();
  }

  /* ---- 画面 ---- */
  const shown = () => RECS.filter(r => (!F.pid || String(r['投手ID']) === F.pid) && (!F.from || String(r['日付']) >= F.from) && (!F.to || String(r['日付']) <= F.to))
    .sort((a, b) => String(b['日付']).localeCompare(String(a['日付'])) || String(b['更新日時'] || '').localeCompare(String(a['更新日時'] || '')));
  const tmOf = (pid, d) => SESS.filter(s => String(s['投手ID']) === String(pid) && String(s['測定日']) === String(d));

  function editor() {
    const url = ED.url.trim();
    const state = ED.msg ? esc(ED.msg) : ED.dirty ? '<span class="dirty">まだ保存していません</span>' : (ED.id ? '保存済み' : '');
    const tm = ED.pid && ED.date ? tmOf(ED.pid, ED.date) : [];
    return `<div class="card"><h3>${ED.id ? 'セッション記録を直す' : '新しいセッション記録'}<span class="u">${ED.id ? `<a href="#" id="ss-new" style="color:var(--accent)">＋ 新しく書く</a>` : '投手ごと・日付ごとに残ります'}</span></h3>
      <div class="ed${ED.id ? ' editing' : ''}">
        <div class="row">
          <label class="f">日付<input type="date" id="ss-date" value="${esc(ED.date)}"></label>
          <label class="f">投手<select id="ss-pid">${PITCHERS.length ? '' : '<option value="">（名簿に投手がいません）</option>'}${PITCHERS.map(p => `<option value="${esc(p.id)}" ${p.id === ED.pid ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
          <span class="note" style="margin:0 0 7px">${tm.length ? 'この日の Trackman：' + tm.map(s => `${esc(s['種別'])} ${esc(s['球数'])}球`).join('、') : ''}</span>
        </div>
        <label class="f wide">コメント<textarea id="ss-text" rows="5" placeholder="例）ストレートのばらつきが小さくなってきた。次はスライダーをゾーンに集めることから。">${esc(ED.text)}</textarea></label>
        <label class="f wide">動画のURL（YouTube など）<input type="url" id="ss-url" value="${esc(ED.url)}" placeholder="https://youtu.be/…" inputmode="url" autocomplete="off" spellcheck="false"></label>
        <div class="act"><button class="b primary" id="ss-save" ${busy ? 'disabled' : ''}>保存</button>
          ${ED.id ? `<button class="b danger" id="ss-del">削除</button>` : ''}
          ${ED.dirty || ED.id ? `<button class="b" id="ss-cancel">${ED.id ? '直すのをやめる' : '書いた内容を消す'}</button>` : ''}
          ${isUrl(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" style="font-size:12.5px;color:var(--accent)">動画を開く ↗</a>` : ''}
          <span class="st" id="ss-state">${state}</span></div>
      </div></div>`;
  }
  function list() {
    const rs = shown();
    if (!rs.length) return `<div class="empty">${RECS.length ? 'この条件のセッション記録はありません' : SELF ? 'まだセッション記録がありません' : 'まだセッション記録がありません。上の欄から書いてください。'}</div>`;
    let lastMon = '', out = '';
    rs.forEach(r => {
      const mon = String(r['日付']).slice(0, 7);
      if (mon !== lastMon) { out += `<div class="mon">${esc(mon.slice(0, 4))}年${+mon.slice(5, 7)}月</div>`; lastMon = mon; }
      const url = String(r['動画URL'] || '').trim(), tm = tmOf(r['投手ID'], r['日付']);
      out += `<div class="rec${String(r['記録ID']) === ED.id ? ' on' : ''}">
        <div class="top"><span class="dt">${dlabel(r['日付'])}</span>${F.pid ? '' : `<span class="who">${esc(pname(r['投手ID']))}</span>`}
          ${tm.length ? `<span class="tm">Trackman ${tm.map(s => `${esc(s['種別'])} ${esc(s['球数'])}球`).join('・')}</span>` : ''}
          ${SELF ? '' : `<button class="b edit" data-edit="${esc(r['記録ID'])}">直す</button>`}</div>
        ${String(r['コメント'] || '').trim() ? `<div class="tx">${esc(String(r['コメント']).trim())}</div>` : ''}
        ${url ? `<div class="vd">動画：${isUrl(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>` : esc(url)}</div>` : ''}
        <div class="by">${esc(r['記録者'] || '')}${!SELF && r['更新日時'] ? '　' + esc(String(r['更新日時']).slice(0, 16)) : ''}</div></div>`;
    });
    return `<div class="list">${out}</div>`;
  }
  function render() {
    const sy = window.scrollY;
    const n = shown().length;
    ROOT.innerHTML = `<div class="pw">
      <div class="hd"><h2>セッション記録</h2><span class="sub">${SELF && ME ? esc(ME.name) + '　' : ''}${RECS.length}件</span>
        <div class="sp"><button class="b" id="ss-refresh" ${busy ? 'disabled' : ''}>${busy ? '更新中…' : '更新'}</button></div></div>
      ${msg ? `<div class="err">${esc(msg)}</div>` : ''}
      ${!loaded ? `<div class="empty">${busy ? '読み込んでいます…' : esc(msg || 'まだ読み込んでいません')}</div>` : (SELF ? '' : editor()) + `
      <div class="bar">
        ${SELF ? '' : `<label class="f">見る投手<select id="ss-fpid"><option value="">全員</option>${PITCHERS.map(p => `<option value="${esc(p.id)}" ${p.id === F.pid ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>`}
        <label class="f">期間 から<input type="date" id="ss-from" value="${esc(F.from)}"></label>
        <label class="f">まで<input type="date" id="ss-to" value="${esc(F.to)}"></label>
        <span class="note" style="margin:0 0 7px auto">${n}件</span></div>` + list()}
    </div>`;
    if (sy) window.scrollTo(0, sy);
  }

  /* ---- 操作 ---- */
  const okDiscard = () => !ED.dirty || !(ED.text.trim() || ED.url.trim()) || window.confirm('保存していない内容があります。書いた内容を消してよいですか。');
  function setED(r) {
    ED.id = r ? String(r['記録ID']) : ''; ED.pid = r ? String(r['投手ID']) : (F.pid || ED.pid || (PITCHERS[0] ? PITCHERS[0].id : ''));
    ED.date = r ? String(r['日付'] || today()) : today(); ED.text = r ? String(r['コメント'] || '') : ''; ED.url = r ? String(r['動画URL'] || '') : '';
    ED.dirty = false; ED.msg = '';
  }
  ROOT.addEventListener('input', e => {
    const id = e.target.id;
    if (id !== 'ss-text' && id !== 'ss-url') return;
    if (id === 'ss-text') ED.text = e.target.value; else ED.url = e.target.value;
    ED.dirty = true; ED.msg = '';
    const s = ROOT.querySelector('#ss-state'); if (s) s.innerHTML = '<span class="dirty">まだ保存していません</span>';
  });
  ROOT.addEventListener('change', e => {
    const id = e.target.id, v = e.target.value;
    if (id === 'ss-date') { ED.date = v; ED.dirty = true; ED.msg = ''; render(); return; }
    if (id === 'ss-pid') { ED.pid = v; ED.dirty = true; ED.msg = ''; render(); return; }
    if (id === 'ss-fpid') { F.pid = v; if (!ED.id && !ED.dirty && v) ED.pid = v; render(); return; }
    if (id === 'ss-from') { F.from = v; render(); return; }
    if (id === 'ss-to') { F.to = v; render(); return; }
  });
  ROOT.addEventListener('click', async e => {
    const t = e.target;
    if (t.id === 'ss-refresh') { load(); return; }
    if (SELF) return;
    if (t.id === 'ss-new') { e.preventDefault(); if (!okDiscard()) return; setED(null); render(); return; }
    if (t.id === 'ss-cancel') { if (!okDiscard()) return; setED(null); render(); return; }
    const ed = t.closest('[data-edit]');
    if (ed) { if (ed.dataset.edit !== ED.id && !okDiscard()) return;
      setED(RECS.find(r => String(r['記録ID']) === ed.dataset.edit) || null); render();
      const c = ROOT.querySelector('.ed'); if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (t.id === 'ss-save') {
      const url = ED.url.trim();
      if (!ED.pid) { ED.msg = '投手を選んでください'; render(); return; }
      if (!ED.date) { ED.msg = '日付を入れてください'; render(); return; }
      if (url && !isUrl(url)) { ED.msg = '動画のURLは https:// から始まるものを入れてください'; render(); return; }
      if (!ED.text.trim() && !url) { ED.msg = 'コメントか動画のURLを入れてください'; render(); return; }
      const id = ED.id || ('s-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
      busy = true; ED.msg = '保存中…'; render();
      try {
        const j = await api('upsertSessionRecord', { row: { '記録ID': id, '投手ID': ED.pid, '日付': ED.date, 'コメント': ED.text, '動画URL': url } });
        if (!j.ok) throw new Error(j.error || '保存できませんでした');
        const k = RECS.findIndex(r => String(r['記録ID']) === id);
        if (k >= 0) RECS[k] = j.row; else RECS.push(j.row);
        saveCache(); const keepPid = ED.pid; setED(null); ED.pid = keepPid; ED.msg = '保存しました';
      } catch (err) { ED.msg = String(err.message || err); }
      busy = false; render(); return;
    }
    if (t.id === 'ss-del') {
      if (!ED.id || !window.confirm(`${pname(ED.pid)}　${ED.date} の記録を削除します。元に戻せません。よろしいですか。`)) return;
      busy = true; ED.msg = '削除中…'; render();
      try {
        const j = await api('deleteSessionRecord', { id: ED.id }); if (!j.ok) throw new Error(j.error || '削除できませんでした');
        RECS = RECS.filter(r => String(r['記録ID']) !== ED.id); saveCache(); setED(null); ED.msg = '削除しました';
      } catch (err) { ED.msg = String(err.message || err); }
      busy = false; render(); return;
    }
  });
  if (!SELF) window.addEventListener('beforeunload', e => { if (ED.dirty && (ED.text.trim() || ED.url.trim())) { e.preventDefault(); e.returnValue = ''; } });
  /* タブを開くたびに、名簿（記録タブで足した投手など）を取り直す */
  ROOT.addEventListener('hsp:show', () => { const b = JSON.stringify(PITCHERS); applyRoster(); if (b !== JSON.stringify(PITCHERS)) render(); });

  warmStart();
  render();
  load();
}

/* フィジカル計測（投手のみ）
   入力：測定日と種目を選んで、投手全員をまとめて記録する
   種目別：1つの種目について、チーム全体を並べて見る
   選手別：1人について、全種目の今と推移を見る            */

const CSS = `
#tab-physical .pw{ max-width:1100px; margin:0 auto; padding:12px 14px 60px }
#tab-physical .hd{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin:6px 2px 12px }
#tab-physical .hd h2{ margin:0; font-size:17px; letter-spacing:.05em }
#tab-physical .hd .sub{ color:var(--muted); font-size:12px }
#tab-physical .hd .sp{ margin-left:auto; display:flex; gap:6px; flex-wrap:wrap }

#tab-physical .seg{ display:inline-flex; background:var(--raise); border:1px solid var(--line);
  border-radius:9px; padding:2px; gap:2px }
#tab-physical .seg button{ appearance:none; border:0; background:transparent; color:var(--ink2);
  font:inherit; font-size:13px; font-weight:600; padding:6px 14px; border-radius:7px; cursor:pointer }
#tab-physical .seg button[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk) }

#tab-physical button.b{ appearance:none; font:inherit; font-size:13px; cursor:pointer;
  border:1px solid var(--line); background:var(--paper); color:var(--ink);
  border-radius:8px; padding:6px 12px }
#tab-physical button.b:hover{ border-color:var(--accent) }
#tab-physical button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-physical button.b[disabled]{ opacity:.45; cursor:default }
#tab-physical select, #tab-physical input{ font:inherit; font-size:13px; color:var(--ink);
  background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px }
#tab-physical label.f{ display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--muted) }

#tab-physical .bar{ display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;
  background:var(--paper); border:1px solid var(--line); border-radius:var(--r);
  padding:10px 12px; margin-bottom:12px }
#tab-physical .note{ font-size:11.5px; color:var(--muted); line-height:1.6; margin:2px 0 10px }
#tab-physical .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r);
  padding:12px 14px; margin-bottom:12px }
#tab-physical .card h3{ margin:0 0 9px; font-size:13px; letter-spacing:.05em; color:var(--ink2);
  display:flex; align-items:baseline; gap:8px }
#tab-physical .card h3 .u{ margin-left:auto; font-weight:400; font-size:11.5px; color:var(--muted) }

#tab-physical table{ width:100%; border-collapse:collapse; font-size:13px }
#tab-physical th, #tab-physical td{ padding:6px 8px; border-bottom:1px solid var(--line); text-align:left; white-space:nowrap }
#tab-physical th{ font-size:11px; color:var(--muted); font-weight:600; letter-spacing:.04em }
#tab-physical td.n, #tab-physical th.n{ text-align:right; font-family:var(--num); font-size:15px }
#tab-physical td.n small{ font-family:var(--jp); font-size:10.5px; color:var(--muted); margin-left:4px }
#tab-physical tr.me td{ background:color-mix(in srgb, var(--accent) 7%, transparent) }
#tab-physical .muted{ color:var(--muted) }

#tab-physical .in{ width:5.6em; text-align:right; font-family:var(--num); font-size:15px; padding:5px 7px }
#tab-physical .in.dirty{ border-color:var(--accent); box-shadow:0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent) }
#tab-physical .in.has{ background:var(--raise) }

#tab-physical .gauge{ position:relative; height:10px; background:var(--ground);
  border-radius:5px; overflow:hidden; min-width:90px }
#tab-physical .gauge i{ position:absolute; left:0; top:0; bottom:0; background:var(--accent); border-radius:5px }
#tab-physical .gauge u{ position:absolute; top:-2px; bottom:-2px; width:2px; background:var(--clay) }
#tab-physical td.g{ width:36%; min-width:120px }

#tab-physical .pill{ display:inline-block; font-size:10.5px; font-weight:700; padding:1px 7px;
  border-radius:99px; letter-spacing:.03em }
#tab-physical .pill.ok{ background:color-mix(in srgb, var(--hit,#1e8a4c) 16%, transparent); color:var(--hit,#1e8a4c) }
#tab-physical .pill.ng{ background:color-mix(in srgb, var(--clay) 16%, transparent); color:var(--clay) }
#tab-physical .pill.na{ background:var(--ground); color:var(--muted) }
#tab-physical .dlt{ font-family:var(--num); font-size:12.5px }
#tab-physical .dlt.up{ color:var(--hit,#1e8a4c) } #tab-physical .dlt.dn{ color:var(--clay) }

#tab-physical .grid2{ display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:12px }
#tab-physical .spark{ display:block }
#tab-physical .cat{ margin:16px 2px 7px; font-size:11.5px; letter-spacing:.09em; color:var(--muted); font-weight:700 }
#tab-physical .empty{ padding:26px; text-align:center; color:var(--muted); font-size:13px;
  border:1px dashed var(--line); border-radius:var(--r) }
#tab-physical .src{ font-size:11px; color:var(--muted); line-height:1.6; margin-top:7px;
  padding-top:7px; border-top:1px dotted var(--line) }

@media (max-width:620px){
  #tab-physical .pw{ padding:10px 10px 50px }
  #tab-physical td.g{ display:none } #tab-physical th.g{ display:none }
}
html.prt #tab-physical .hd .sp, html.prt #tab-physical .seg, html.prt #tab-physical .bar{ display:none !important }
html.prt #tab-physical .pw{ max-width:none; padding:0 }
html.prt #tab-physical .card{ break-inside:avoid; box-shadow:none }
`;

/* ================= 小道具 ================= */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + '-' +
  String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const num = (v, dec) => (v == null || v === '' || isNaN(v)) ? '—' : Number(v).toFixed(dec);
const uid = () => 'me-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* 算出項目：式は持たず、ここに書いてある分だけを計算する */
const DERIVED = {
  'm-lmi': { need: ['m-lbm', 'm-height'], calc: (v) => (v['m-lbm'] && v['m-height'])
      ? v['m-lbm'] / Math.pow(v['m-height'] / 100, 2) : null },
  'm-erir': { need: ['m-hhd-er', 'm-hhd-ir'], calc: (v) => (v['m-hhd-er'] && v['m-hhd-ir'])
      ? v['m-hhd-er'] / v['m-hhd-ir'] * 100 : null }
};

/* 球速連動の基準："140:63" と "150:66" の2点を、目標球速で按分する */
function veloStandard(item, target) {
  if (item['基準の型'] !== '球速連動' || !target) return null;
  const p = String(item['基準1']).split(':').map(Number);
  const q = String(item['基準2']).split(':').map(Number);
  if (p.length !== 2 || q.length !== 2 || isNaN(p[0]) || isNaN(q[0])) return null;
  const [x1, y1] = p, [x2, y2] = q;
  const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
  if (target < lo || target > hi) return { out: true, lo: lo, hi: hi };
  return { val: y1 + (target - x1) * (y2 - y1) / (x2 - x1) };
}

/* 判定：達成 / 不足 / 基準なし */
function judge(item, val, ctx) {
  const t = String(item['基準の型'] || 'なし');
  const b1 = Number(item['基準1']), b2 = Number(item['基準2']);
  if (val == null || val === '' || isNaN(val)) return null;
  if (t === '範囲')  return (val >= b1 && val <= b2) ? ok(`${b1}〜${b2}`) : ng(`目安 ${b1}〜${b2}`);
  if (t === '下限')  return val >= b1 ? ok(`${b1}以上`) : ng(`${b1}以上`);
  if (t === '上限')  return val <= b1 ? ok(`${b1}以下`) : ng(`${b1}以下`);
  if (t === '球速連動') {
    const s = veloStandard(item, ctx && ctx.target);
    if (!s) return null;
    if (s.out) return { cls: 'na', txt: '基準の外', hint: `目標球速 ${s.lo}〜${s.hi} の範囲で判定します` };
    const need = s.val.toFixed(Number(item['小数桁'] || 0));   // 項目の小数桁に合わせる
    return val >= s.val ? ok(`必要 ${need}`) : ng(`必要 ${need}`);
  }
  return null;
  function ok(h) { return { cls: 'ok', txt: '達成', hint: h }; }
  function ng(h) { return { cls: 'ng', txt: '不足', hint: h }; }
}
function judgeDiff(item, l, r) {              // 左右差の判定
  if (String(item['基準の型']) !== '左右差') return null;
  if (l == null || r == null) return null;
  const mx = Math.max(Math.abs(l), Math.abs(r));
  if (!mx) return null;
  const d = Math.abs(l - r) / mx * 100;
  const lim = Number(item['基準1']);
  return { pct: d, cls: d <= lim ? 'ok' : 'ng', txt: d.toFixed(1) + '%',
           hint: `左右差 ${lim}%以内が目安` };
}

/* 折れ線（推移） */
function spark(hist, w, h) {
  if (hist.length < 2) return '';
  const vs = hist.map(x => x.v);
  const lo = Math.min(...vs), hi = Math.max(...vs), sp = (hi - lo) || 1;
  const pts = hist.map((x, i) => {
    const px = 4 + i * (w - 8) / (hist.length - 1);
    const py = h - 5 - (x.v - lo) / sp * (h - 12);
    return px.toFixed(1) + ',' + py.toFixed(1);
  });
  const last = hist[hist.length - 1];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <polyline fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round"
      stroke-linecap="round" points="${pts.join(' ')}"/>
    <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}"
      r="2.6" fill="var(--accent)"/></svg>`;
}

/* ================= 本体 ================= */
export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-physical'; st.textContent = CSS; document.head.appendChild(st);
  const $ = (s, r) => (r || ROOT).querySelector(s);

  const CFG = CORE.cfg;
  const CONN_KEY = 'hsp-conn-' + CFG.TEAM_ID + CFG.STORE;
  const conn = (() => { try { return JSON.parse(localStorage.getItem(CONN_KEY) || 'null'); }
                        catch (e) { return null; } })() || {};
  /* 選手がログインしているとき：自分の記録だけを受け取り、「選手別」の自分のページだけを出す */
  const SELF = String(conn.user && conn.user.role || '').indexOf('選手') === 0;
  const appUrl = () => {
    let u = '';
    if (CFG.APP_URL_B64) { try { u = atob(String(CFG.APP_URL_B64).trim()); } catch (e) {} }
    return conn.url || (/^https?:\/\/.+/.test(u) ? u : '');
  };

  async function api(action, payload) {
    const url = appUrl();
    if (!url) throw new Error('接続先が設定されていません');
    const res = await fetch(url, { method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, token: conn.token }, payload || {})) });
    const j = await res.json();
    if (!j.ok && j.error === 'unauthorized') throw new Error(SELF ? 'ログインが切れています。マイページからログインし直してください' : 'ログインが切れています。「ログイン」タブでログインし直してください');
    return j;
  }

  /* ---- 状態 ---- */
  let view = SELF ? 'player' : 'in';          // in | item | player
  let ITEMS = [], ROWS = [], PITCHERS = [], MASTER = null;
  let selItem = '', selPlayer = '', selDate = today();
  let draft = {};           // 入力中の値  key: pid|itemId|side
  let loaded = false, busy = false, msg = '';
  let masterFresh = false;

  /* ---- 端末に残っているもの（先に見せるためだけ） ---- */
  const DBKEY = 'hsp-v3-' + CFG.TEAM_ID + CFG.STORE;   // 「記録」が持っている名簿
  const PHKEY = (SELF ? 'hsp-ph-me-' : 'hsp-ph-') + CFG.TEAM_ID + CFG.STORE;   // 前回の計測データ（選手本人の分は別の場所）

  function masterFromLocal() {
    let db = null;
    try { db = JSON.parse(localStorage.getItem(DBKEY) || 'null'); } catch (e) {}
    if (!db || !db.teams) return null;
    const teams = [], players = [];
    Object.keys(db.teams).forEach(k => {
      const t = db.teams[k]; if (!t) return;
      teams.push({ 'チームID': t.tid, 'チーム名': t.name, '自チーム': t.mine ? 1 : '' });
      (t.players || []).forEach((p, i) => players.push({
        '選手ID': p.pid, '氏名': p.name, 'チームID': t.tid,
        '打': p.bats || '', '投': p.throws || '', '投手': p.isP ? 1 : '',
        '状態': p.state || '', '備考': p.mergedTo ? '統合先:' + p.mergedTo : '',
        '順': (p.ord != null ? p.ord : i)
      }));
    });
    return teams.length ? { teams: teams, players: players } : null;
  }

  function applyMaster(m) {
    MASTER = m;
    // 自チームが2つ以上あるとき（端末のお試しデータが残っている等）は、設定のチーム名と同じものを優先する
    const cands = (MASTER.teams || []).filter(t => String(t['自チーム']) === '1');
    const mineTeam = cands.length <= 1 ? cands[0] : (cands.find(t => String(t['チーム名']) === CFG.TEAM_NAME) || cands.find(t => String(t['チームID']) === 't-' + CFG.TEAM_ID) || cands[0]);
    const tid = mineTeam ? String(mineTeam['チームID']) : '';
    PITCHERS = (MASTER.players || [])
      .filter(x => String(x['チームID']) === tid && String(x['投手']) === '1'
                && String(x['状態'] || '') !== '退部' && !String(x['備考'] || '').startsWith('統合先:'))
      .sort((a, b) => Number(a['順'] || 0) - Number(b['順'] || 0));
    if (PITCHERS.length && !PITCHERS.some(p => String(p['選手ID']) === selPlayer))
      selPlayer = String(PITCHERS[0]['選手ID']);
  }

  function applyPhys(p) {
    ITEMS = (p.items || []).slice().sort((a, b) => Number(a['順'] || 0) - Number(b['順'] || 0));
    ROWS = p.rows || [];
    if (!selItem && ITEMS.length) {
      const f = ITEMS.find(i => i['入力種別'] === '実測') || ITEMS[0];
      selItem = String(f['項目ID']);
    }
  }

  /* ---- 取得 ---- */
  function applySelf(me) {
    if (!me || !me.pid) return;
    applyMaster({ teams: [{ 'チームID': 'me', 'チーム名': CFG.TEAM_NAME, '自チーム': 1 }],
                  players: [{ '選手ID': me.pid, '氏名': me.name, 'チームID': 'me', '投手': 1, '投': me.hand || '右', '順': 0 }] });
    selPlayer = String(me.pid);
  }
  function warmStart() {          // 通信を待たずに、まず前回の内容を出す
    if (loaded) return;
    let c = null; try { c = JSON.parse(localStorage.getItem(PHKEY) || 'null'); } catch (e) {}
    if (SELF) { if (c && c.items && c.me) { applySelf(c.me); applyPhys(c); loaded = true; } return; }
    const lm = masterFromLocal(); if (lm) applyMaster(lm);
    if (c && c.items && c.items.length) applyPhys(c);
    if (MASTER && ITEMS.length) loaded = true;
  }

  async function load() {
    busy = true; if (!loaded) render();
    const before = loaded ? JSON.stringify({ i: ITEMS, r: ROWS, p: PITCHERS }) : '';
    try {
      let me = null;
      if (SELF) {
        const p = await api('getMyPhysical', {});
        if (!p.ok) throw new Error(p.error || 'フィジカルのデータを取れませんでした');
        me = p.me; applySelf(me); applyPhys(p);
      } else {
        const [m, p] = await Promise.all([
          masterFresh ? null : api('getMaster'),
          api('getPhysical', {})
        ]);
        if (m) {
          if (!m.ok) throw new Error(m.error || 'マスタを取れませんでした');
          applyMaster(m.master); masterFresh = true;
        }
        if (!p.ok) throw new Error(p.error || 'フィジカルのデータを取れませんでした');
        applyPhys(p);
      }
      try { localStorage.setItem(PHKEY, JSON.stringify({ items: ITEMS, rows: ROWS, me })); } catch (e) {}
      const same = before && before === JSON.stringify({ i: ITEMS, r: ROWS, p: PITCHERS });
      loaded = true; msg = '';
      busy = false;
      if (!same) render();          // 内容が同じなら描き直さない（スクロールや入力を邪魔しない）
      return;
    } catch (e) {
      msg = String(e.message || e);
    }
    busy = false; render();
  }

  /* ---- 取り出し ---- */
  const item = id => ITEMS.find(i => String(i['項目ID']) === String(id));
  const pname = pid => { const p = (MASTER && MASTER.players || []).find(x => String(x['選手ID']) === String(pid));
                         return p ? String(p['氏名']) : String(pid); };
  function hist(pid, iid, side) {            // 古い順の [{d,v}]
    const it = item(iid);
    if (it && it['入力種別'] === '算出') return derivedHist(pid, iid, side);
    return ROWS.filter(r => String(r['選手ID']) === String(pid) && String(r['項目ID']) === String(iid)
                         && String(r['側'] || '') === String(side || ''))
      .map(r => ({ d: String(r['測定日']), v: Number(r['値']), id: String(r['計測ID']) }))
      .filter(x => !isNaN(x.v))
      .sort((a, b) => a.d < b.d ? -1 : 1);
  }
  function derivedHist(pid, iid, side) {
    const def = DERIVED[iid]; if (!def) return [];
    const byDate = {};
    def.need.forEach(src => {
      const sideFor = item(src) && item(src)['左右'] === '左右' ? side : '';
      hist(pid, src, sideFor).forEach(x => { (byDate[x.d] = byDate[x.d] || {})[src] = x.v; });
    });
    return Object.keys(byDate).sort().map(d => {
      const v = def.calc(byDate[d]);
      return v == null || !isFinite(v) ? null : { d, v };
    }).filter(Boolean);
  }
  const last = (pid, iid, side) => { const h = hist(pid, iid, side); return h.length ? h[h.length - 1] : null; };
  const prev = (pid, iid, side) => { const h = hist(pid, iid, side); return h.length > 1 ? h[h.length - 2] : null; };
  const target = pid => { const t = last(pid, 'm-target', ''); return t ? t.v : null; };
  const sides = it => (String(it['左右']) === '左右' ? ['左', '右'] : ['']);
  const dec = it => Number(it['小数桁'] || 0);

  /* 軸足・着地脚（右投げなら軸足＝右） */
  function legWord(pid, side) {
    const p = (MASTER && MASTER.players || []).find(x => String(x['選手ID']) === String(pid));
    const th = p ? String(p['投'] || '右') : '右';
    if (!side) return '';
    return side === th ? '軸足' : '着地脚';
  }

  /* ================= 画面：入力 ================= */
  function viewInput() {
    const it = item(selItem);
    if (!it) return '<div class="empty">種目がありません</div>';
    const ss = sides(it);
    const d = dec(it);
    const unit = String(it['単位'] || '');
    const rows = PITCHERS.map(p => {
      const pid = String(p['選手ID']);
      const tds = ss.map(sd => {
        const k = pid + '|' + selItem + '|' + sd;
        const saved = ROWS.find(r => String(r['選手ID']) === pid && String(r['項目ID']) === selItem
                                  && String(r['側'] || '') === sd && String(r['測定日']) === selDate);
        const v = (k in draft) ? draft[k] : (saved ? saved['値'] : '');
        const cls = (k in draft) ? 'in dirty' : (saved ? 'in has' : 'in');
        return `<td class="n"><input class="${cls}" type="number" inputmode="decimal" step="any"
                 data-k="${k}" value="${esc(v)}" aria-label="${esc(p['氏名'])} ${sd}"></td>`;
      }).join('');
      const pv = ss.map(sd => { const q = last(pid, selItem, sd); return q && q.d !== selDate ? q : null; });
      const hint = pv.some(Boolean)
        ? pv.map((q, i) => q ? (ss[i] ? ss[i] + ' ' : '') + num(q.v, d) : '—').join(' / ') + ' <span class="muted">(前回)</span>'
        : '<span class="muted">前回なし</span>';
      return `<tr><td>${esc(p['氏名'])}<small class="muted"> ${esc(p['入学年度'] ? '' : '')}</small></td>${tds}<td class="muted" style="font-size:11.5px">${hint}</td></tr>`;
    }).join('');

    const head = ss.map(sd => `<th class="n">${sd || '値'}${unit ? ' <span class="muted">' + esc(unit) + '</span>' : ''}</th>`).join('');
    const n = Object.keys(draft).length;
    return `
    <div class="bar">
      <label class="f">測定日<input type="date" id="ph-date" value="${selDate}"></label>
      <label class="f">種目${itemSelect('ph-item', selItem, true)}</label>
      <div style="margin-left:auto; display:flex; gap:8px; align-items:center">
        ${n ? `<span class="muted" style="font-size:12px">未保存 ${n}件</span>` : ''}
        <button class="b" id="ph-clear" ${n ? '' : 'disabled'}>取消</button>
        <button class="b primary" id="ph-save" ${n ? '' : 'disabled'}>保存</button>
      </div>
    </div>
    ${itemNote(it)}
    <div class="card"><table>
      <tr><th>投手（${PITCHERS.length}人）</th>${head}<th></th></tr>${rows || '<tr><td colspan="4" class="muted">投手が登録されていません</td></tr>'}
    </table></div>`;
  }

  function itemNote(it) {
    const bits = [];
    const t = String(it['基準の型'] || 'なし');
    if (t === '範囲') bits.push(`目安 ${it['基準1']}〜${it['基準2']} ${esc(it['単位'] || '')}`);
    if (t === '下限') bits.push(`${it['基準1']} 以上`);
    if (t === '左右差') bits.push(`左右差 ${it['基準1']}% 以内`);
    if (t === '球速連動') bits.push(`目標球速に応じて変わる（${it['基準1']} ／ ${it['基準2']}）`);
    if (String(it['左右']) === '左右') bits.push('左右それぞれ記録');
    const note = String(it['出典メモ'] || '');
    if (!bits.length && !note) return '';
    return `<div class="note">${bits.length ? '<b>' + bits.join('　/　') + '</b><br>' : ''}${esc(note)}</div>`;
  }

  function itemSelect(id, sel, measuredOnly) {
    const cats = [];
    ITEMS.forEach(i => { if (measuredOnly && i['入力種別'] === '算出') return;
      const c = String(i['カテゴリ']); if (!cats.includes(c)) cats.push(c); });
    return `<select id="${id}">` + cats.map(c =>
      `<optgroup label="${esc(c)}">` + ITEMS.filter(i => String(i['カテゴリ']) === c)
        .filter(i => !(measuredOnly && i['入力種別'] === '算出'))
        .map(i => `<option value="${esc(i['項目ID'])}"${String(i['項目ID']) === sel ? ' selected' : ''}>${esc(i['項目名'])}</option>`)
        .join('') + '</optgroup>').join('') + '</select>';
  }
  function playerSelect(id, sel) {
    return `<select id="${id}">` + PITCHERS.map(p =>
      `<option value="${esc(p['選手ID'])}"${String(p['選手ID']) === sel ? ' selected' : ''}>${esc(p['氏名'])}</option>`).join('') + '</select>';
  }

  /* ================= 画面：種目別 ================= */
  function viewItem() {
    const it = item(selItem);
    if (!it) return '<div class="empty">種目がありません</div>';
    const ss = sides(it), d = dec(it), unit = String(it['単位'] || '');
    const rows = PITCHERS.map(p => {
      const pid = String(p['選手ID']);
      const vals = ss.map(sd => last(pid, selItem, sd));
      const pvs  = ss.map(sd => prev(pid, selItem, sd));
      const main = vals.find(Boolean);
      const rep = ss.length === 2 && vals[0] && vals[1] ? (vals[0].v + vals[1].v) / 2 : (main ? main.v : null);
      return { pid, name: String(p['氏名']), vals, pvs, rep, date: main ? main.d : '' };
    });
    const have = rows.filter(r => r.rep != null);
    const mx = have.length ? Math.max(...have.map(r => r.rep)) : 0;
    const good = String(it['良い方向'] || '');
    have.sort((a, b) => good === '小さいほど良い' ? a.rep - b.rep : b.rep - a.rep);
    const none = rows.filter(r => r.rep == null);

    const body = have.map((r, i) => {
      const cells = r.vals.map((v, k) => {
        const pv = r.pvs[k];
        const dl = (v && pv) ? v.v - pv.v : null;
        return `<td class="n">${v ? num(v.v, d) : '—'}${dl != null && Math.abs(dl) > 1e-9
          ? `<small class="dlt ${dl > 0 ? 'up' : 'dn'}">${dl > 0 ? '+' : ''}${dl.toFixed(d)}</small>` : ''}</td>`;
      }).join('');
      let jd = '<td class="muted">—</td>';
      if (ss.length === 2 && String(it['基準の型']) === '左右差') {
        const j = judgeDiff(it, r.vals[0] && r.vals[0].v, r.vals[1] && r.vals[1].v);
        if (j) jd = `<td><span class="pill ${j.cls}">${j.txt}</span></td>`;
      } else if (ss.length === 2) {
        const ps = r.vals.map((v, k) => {
          const j = v ? judge(it, v.v, { target: target(r.pid) }) : null;
          return j ? `<span class="pill ${j.cls}">${ss[k]} ${j.txt}</span>` : '';
        }).filter(Boolean).join(' ');
        if (ps) jd = `<td>${ps}</td>`;
      } else {
        const j = judge(it, r.rep, { target: target(r.pid) });
        if (j) jd = `<td><span class="pill ${j.cls}">${j.txt}</span><small class="muted" style="margin-left:6px">${esc(j.hint || '')}</small></td>`;
      }
      const w = mx ? Math.max(3, r.rep / mx * 100) : 0;
      return `<tr${String(r.pid) === selPlayer ? ' class="me"' : ''}>
        <td class="muted" style="width:1.6em">${i + 1}</td>
        <td><a href="#" data-goto="${esc(r.pid)}">${esc(r.name)}</a></td>
        ${cells}${jd}
        <td class="g"><div class="gauge"><i style="width:${w.toFixed(1)}%"></i></div></td>
        <td class="muted" style="font-size:11.5px">${esc(r.date)}</td></tr>`;
    }).join('');

    const head = ss.map(sd => `<th class="n">${sd ? sd : '値'}</th>`).join('');
    return `
    <div class="bar">
      <label class="f">種目${itemSelect('ph-item2', selItem, false)}</label>
      <div style="margin-left:auto"><button class="b" id="ph-print">PDFで保存</button></div>
    </div>
    ${itemNote(it)}
    <div class="card">
      <h3>${esc(it['項目名'])}<span class="u">${esc(unit)}${good ? '　' + esc(good) : ''}</span></h3>
      ${have.length ? `<table><tr><th></th><th>投手</th>${head}<th>${ss.length === 2 && String(it['基準の型']) === '左右差' ? '左右差' : '判定'}</th><th class="g"></th><th>測定日</th></tr>${body}</table>`
        : '<div class="empty">この種目はまだ記録がありません</div>'}
      ${none.length ? `<p class="note" style="margin-top:10px">未計測：${none.map(r => esc(r.name)).join('、')}</p>` : ''}
    </div>`;
  }

  /* ================= 画面：選手別 ================= */
  function viewPlayer() {
    if (!selPlayer) return '<div class="empty">投手が登録されていません</div>';
    const tg = target(selPlayer);
    const cats = [];
    ITEMS.forEach(i => { const c = String(i['カテゴリ']); if (c !== '目標' && !cats.includes(c)) cats.push(c); });
    const blocks = cats.map(c => {
      const list = ITEMS.filter(i => String(i['カテゴリ']) === c);
      const cards = list.map(it => card(it)).filter(Boolean).join('');
      return cards ? `<div class="cat">${esc(c)}</div><div class="grid2">${cards}</div>` : '';
    }).join('');

    function card(it) {
      const iid = String(it['項目ID']), d = dec(it), ss = sides(it);
      const hs = ss.map(sd => hist(selPlayer, iid, sd));
      if (!hs.some(h => h.length)) return '';
      const rows = ss.map((sd, k) => {
        const h = hs[k]; if (!h.length) return '';
        const v = h[h.length - 1], p = h.length > 1 ? h[h.length - 2] : null;
        const dl = p ? v.v - p.v : null;
        // 左右差で見る種目以外は、片側ごとに基準と突き合わせる
        const j = String(it['基準の型']) === '左右差' ? null : judge(it, v.v, { target: tg });
        const leg = legWord(selPlayer, sd);
        return `<tr>${sd ? `<td>${esc(sd)}${leg ? `<small class="muted"> ${leg}</small>` : ''}</td>` : ''}
          <td class="n">${num(v.v, d)}${dl != null && Math.abs(dl) > 1e-9
            ? `<small class="dlt ${dl > 0 ? 'up' : 'dn'}">${dl > 0 ? '+' : ''}${dl.toFixed(d)}</small>` : ''}</td>
          <td style="white-space:normal">${j ? `<span class="pill ${j.cls}">${j.txt}</span><small class="muted" style="margin-left:5px">${esc(j.hint || '')}</small>` : ''}</td>
          <td style="width:68px">${spark(h, 62, 24)}</td></tr>`;
      }).join('');
      let diff = '';
      if (ss.length === 2) {
        const l = hs[0].length ? hs[0][hs[0].length - 1].v : null;
        const r = hs[1].length ? hs[1][hs[1].length - 1].v : null;
        const j = judgeDiff(it, l, r);
        if (j) diff = `<div class="src"><span class="pill ${j.cls}">左右差 ${j.txt}</span> <span class="muted">${esc(j.hint)}</span></div>`;
      }
      const note = String(it['出典メモ'] || '');
      const dates = hs.map(h => h.length ? h[h.length - 1].d : '').filter(Boolean);
      const dtxt = dates.length ? (dates.every(x => x === dates[0]) ? dates[0] : dates.join(' / ')) : '';
      return `<div class="card"><h3>${esc(it['項目名'])}<span class="u">${esc(it['単位'] || '')}${
        dtxt ? '　' + esc(dtxt) : ''}</span></h3>
        <table>${rows}</table>${diff}${note ? `<div class="src">${esc(note)}</div>` : ''}</div>`;
    }

    const tgTxt = tg ? `目標球速 <b>${tg}</b> km/h` : (SELF ? '<span class="muted">目標球速はまだ入っていません</span>' : '<span class="muted">目標球速が未入力です（入力タブの「目標球速」で登録すると、球速連動の基準が出ます）</span>');
    return `
    <div class="bar">
      ${SELF ? '' : `<label class="f">投手${playerSelect('ph-player', selPlayer)}</label>`}
      <div style="margin-left:auto"><button class="b" id="ph-print">PDFで保存</button></div>
    </div>
    <div class="note" id="print-head"><b style="font-size:14px">${esc(pname(selPlayer))}</b>　${tgTxt}
      <span class="muted">作成 ${today()}　取扱注意</span></div>
    ${blocks || '<div class="empty">この投手はまだ記録がありません</div>'}`;
  }

  /* ================= 描画 ================= */
  function render() {
    const sy = window.scrollY;
    if (SELF) view = 'player';
    const tabs = SELF ? [] : [['in', '入力'], ['item', '種目別'], ['player', '選手別']];
    const body = !loaded
      ? (busy ? '<div class="empty">読み込んでいます…</div>'
              : `<div class="empty">${esc(msg || 'まだ読み込んでいません')}<br><br><button class="b" id="ph-reload">読み込む</button></div>`)
      : (view === 'in' ? viewInput() : view === 'item' ? viewItem() : viewPlayer());
    ROOT.innerHTML = `<div class="pw">
      <div class="hd">
        <h2>フィジカル計測</h2>
        <span class="sub">${SELF ? `記録 ${ROWS.length}件` : `投手 ${PITCHERS.length}人・記録 ${ROWS.length}件`}</span>
        <div class="sp">
          ${tabs.length ? `<div class="seg">${tabs.map(([k, n]) =>
            `<button data-v="${k}" aria-pressed="${view === k}">${n}</button>`).join('')}</div>` : ''}
          <button class="b" id="ph-refresh">更新</button>
        </div>
      </div>
      ${msg && loaded ? `<div class="note" style="color:var(--clay)">${esc(msg)}</div>` : ''}
      ${body}</div>`;
    if (sy) window.scrollTo(0, sy);
  }

  /* ================= 操作 ================= */
  ROOT.addEventListener('click', async e => {
    const v = e.target.closest('[data-v]');
    if (v) { if (!SELF) view = v.dataset.v; render(); return; }
    const g = e.target.closest('[data-goto]');
    if (g) { e.preventDefault(); selPlayer = g.dataset.goto; view = 'player'; render(); return; }
    if (e.target.id === 'ph-reload' || e.target.id === 'ph-refresh') { masterFresh = false; load(); return; }
    if (e.target.id === 'ph-clear') { draft = {}; render(); return; }
    if (e.target.id === 'ph-print') {
      document.documentElement.classList.add('prt');
      setTimeout(() => { window.print();
        setTimeout(() => document.documentElement.classList.remove('prt'), 400); }, 60);
      return;
    }
    if (e.target.id === 'ph-save') { if (!SELF) await save(); return; }
  });

  ROOT.addEventListener('change', e => {
    if (e.target.id === 'ph-date')   { selDate = e.target.value || today(); draft = {}; render(); }
    if (e.target.id === 'ph-item')   { selItem = e.target.value; draft = {}; render(); }
    if (e.target.id === 'ph-item2')  { selItem = e.target.value; render(); }
    if (e.target.id === 'ph-player') { selPlayer = e.target.value; render(); }
  });

  ROOT.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (!k) return;
    draft[k] = e.target.value;
    e.target.classList.add('dirty');
    const n = Object.keys(draft).length;
    const s = $('#ph-save'), c = $('#ph-clear');
    if (s) s.disabled = !n; if (c) c.disabled = !n;
  });

  async function save() {
    if (busy) return;
    busy = true;
    const btn = $('#ph-save'); if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
    const rows = [];
    Object.keys(draft).forEach(k => {
      const [pid, iid, sd] = k.split('|');
      const cur = ROWS.find(r => String(r['選手ID']) === pid && String(r['項目ID']) === iid
                              && String(r['側'] || '') === sd && String(r['測定日']) === selDate);
      rows.push({
        '計測ID': cur ? cur['計測ID'] : uid(),
        '選手ID': pid, '測定日': selDate, '項目ID': iid, '側': sd,
        '値': draft[k] === '' ? '' : Number(draft[k]),
        '機器': cur ? (cur['機器'] || '') : '', '備考': cur ? (cur['備考'] || '') : '',
        '記録者': (conn.user && conn.user.name) || '', '更新日時': Date.now()
      });
    });
    try {
      const j = await api('upsertMeasures', { rows });
      if (!j.ok) throw new Error(j.error || '保存できませんでした');
      draft = {}; busy = false;
      await load();
      msg = `保存しました（追加${j.added || 0} / 更新${j.updated || 0}${j.removed ? ' / 削除' + j.removed : ''}）`;
      render();
      setTimeout(() => { msg = ''; render(); }, 4000);
    } catch (e) {
      msg = String(e.message || e); busy = false; render();
    }
  }

  /* タブを開くたびに、記録タブが端末に持っている名簿（追加した選手・投げ手の変更）を取り直す */
  ROOT.addEventListener('hsp:show', () => {
    if (!loaded && !busy) { load(); return; }
    if (SELF) return;
    const lm = masterFromLocal(); if (lm) { const b = JSON.stringify(PITCHERS); applyMaster(lm); if (b !== JSON.stringify(PITCHERS)) render(); }
  });
  warmStart();
  render();
  load();
}

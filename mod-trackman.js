/* Trackman（投手のみ・強化と管理だけ）
   取り込み：投手を選んでCSVを上げる。中身の確認、回転数の取りこぼし検出
   数字は Trackman が計測したものだけを使う（空欄を計算で埋めることはしない）
   個人　　：1投手の球種別の表とグラフ（変化量・リリース点・球速・コース・推移）
   チーム　：全投手を並べて比べる
   比較　　：数人を同じ図に重ねる                                        */

const CSS = `
#tab-trackman .pw{ max-width:1180px; margin:0 auto; padding:12px 14px 60px }
#tab-trackman .hd{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin:6px 2px 12px }
#tab-trackman .hd h2{ margin:0; font-size:17px; letter-spacing:.05em }
#tab-trackman .hd .sub{ color:var(--muted); font-size:12px }
#tab-trackman .hd .sp{ margin-left:auto; display:flex; gap:6px; flex-wrap:wrap }
#tab-trackman .seg{ display:inline-flex; background:var(--raise); border:1px solid var(--line);
  border-radius:9px; padding:2px; gap:2px }
#tab-trackman .seg button{ appearance:none; border:0; background:transparent; color:var(--ink2);
  font:inherit; font-size:13px; font-weight:600; padding:6px 14px; border-radius:7px; cursor:pointer }
#tab-trackman .seg button[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk) }
#tab-trackman button.b{ appearance:none; font:inherit; font-size:13px; cursor:pointer;
  border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:8px; padding:6px 12px }
#tab-trackman button.b:hover{ border-color:var(--accent) }
#tab-trackman button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-trackman button.b.danger{ color:var(--clay); border-color:var(--clay) }
#tab-trackman button.b[disabled]{ opacity:.45; cursor:default }
#tab-trackman select, #tab-trackman input{ font:inherit; font-size:13px; color:var(--ink);
  background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px }
#tab-trackman input[type=number]{ width:5.5em; font-family:var(--num) }
#tab-trackman label.f{ display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--muted) }
#tab-trackman label.c{ display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--ink2); cursor:pointer }
#tab-trackman .bar{ display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;
  background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:10px 12px; margin-bottom:12px }
#tab-trackman .note{ font-size:11.5px; color:var(--muted); line-height:1.6; margin:2px 0 10px }
#tab-trackman .warn{ font-size:12.5px; color:var(--clay); background:color-mix(in srgb, var(--clay) 9%, transparent);
  border:1px solid color-mix(in srgb, var(--clay) 40%, transparent); border-radius:var(--r); padding:9px 12px; margin:8px 0; line-height:1.6 }
#tab-trackman .ok{ font-size:12.5px; color:var(--hit,#1e8a4c); background:color-mix(in srgb, var(--hit,#1e8a4c) 9%, transparent);
  border:1px solid color-mix(in srgb, var(--hit,#1e8a4c) 35%, transparent); border-radius:var(--r); padding:9px 12px; margin:8px 0; line-height:1.6 }
#tab-trackman .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:12px 14px; margin-bottom:12px; min-width:0 }
#tab-trackman .card h3{ margin:0 0 9px; font-size:13px; letter-spacing:.05em; color:var(--ink2); display:flex; align-items:baseline; gap:8px; flex-wrap:wrap }
#tab-trackman .card h3 .u{ margin-left:auto; font-weight:400; font-size:11.5px; color:var(--muted) }
#tab-trackman .tw{ overflow-x:auto; -webkit-overflow-scrolling:touch }
#tab-trackman table{ width:100%; border-collapse:collapse; font-size:13px }
#tab-trackman th, #tab-trackman td{ padding:5px 8px; border-bottom:1px solid var(--line); text-align:left; white-space:nowrap }
#tab-trackman th{ font-size:11px; color:var(--muted); font-weight:600; letter-spacing:.04em }
#tab-trackman th.s{ cursor:pointer } #tab-trackman th.s:hover{ color:var(--ink) }
#tab-trackman td.n, #tab-trackman th.n{ text-align:right; font-family:var(--num); font-size:14px }
#tab-trackman td.n small{ font-family:var(--jp); font-size:10px; color:var(--muted); margin-left:3px }
#tab-trackman td.est{ color:var(--muted) }
#tab-trackman tr.me td{ background:color-mix(in srgb, var(--accent) 7%, transparent) }
#tab-trackman .muted{ color:var(--muted) }
#tab-trackman .sw{ display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:5px; vertical-align:-1px }
#tab-trackman .pill{ display:inline-block; font-size:10.5px; font-weight:700; padding:1px 7px; border-radius:99px }
#tab-trackman .pill.bad{ background:color-mix(in srgb, var(--clay) 16%, transparent); color:var(--clay) }
#tab-trackman .pill.est{ background:var(--ground); color:var(--muted); font-weight:600 }
#tab-trackman .pill.live{ background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent) }
#tab-trackman .grid2{ display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:12px }
#tab-trackman .grid3{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px }
#tab-trackman svg.ch{ display:block; width:100%; height:auto; font-family:var(--jp) }
#tab-trackman svg.ch text{ font-size:10px; fill:var(--muted) }
#tab-trackman svg.ch .ax{ stroke:color-mix(in srgb, var(--line) 45%, transparent); stroke-width:.8 }
#tab-trackman svg.ch .ax0{ stroke:var(--ink2); stroke-width:1; opacity:.5 }
#tab-trackman svg.ch .zone{ fill:none; stroke:var(--ink2); stroke-width:1.2 }
#tab-trackman .sim .simrow{ display:grid; grid-template-columns: minmax(0,2.6fr) minmax(0,1fr); gap:14px; align-items:start }
@media (max-width:820px){ #tab-trackman .sim .simrow{ grid-template-columns:1fr } }
#tab-trackman .sim th.c1{ background:color-mix(in srgb, var(--accent) 8%, transparent) }
#tab-trackman .sim th.c2{ background:color-mix(in srgb, var(--clay) 9%, transparent) }
#tab-trackman .sim th[colspan]{ text-align:center }
#tab-trackman svg.ch .lab{ font-size:11px; fill:var(--ink2); font-weight:600 }
#tab-trackman .legend{ display:flex; gap:10px; flex-wrap:wrap; font-size:11.5px; color:var(--ink2); margin:4px 0 6px }
#tab-trackman .legend .cnt{ color:var(--muted); font-family:var(--num) }
#tab-trackman .empty{ padding:26px; text-align:center; color:var(--muted); font-size:13px; border:1px dashed var(--line); border-radius:var(--r) }
#tab-trackman .drop{ border:2px dashed var(--line); border-radius:var(--r); padding:26px; text-align:center; color:var(--muted);
  font-size:13px; cursor:pointer; background:var(--paper) }
#tab-trackman .drop.over{ border-color:var(--accent); background:color-mix(in srgb, var(--accent) 6%, transparent) }
#tab-trackman .kv{ display:grid; grid-template-columns:auto 1fr; gap:4px 14px; font-size:13px; margin:8px 0 }
#tab-trackman .kv b{ color:var(--muted); font-weight:600; font-size:11.5px }
#tab-trackman .kpis{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px }
#tab-trackman .kpi{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:8px 14px; min-width:120px }
#tab-trackman .kpi b{ display:block; font-size:10.5px; color:var(--muted); font-weight:600; letter-spacing:.05em }
#tab-trackman .kpi span{ font-family:var(--num); font-size:20px }
#tab-trackman .kpi small{ font-family:var(--jp); font-size:10.5px; color:var(--muted); margin-left:3px }
#tab-trackman .chips{ display:flex; gap:6px; flex-wrap:wrap }
#tab-trackman .chip{ font-size:12px; padding:4px 10px; border:1px solid var(--line); border-radius:99px; background:var(--paper); cursor:pointer; color:var(--ink2) }
#tab-trackman .chip[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk); border-color:var(--accent) }
#tab-trackman .ktiles{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:8px }
#tab-trackman .ktile{ border:1px solid var(--line); border-radius:10px; padding:8px 10px; background:var(--raise); min-width:0 }
#tab-trackman .ktile.zone{ background:color-mix(in srgb, var(--hit,#1e8a4c) 10%, var(--paper)); border-color:color-mix(in srgb, var(--hit,#1e8a4c) 45%, transparent) }
#tab-trackman .ktile.mid{ background:color-mix(in srgb, #c98a00 8%, var(--paper)) }
#tab-trackman .ktile .kk{ font-size:10.5px; color:var(--muted); font-weight:700; letter-spacing:.05em }
#tab-trackman .ktile .ktv{ font-family:var(--num); font-size:22px; font-weight:700; line-height:1.2 }
#tab-trackman .ktile .ktv small{ font-family:var(--jp); font-size:10.5px; font-weight:400; color:var(--muted); margin-left:2px }
#tab-trackman .ktile .kd{ font-size:11.5px; font-weight:700 } #tab-trackman .ktile .kd span{ font-weight:400; color:var(--muted) }
#tab-trackman .ktile .kt{ font-size:10px; color:var(--muted); margin-top:1px }
#tab-trackman .kbadge{ display:inline-block; margin-left:6px; font-family:var(--jp); font-size:9.5px; font-weight:700; color:#fff; background:var(--hit,#1e8a4c); border-radius:99px; padding:2px 7px; vertical-align:4px }
#tab-trackman .kgrid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(440px,1fr)); gap:12px }
#tab-trackman .kgrid td.n, #tab-trackman .kgrid th.n{ font-size:13px }
#tab-trackman .kgrid th, #tab-trackman .kgrid td{ padding:5px 6px }
@media (max-width:980px){ #tab-trackman .kgrid{ grid-template-columns:1fr } }
#tab-trackman .seg3{ display:flex; gap:4px; background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:4px; margin-bottom:12px }
#tab-trackman .seg3 button{ flex:1; appearance:none; border:0; background:transparent; font:inherit; color:var(--ink2); font-size:13.5px; font-weight:700; padding:8px 6px; border-radius:9px; cursor:pointer; line-height:1.35 }
#tab-trackman .seg3 button small{ display:block; font-size:10.5px; font-weight:400; color:var(--muted) }
#tab-trackman .seg3 button .sh{ display:none }
#tab-trackman .seg3 button[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk) }
#tab-trackman .seg3 button[aria-pressed="true"] small{ color:inherit; opacity:.8 }
#tab-trackman td .dl, #tab-trackman .kpi .dl{ display:block; font-family:var(--num); font-size:10.5px; font-weight:700; color:var(--muted); line-height:1.3 }
#tab-trackman .dl.up{ color:var(--hit,#1e8a4c) }
#tab-trackman .dl.dn{ color:var(--clay) }
#tab-trackman .rk{ display:inline-block; font-family:var(--jp); font-size:10px; font-weight:700; border-radius:6px; padding:1px 5px; margin-left:4px; background:var(--raise); color:var(--ink2); vertical-align:1px }
#tab-trackman .rk.hi{ background:color-mix(in srgb, var(--hit,#1e8a4c) 14%, transparent); color:var(--hit,#1e8a4c) }
#tab-trackman .rk.lo{ background:color-mix(in srgb, var(--clay) 13%, transparent); color:var(--clay) }
#tab-trackman .tsub{ font-size:11px; font-weight:700; color:var(--muted); letter-spacing:.05em; margin:10px 0 2px }
#tab-trackman .tsub:first-of-type{ margin-top:0 }
#tab-trackman .strip b{ display:block; font-size:10.5px; color:var(--muted); letter-spacing:.04em }
#tab-trackman .info{ font-size:12.5px; color:var(--ink2); background:var(--raise); border:1px solid var(--line); border-radius:var(--r); padding:9px 12px; margin:8px 0; line-height:1.6 }
html.prt #tab-trackman .ktiles{ grid-template-columns:repeat(4,1fr) }
html.prt #tab-trackman .kgrid{ grid-template-columns:1fr 1fr }
@media (max-width:620px){
  #tab-trackman .ktiles{ grid-template-columns:repeat(2,minmax(0,1fr)) }
  #tab-trackman .pw{ padding:10px 10px 50px }
  #tab-trackman .seg button{ padding:6px 9px; font-size:12px }
  #tab-trackman .seg3 button{ font-size:12px; padding:7px 3px }
  #tab-trackman .seg3 button small, #tab-trackman .seg3 button .ln{ display:none }
  #tab-trackman .seg3 button .sh{ display:inline }
}
html.prt #tab-trackman .hd .sp, html.prt #tab-trackman .seg, html.prt #tab-trackman .bar, html.prt #tab-trackman .noprint{ display:none !important }
html.prt #tab-trackman .pw{ max-width:none; padding:0 }
html.prt #tab-trackman .sim .simrow{ grid-template-columns:minmax(0,2.6fr) minmax(0,1fr) }
html.prt #tab-trackman .card{ break-inside:avoid; box-shadow:none }
/* 印刷では表を横スクロールにせず、文字を小さくして用紙の幅に全部の列を収める */
html.prt #tab-trackman .tw{ overflow:visible }
html.prt #tab-trackman table{ font-size:9.5px }
html.prt #tab-trackman th, html.prt #tab-trackman td{ padding:3px 3px }
html.prt #tab-trackman th{ font-size:8.5px; letter-spacing:0; white-space:normal; vertical-align:bottom; line-height:1.25 }
html.prt #tab-trackman td.n, html.prt #tab-trackman th.n{ font-size:10px }
html.prt #tab-trackman td.n small{ font-size:7.5px; margin-left:1px }
`;

/* ================= 小道具 ================= */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + '-' +
  String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const isNum = v => v !== '' && v != null && !isNaN(v);
const num = (v, dec) => isNum(v) ? Number(v).toFixed(dec) : '—';
const uid = p => (p || 'tm-') + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const r1 = v => isNum(v) ? Math.round(v * 10) / 10 : '';
const r2 = v => isNum(v) ? Math.round(v * 100) / 100 : '';
const r3 = v => isNum(v) ? Math.round(v * 1000) / 1000 : '';
const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
const sd = a => { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1)); };
const median = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); const h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const nums = (rows, k) => rows.map(r => r[k]).filter(isNum).map(Number);
/* 年度は4月始まり */
const fiscalYear = () => { const d = new Date(); return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; };
const fiscalStart = () => fiscalYear() + '-04-01';
/* 学年：入学年度から（4月始まり）。入学年度が無ければ '' */
const gradeOf = p => (isNum(p['入学年度']) && Number(p['入学年度'])) ? fiscalYear() - Number(p['入学年度']) + 1 : '';

/* 球種の色。設定シートに日本語名があればそれを使う */
const TYPE_COLOR = { Fastball: 'var(--t8)', TwoSeamFastBall: 'var(--t2)', Sinker: 'var(--t2)', Cutter: 'var(--t7)',
  Slider: 'var(--t4)', Curveball: 'var(--t1)', ChangeUp: 'var(--t3)', Splitter: 'var(--t5)', Knuckleball: 'var(--t6)', Other: 'var(--t0)', '': 'var(--t0)' };
const TYPE_ORDER = ['Fastball', 'TwoSeamFastBall', 'Sinker', 'Cutter', 'Slider', 'Curveball', 'ChangeUp', 'Splitter', 'Knuckleball', 'Other', ''];
const typeColor = t => TYPE_COLOR[t] || 'var(--t0)';
/* 球速比（その投手のストレート平均 = 100%）で色の濃さを変える。70%で薄く、100%以上で最も濃い */
const shade = (color, ratio) => { if (!isNum(ratio)) return color;
  const pct = Math.round(Math.max(28, Math.min(100, 28 + (Number(ratio) - 0.70) / 0.30 * 72)));
  return `color-mix(in srgb, ${color} ${pct}%, var(--paper))`; };
const veloRef = rows => { const fb = rows.filter(r => r['球種'] === 'Fastball' && isNum(r['球速'])).map(r => Number(r['球速']));
  if (fb.length) return mean(fb); const all = rows.filter(r => isNum(r['球速'])).map(r => Number(r['球速'])); return all.length ? Math.max(...all) : null; };
const HAND_COLOR = { '右': 'var(--accent)', '左': 'var(--clay)' };

/* ================= CSV ================= */
function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c === '\r') { /* skip */ }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const hdr = rows[0].map(h => h.replace(/^﻿/, '').trim());
  return rows.slice(1).filter(r => r.some(x => x.trim() !== '')).map(r => {
    const o = {}; hdr.forEach((h, i) => o[h] = (r[i] == null ? '' : r[i]).trim()); return o;
  });
}
const normDate = s => {
  const m = String(s || '').match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  return m ? m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0') : '';
};
const f = v => (v === '' || v == null || isNaN(v)) ? '' : Number(v);

/* ================= 軌道からの計算 =================
   CSVの x0..az0（y0=15.24m から先の2次式）で、Trackmanが出していない値を計算する。
   横方向は、軌道の x 軸と報告値の符号が逆なので反転して使う（実測で確認済み）。 */
const G = 9.80665, Y_PLATE = 0.4318, Y_MOUND = 18.44;
function solveT(y0, vy, ay, yt) {
  const A = 0.5 * ay, B = vy, C = y0 - yt;
  if (Math.abs(A) < 1e-9) return -C / B;
  const disc = B * B - 4 * A * C; if (disc < 0) return null;
  const s = Math.sqrt(disc), t1 = (-B - s) / (2 * A), t2 = (-B + s) / (2 * A);
  return Math.abs(t1) < Math.abs(t2) ? t1 : t2;
}
function trajectory(rec, ext) {
  const P = ['x0', 'z0', 'vx0', 'vy0', 'vz0', 'ax0', 'ay0', 'az0'];
  if (!P.every(k => isNum(rec[k]))) return null;
  // 投球としてありえない軌道（打球を追ってしまった等）は使わない
  if (Math.abs(rec.x0) > 2 || rec.z0 < 0.3 || rec.z0 > 3 || rec.vy0 > -15 || rec.vy0 < -55 || rec.ay0 < 0) return null;
  const y0 = isNum(rec.y0) ? Number(rec.y0) : 15.24;
  const x0 = -Number(rec.x0), z0 = Number(rec.z0), vx = -Number(rec.vx0), vy = Number(rec.vy0), vz = Number(rec.vz0);
  const ax = -Number(rec.ax0), ay = Number(rec.ay0), az = Number(rec.az0);
  const pos = (p, v, a, t) => p + v * t + 0.5 * a * t * t, vel = (v, a, t) => v + a * t;
  const tp = solveT(y0, vy, ay, Y_PLATE); if (tp == null) return null;
  const out = {};
  out.plateX = pos(x0, vx, ax, tp); out.plateZ = pos(z0, vz, az, tp);
  // ベース手前で地面に着く・大きく外れる軌道（ワンバウンドや追跡ミス）は使わない
  if (out.plateZ < 0 || out.plateZ > 3 || Math.abs(out.plateX) > 1.5) return null;
  const vxp = vel(vx, ax, tp), vyp = vel(vy, ay, tp), vzp = vel(vz, az, tp);
  out.vaa = Math.atan2(vzp, -vyp) * 180 / Math.PI;
  out.haa = Math.atan2(vxp, -vyp) * 180 / Math.PI;
  // マグヌス加速度から有効回転数（推定）
  const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
  const a = [ax, ay, az + G], vh = [vx / v, vy / v, vz / v];
  const dot = a[0] * vh[0] + a[1] * vh[1] + a[2] * vh[2];
  const aM = Math.hypot(a[0] - dot * vh[0], a[1] - dot * vh[1], a[2] - dot * vh[2]);
  const m = 0.145, r = 0.229 / (2 * Math.PI), A = Math.PI * r * r, rho = 1.194;
  const CL = 2 * m * aM / (rho * A * v * v);
  if (CL < 0.33) { const S = 0.166 * Math.log(0.336 / Math.max(0.336 - CL, 1e-6)); out.activeSpin = S * v / r * 60 / (2 * Math.PI); }
  if (isNum(ext)) {
    const tr = solveT(y0, vy, ay, Y_MOUND - Number(ext));
    if (tr != null) {
      out.relX = pos(x0, vx, ax, tr); out.relZ = pos(z0, vz, az, tr);
      const vxr = vel(vx, ax, tr), vyr = vel(vy, ay, tr), vzr = vel(vz, az, tr);
      out.vra = Math.atan2(vzr, -vyr) * 180 / Math.PI;
      out.hra = Math.atan2(vxr, -vyr) * 180 / Math.PI;
      const tf = tp - tr;
      out.ivb = (out.plateZ - (out.relZ + vzr * tf - 0.5 * G * tf * tf)) * 100;
      out.hb = (out.plateX - (out.relX + vxr * tf)) * 100;
      out.vb = (out.plateZ - (out.relZ + vzr * tf)) * 100;
    }
  }
  return out;
}

/* 保存した行（x0..az0 と エクステンション）から、本塁までの距離 y → [横, 高さ] を返す。
   横は保存時の符号（報告値と同じ向き）に揃える。投球としてありえない軌道は null */
function trajFn(r) {
  const P = ['x0', 'z0', 'vx0', 'vy0', 'vz0', 'ax0', 'ay0', 'az0'];
  if (!P.every(k => isNum(r[k]))) return null;
  if (Math.abs(r.x0) > 2 || r.z0 < 0.3 || r.z0 > 3 || r.vy0 > -15 || r.vy0 < -55 || r.ay0 < 0) return null;
  const y0 = 15.24, x0 = -Number(r.x0), z0 = Number(r.z0), vx = -Number(r.vx0), vy = Number(r.vy0), vz = Number(r.vz0);
  const ax = -Number(r.ax0), ay = Number(r.ay0), az = Number(r.az0);
  const at = yt => { const t = solveT(y0, vy, ay, yt); if (t == null) return null; return [x0 + vx * t + 0.5 * ax * t * t, z0 + vz * t + 0.5 * az * t * t]; };
  // 計測できていない球は描かない（エクステンション・リリース高さ・コース高さがそろった球だけ）
  if (!isNum(r['エクステンション']) || !isNum(r['リリース高さ']) || !isNum(r['コース高さ'])) return null;
  const ext = Number(r['エクステンション']);
  const yRel = Y_MOUND - ext, rel = at(yRel), pl = at(Y_PLATE);
  if (!rel || !pl || pl[1] < 0 || pl[1] > 3 || Math.abs(pl[0]) > 1.5) return null;
  return { at, yRel, rel, plate: pl };
}

/* 横から見た軌道（ピッチトンネル）。rows は同じ投手の球。types は描く球種の順 */
function sideView(rows, types, o) {
  const w = 920, h = 340, L = 34, R = 190, T = 14, B = 26, YL = 18.9, YR = -0.6;
  const X = y => L + (YL - y) / (YL - YR) * (w - L - R);
  const Y = z => T + (2.3 - z) / 2.3 * (h - T - B);
  const grid = []; for (let y = 17.4; y >= Y_PLATE - 1e-9; y -= 0.45) grid.push(y); grid.push(Y_PLATE);
  const by = {};
  rows.forEach(r => { const f = trajFn(r); if (!f) return; (by[String(r['球種'])] = by[String(r['球種'])] || []).push({ r, f }); });
  let s = `<svg class="ch" viewBox="0 0 ${w} ${h}">`;
  for (let y = 18; y >= 0; y -= 3) s += `<line class="ax" x1="${X(y)}" y1="${T}" x2="${X(y)}" y2="${h - B}"/><text x="${X(y)}" y="${h - B + 12}" text-anchor="middle">${y}</text>`;
  for (let z = 0; z <= 2; z += 0.5) s += `<line class="ax" x1="${L}" y1="${Y(z)}" x2="${X(YR)}" y2="${Y(z)}"/><text x="${L - 3}" y="${Y(z) + 3}" text-anchor="end">${z.toFixed(1)}</text>`;
  s += `<text x="${(L + X(YR)) / 2}" y="${h - 2}" text-anchor="middle" class="lab">本塁までの距離 m</text>`;
  // マウンドのプレート、本塁、ゾーン
  s += `<rect x="${X(Y_MOUND) - 2}" y="${Y(0.25)}" width="4" height="${Y(0) - Y(0.25)}" fill="var(--muted)"/>`;
  s += `<rect x="${X(0.43)}" y="${Y(0.04)}" width="${X(0) - X(0.43)}" height="${Y(0) - Y(0.04)}" fill="var(--muted)"/>`;
  s += `<rect x="${X(0.43)}" y="${Y(o.zone.top)}" width="${X(-0.3) - X(0.43)}" height="${Y(o.zone.bot) - Y(o.zone.top)}" fill="var(--accent)" opacity=".13"/>`;
  s += `<line x1="${X(0)}" y1="${Y(o.zone.top)}" x2="${X(0)}" y2="${Y(o.zone.bot)}" stroke="var(--accent)" stroke-width="2"/>`;
  // トンネル点
  s += `<line x1="${X(o.tun)}" y1="${T}" x2="${X(o.tun)}" y2="${h - B}" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
  s += `<text x="${X(o.tun) - 4}" y="${T + 10}" text-anchor="end" style="fill:var(--accent);font-weight:600">トンネル点 ${o.tun} m</text>`;
  // 1球ずつ（細く）
  types.forEach(t => (by[t] || []).forEach(({ f }) => {
    const pts = grid.filter(y => y <= f.yRel).map(y => f.at(y)).filter(Boolean);
    const d = [[f.yRel, f.rel]].concat(grid.filter(y => y <= f.yRel).map(y => [y, f.at(y)]).filter(p => p[1]));
    s += `<polyline fill="none" stroke="${o.color(t)}" stroke-width=".6" opacity=".25" points="${d.map(([y, p]) => X(y).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
  }));
  // 球種ごとの平均軌道
  const M = {};
  types.forEach(t => { const L2 = by[t]; if (!L2 || !L2.length) return;
    const yRel = mean(L2.map(x => x.f.yRel));
    const pts = [[yRel, [mean(L2.map(x => x.f.rel[0])), mean(L2.map(x => x.f.rel[1]))]]]
      .concat(grid.filter(y => y < yRel).map(y => { const ps = L2.map(x => x.f.at(y)).filter(Boolean); return [y, [mean(ps.map(p => p[0])), mean(ps.map(p => p[1]))]]; }));
    const atT = L2.map(x => x.f.at(o.tun)).filter(Boolean), atP = L2.map(x => x.f.plate);
    M[t] = { n: L2.length, pts, tun: [mean(atT.map(p => p[0])), mean(atT.map(p => p[1]))], plate: [mean(atP.map(p => p[0])), mean(atP.map(p => p[1]))],
             vaa: mean(nums(L2.map(x => x.r), '入射角縦')), vra: mean(nums(L2.map(x => x.r), 'リリース角縦')),
             relH: mean(nums(L2.map(x => x.r), 'リリース高さ')), ext: mean(nums(L2.map(x => x.r), 'エクステンション')) };
    s += `<polyline fill="none" stroke="${o.color(t)}" stroke-width="1.8" stroke-linecap="round" points="${pts.map(([y, p]) => X(y).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
    // 平均のリリース点に印
    s += `<circle cx="${X(pts[0][0]).toFixed(1)}" cy="${Y(pts[0][1][1]).toFixed(1)}" r="3.2" fill="${o.color(t)}" stroke="#fff" stroke-width="1"/>`;
  });
  const fb = M['Fastball'] || M[types[0]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) * 100;
  // トンネル点での離れ（縦線）
  if (fb) Object.keys(M).forEach(t => { if (M[t] === fb) return;
    s += `<line x1="${X(o.tun) - 3}" y1="${Y(fb.tun[1])}" x2="${X(o.tun) - 3}" y2="${Y(M[t].tun[1])}" stroke="${o.color(t)}" stroke-width="2.5" opacity=".8"/>`; });
  // 右側のラベル（重ならないように並べる）
  const labs = Object.keys(M).map(t => ({ t, z: M[t].plate[1] })).sort((a, b) => a.z - b.z);
  let prev = -1; const rowH = 24;
  labs.forEach(l => { let yy = Y(l.z); if (prev >= 0 && prev - yy < rowH) yy = prev - rowH; prev = yy; l.y = yy; });
  labs.forEach(({ t, z, y }) => { const m = M[t], c = o.color(t);
    const sep = fb && m !== fb ? `トンネル ${dist(fb.tun, m.tun).toFixed(0)}cm → 本塁 ${dist(fb.plate, m.plate).toFixed(0)}cm` : `${m.n}球・基準`;
    s += `<line x1="${X(0)}" y1="${Y(z)}" x2="${X(YR) + 4}" y2="${y + 6}" stroke="${c}" stroke-width=".8" opacity=".6"/>`
       + `<text x="${X(YR) + 6}" y="${y + 3}" class="lab" style="fill:${c}">${esc(o.jtype(t))} 入射 ${isNum(m.vaa) ? m.vaa.toFixed(1) + '°' : '—'}</text>`
       + `<text x="${X(YR) + 6}" y="${y + 14}" style="fill:${c};font-size:9.5px">${esc(sep)}</text>`; });
  // 左下のラベル：球種ごとのリリース角・高さ・エクステンション（軌道が通らない空いたところに、色で対応づけて並べる）
  const f1 = (v, u) => isNum(v) ? v.toFixed(1) + u : '—';
  const f2 = (v, u) => isNum(v) ? v.toFixed(2) + u : '—';
  const rl = Object.keys(M).map(t => ({ t, m: M[t] })).sort((a, b) => (isNum(b.m.vra) ? b.m.vra : -99) - (isNum(a.m.vra) ? a.m.vra : -99));
  if (rl.length) {
    const lx = X(17.7); let yy = h - B - 8 - 13 * (rl.length - 1);
    s += `<text x="${lx}" y="${yy - 13}" class="lab" style="fill:var(--muted)">リリース（角度は上向きが＋）：角度 ／ 高さ ／ エクステンション</text>`;
    rl.forEach(({ t, m }) => { const c = o.color(t);
      s += `<circle cx="${lx + 4}" cy="${yy - 3.5}" r="3.5" fill="${c}"/>`
         + `<text x="${lx + 12}" y="${yy}" class="lab" style="fill:${c}">${esc(o.jtype(t))} ${f1(m.vra, '°')} ／ ${f2(m.relH, ' m')} ／ ${f2(m.ext, ' m')}</text>`;
      yy += 13; });
  }
  return s + '</svg>';
}

/* ================= リリースをそろえたシミュレーション =================
   球種ごとに「平均の球速・空気抵抗・変化（加速度）」を実測の軌道から取り、
   ストレートの平均リリース点から投げたことにして計算する。
   ① ストレートが真ん中に届く角度で、ほかの球種も投げたら → どこに届くか
   ② 全球種を真ん中に通すなら → リリース角がどれだけ違うか
   角度を変えても球速と変化は変わらない、という前提の近似（参考値） */
function trajState(r) {
  // 変化量（縦・横）を Trackman が計測できていない球は、軌道の式も当てにならないので使わない
  if (!isNum(r['縦変化量']) || !isNum(r['横変化量'])) return null;
  const f = trajFn(r); if (!f) return null;
  const y0 = 15.24, vy = Number(r.vy0), ay = Number(r.ay0);
  const t = solveT(y0, vy, ay, f.yRel); if (t == null) return null;
  const vx = -Number(r.vx0) + -Number(r.ax0) * t, vyr = vy + ay * t, vz = Number(r.vz0) + Number(r.az0) * t;
  return { rel: [f.rel[0], f.yRel, f.rel[1]], V: Math.hypot(vx, vyr, vz), acc: [-Number(r.ax0), ay, Number(r.az0)],
           vra: Math.atan2(vz, -vyr) * 180 / Math.PI, hra: Math.atan2(vx, -vyr) * 180 / Math.PI, plate: f.plate };
}
const D2R = Math.PI / 180;
function simFly(P, V, A, th, ph) {   // th, ph は度。上向き・x+向きが＋
  const vy = -V * Math.cos(th * D2R) * Math.cos(ph * D2R), vz = V * Math.sin(th * D2R), vx = V * Math.cos(th * D2R) * Math.sin(ph * D2R);
  const at = yt => { const t = solveT(P[1], vy, A[1], yt); if (t == null) return null;
    return [P[0] + vx * t + 0.5 * A[0] * t * t, P[2] + vz * t + 0.5 * A[2] * t * t, t]; };
  return { at, plate: at(Y_PLATE) };
}
function simAim(P, V, A, tx, tz) {
  let th = 0, ph = 0; const D = P[1] - Y_PLATE;
  for (let i = 0; i < 40; i++) { const p = simFly(P, V, A, th, ph).plate; if (!p) return null;
    const ez = tz - p[1], ex = tx - p[0]; th += Math.atan(ez / D) / D2R; ph += Math.atan(ex / D) / D2R;
    if (Math.abs(ez) < 1e-5 && Math.abs(ex) < 1e-5) break; }
  return [th, ph];
}
function simModel(rows, types) {
  const M = {}; let sx = 0;
  types.forEach(t => {
    const st = rows.filter(r => String(r['球種']) === t).map(r => ({ r, s: trajState(r) })).filter(x => x.s);
    if (!st.length) return;
    st.forEach(({ r, s }) => { if (isNum(r['コース横'])) sx += s.plate[0] * Number(r['コース横']); });
    const S = st.map(x => x.s);
    M[t] = { n: S.length, V: mean(S.map(s => s.V)), acc: [0, 1, 2].map(i => mean(S.map(s => s.acc[i]))),
             rel: [0, 1, 2].map(i => mean(S.map(s => s.rel[i]))), vra: mean(S.map(s => s.vra)), hra: mean(S.map(s => s.hra)),
             kmh: mean(nums(st.map(x => x.r), '球速')) };
  });
  return { M, hs: sx < 0 ? -1 : 1 };   // hs：軌道の横向き → 画面に出す横向き
}
function simCalc(rows, types, o) {
  const { M, hs } = simModel(rows, types);
  const base = M['Fastball'] ? 'Fastball' : types.find(t => M[t]);
  if (!base) return null;
  const P = M[base].rel, tz = (o.zone.top + o.zone.bot) / 2;
  const a0 = simAim(P, M[base].V, M[base].acc, 0, tz); if (!a0) return null;
  const fbAim = simFly(P, M[base].V, M[base].acc, a0[0], a0[1]);
  const out = types.filter(t => M[t]).map(t => {
    const m = M[t];
    const same = simFly(P, m.V, m.acc, a0[0], a0[1]);
    const aim = simAim(P, m.V, m.acc, 0, tz);
    const aimF = aim ? simFly(P, m.V, m.acc, aim[0], aim[1]) : null;
    const tunA = aimF && aimF.at(o.tun), tunB = fbAim.at(o.tun);
    return { t, m, same, aim, aimF,
      dz: same.plate ? (same.plate[1] - tz) * 100 : null, dx: same.plate ? same.plate[0] * hs * 100 : null,
      th: aim ? aim[0] : null, ph: aim ? aim[1] * hs : null,
      dth: aim ? aim[0] - a0[0] : null, dph: aim ? (aim[1] - a0[1]) * hs : null,
      tun: tunA && tunB ? Math.hypot(tunA[0] - tunB[0], tunA[1] - tunB[1]) * 100 : null };
  });
  return { base, P, tz, a0: [a0[0], a0[1] * hs], fbAim, rows: out, hs };
}
/* 横から見た図（シミュレーション用）。paths: [{c, at, label, sub}] */
function simSide(S, which, o) {
  const w = 920, h = 300, L = 34, R = 196, T = 14, B = 26, YL = 18.9, YR = -0.6;
  const X = y => L + (YL - y) / (YL - YR) * (w - L - R);
  const Y = z => T + (2.3 - Math.max(-0.05, z)) / 2.3 * (h - T - B);
  let s = `<svg class="ch" viewBox="0 0 ${w} ${h}">`;
  for (let y = 18; y >= 0; y -= 3) s += `<line class="ax" x1="${X(y)}" y1="${T}" x2="${X(y)}" y2="${h - B}"/><text x="${X(y)}" y="${h - B + 12}" text-anchor="middle">${y}</text>`;
  for (let z = 0; z <= 2; z += 0.5) s += `<line class="ax" x1="${L}" y1="${Y(z)}" x2="${X(YR)}" y2="${Y(z)}"/><text x="${L - 3}" y="${Y(z) + 3}" text-anchor="end">${z.toFixed(1)}</text>`;
  s += `<text x="${(L + X(YR)) / 2}" y="${h - 2}" text-anchor="middle" class="lab">本塁までの距離 m</text>`;
  s += `<rect x="${X(Y_MOUND) - 2}" y="${Y(0.25)}" width="4" height="${Y(0) - Y(0.25)}" fill="var(--muted)"/>`;
  s += `<rect x="${X(0.43)}" y="${Y(0.04)}" width="${X(0) - X(0.43)}" height="${Y(0) - Y(0.04)}" fill="var(--muted)"/>`;
  s += `<rect x="${X(0.43)}" y="${Y(o.zone.top)}" width="${X(-0.3) - X(0.43)}" height="${Y(o.zone.bot) - Y(o.zone.top)}" fill="var(--accent)" opacity=".13"/>`;
  s += `<line x1="${X(o.tun)}" y1="${T}" x2="${X(o.tun)}" y2="${h - B}" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
  s += `<text x="${X(o.tun) - 4}" y="${T + 10}" text-anchor="end" style="fill:var(--accent);font-weight:600">トンネル点 ${o.tun} m</text>`;
  // 狙い（真ん中の高さ）
  s += `<line x1="${X(0.9)}" y1="${Y(S.tz)}" x2="${X(YR)}" y2="${Y(S.tz)}" stroke="var(--ink2)" stroke-width="1" stroke-dasharray="3 3"/>`;
  const ys = []; for (let y = S.P[1]; y > Y_PLATE; y -= 0.25) ys.push(y); ys.push(Y_PLATE);
  const labs = [];
  // ストレートを最後に描く（上に重ねる）
  const order = S.rows.slice().sort((a, b) => (a.t === S.base) - (b.t === S.base));
  order.forEach(r => {
    const f = which === 'same' ? r.same : r.aimF; if (!f || !f.plate) return;
    const pts = ys.map(y => [y, f.at(y)]).filter(p => p[1]);
    const c = o.color(r.t), isB = r.t === S.base;
    s += `<polyline fill="none" stroke="${c}" stroke-width="${isB ? 3.2 : 2.6}" stroke-linecap="round" ${isB ? '' : 'opacity=".95"'} points="${pts.map(([y, p]) => X(y).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
    s += `<circle cx="${X(Y_PLATE).toFixed(1)}" cy="${Y(f.plate[1]).toFixed(1)}" r="3.5" fill="${c}" stroke="#fff" stroke-width="1"/>`;
    labs.push({ r, z: f.plate[1], c });
  });
  s += `<circle cx="${X(S.P[1]).toFixed(1)}" cy="${Y(S.P[2]).toFixed(1)}" r="5" fill="var(--ink)" stroke="#fff" stroke-width="1.5"/>`;
  s += `<text x="${X(S.P[1]) + 2}" y="${Y(S.P[2]) + (which === 'aim' ? 40 : -8)}" class="lab">そろえたリリース点（ストレートの平均）</text>`;
  // 右のラベル
  const pm = v => (v >= 0 ? '+' : '−') + Math.abs(v);
  if (which === 'same') {
    labs.sort((a, b) => b.z - a.z); let prev = -1e9; const rowH = 24;
    labs.forEach(l => { let yy = Y(l.z); if (yy - prev < rowH) yy = prev + rowH; prev = yy; l.y = yy; });
    labs.forEach(({ r, z, y, c }) => {
      const main = r.t === S.base ? '基準（真ん中）' : `${pm(Math.round(r.dz))} cm${z < 0 ? '（ワンバウンド）' : ''}`;
      s += `<line x1="${X(Y_PLATE)}" y1="${Y(z)}" x2="${X(YR) + 4}" y2="${y - 3}" stroke="${c}" stroke-width=".8" opacity=".6"/>`
         + `<text x="${X(YR) + 6}" y="${y}" class="lab" style="fill:${c}">${esc(o.jtype(r.t))} ${esc(main)}</text>`;
    });
  } else {
    const rl = labs.slice().sort((a, b) => (b.r.th || 0) - (a.r.th || 0));
    let yy = T + 26;
    s += `<text x="${X(YR) + 6}" y="${T + 10}" class="lab" style="fill:var(--muted)">真ん中に通すリリース角（縦）</text>`;
    rl.forEach(({ r, c }) => {
      const d = r.t === S.base ? '基準' : `${pm(r.dth.toFixed(1))}°`;
      s += `<circle cx="${X(YR) + 10}" cy="${yy - 4}" r="3.5" fill="${c}"/><text x="${X(YR) + 18}" y="${yy}" class="lab" style="fill:${c}">${esc(o.jtype(r.t))} ${r.th.toFixed(1)}°（${d}）</text>`;
      yy += 18;
    });
  }
  return s + '</svg>';
}
/* 捕手から見た到達点（①） */
function simZone(S, o) {
  const pts = S.rows.filter(r => r.same.plate).map(r => ({ x: r.same.plate[0] * S.hs, y: r.same.plate[1], c: o.color(r.t), r: 6, o: 1, stroke: 'var(--paper)',
    label: o.jtype(r.t), t: `${o.jtype(r.t)} 高さ ${r.dz.toFixed(0)}cm 横 ${r.dx.toFixed(0)}cm` }));
  return scatter({ w: 300, h: 300, xr: [-0.9, 0.9], yr: [-0.3, 1.5], xticks: 6, yticks: 6, xl: '横 m（捕手から見て）', yl: '高さ m', zero: false, xlabels: o.xlabels,
    extra: (X, Y) => `<rect class="zone" x="${X(-o.zone.side)}" y="${Y(o.zone.top)}" width="${X(o.zone.side) - X(-o.zone.side)}" height="${Y(o.zone.bot) - Y(o.zone.top)}"/>`
      + `<line class="ax0" x1="${X(-0.9)}" y1="${Y(0)}" x2="${X(0.9)}" y2="${Y(0)}"/><text x="${X(-0.88)}" y="${Y(0) - 3}">地面</text>`
      + `<line x1="${X(-0.06)}" y1="${Y(S.tz)}" x2="${X(0.06)}" y2="${Y(S.tz)}" stroke="var(--ink)" stroke-width="1.5"/><line x1="${X(0)}" y1="${Y(S.tz - 0.06)}" x2="${X(0)}" y2="${Y(S.tz + 0.06)}" stroke="var(--ink)" stroke-width="1.5"/>`,
    pts });
}

/* CSVの1行 → 保存する1行。flip=true で横方向をすべて反転 */
const KIND_OF = pt => /LiveBp|Game/i.test(pt || '') ? '対戦' : 'ブルペン';
function toRow(rec, ctx) {
  const sx = ctx.flip ? -1 : 1;
  const h = v => (isNum(v) ? Number(v) * sx : '');
  /* Trackman が計測した値だけを使う。空欄は空欄のまま（計算で埋めない） */
  const pick = (measured, _calc, _name, round) => isNum(measured) ? round(measured) : '';
  const tj = null;
  const row = {
    '計測ID': uid('tm-'), '投手ID': ctx.pid, 'セッションID': ctx.sid,
    '測定日': ctx.date, '時刻': String(rec.Time || ''), '球番号': f(rec.PitchNo),
    '種別': ctx.kind, '区分': String(rec.PitchSession || ''), '球種': String(rec.TaggedPitchType || ''),
    '球速': r1(f(rec.RelSpeed)), '回転数': isNum(rec.SpinRate) ? Math.round(rec.SpinRate) : '', '回転数疑い': '',
    '回転効率': r1(f(rec.SpinAxis3dSpinEfficiency)),
    '有効回転数': isNum(rec.SpinAxis3dActiveSpinRate) ? Math.round(rec.SpinAxis3dActiveSpinRate) : '',
    '回転軸': r1(f(rec.SpinAxis)), '傾き': String(rec.Tilt || ''),
    'リリース高さ': pick(f(rec.RelHeight), tj && tj.relZ, 'リリース高さ', r3),
    'リリース横幅': pick(h(rec.RelSide), tj && isNum(tj.relX) ? tj.relX * sx : '', 'リリース横幅', r3),
    'エクステンション': isNum(rec.Extension) ? r3(rec.Extension) : '',
    '縦変化量': pick(f(rec.InducedVertBreak), tj && tj.ivb, '縦変化量', r1),
    '横変化量': pick(h(rec.HorzBreak), tj && isNum(tj.hb) ? tj.hb * sx : '', '横変化量', r1),
    '総縦変化': pick(f(rec.VertBreak), tj && tj.vb, '総縦変化', r1),
    'リリース角縦': pick(f(rec.VertRelAngle), tj && tj.vra, 'リリース角縦', r2),
    'リリース角横': pick(h(rec.HorzRelAngle), tj && isNum(tj.hra) ? tj.hra * sx : '', 'リリース角横', r2),
    '入射角縦': pick(f(rec.VertApprAngle), tj && tj.vaa, '入射角縦', r2),
    '入射角横': pick(h(rec.HorzApprAngle), tj && isNum(tj.haa) ? tj.haa * sx : '', '入射角横', r2),
    '補完': '',
    'コース高さ': pick(f(rec.PlateLocHeight), tj && tj.plateZ, 'コース高さ', r3),
    'コース横': pick(h(rec.PlateLocSide), tj && isNum(tj.plateX) ? tj.plateX * sx : '', 'コース横', r3),
    'ベース速度': r1(f(rec.ZoneSpeed)), '到達時間': r3(f(rec.ZoneTime)), '体感球速': r1(f(rec.EffVelocity)),
    '打者左右': String(rec.BatterSide || ''), '打球速度': r1(f(rec.ExitSpeed)), '打球角度': r1(f(rec.Angle)),
    '打球種': String(rec.HitType || ''), '飛距離': r1(f(rec.Distance)),
    'PlayID': String(rec.PlayID || ''), 'CalibrationId': String(rec.CalibrationId || ''),
    'x0': r3(f(rec.x0)), 'z0': r3(f(rec.z0)), 'vx0': r3(f(rec.vx0)), 'vy0': r3(f(rec.vy0)), 'vz0': r3(f(rec.vz0)),
    'ax0': r3(f(rec.ax0)), 'ay0': r3(f(rec.ay0)), 'az0': r3(f(rec.az0))
  };
  return row;
}

/* 同じ球種の中で、回転数が上位側の値の半分あたりに落ちている球に印を付ける
   （ドップラー計測で半分の値で記録される取りこぼし）。中央値だと半分の球が多いとき
   に釣られるので、上から4分の1の値を基準にする。 */
function flagSpin(rows) {
  const by = {};
  rows.forEach(r => { if (isNum(r['回転数'])) (by[r['球種']] = by[r['球種']] || []).push(Number(r['回転数'])); });
  const ref = {};
  Object.keys(by).forEach(t => { const a = by[t].slice().sort((x, y) => x - y); if (a.length >= 3) ref[t] = a[Math.floor((a.length - 1) * 0.75)]; });
  let n = 0;
  rows.forEach(r => {
    r['回転数疑い'] = '';
    if (!isNum(r['回転数']) || ref[r['球種']] == null) return;
    const v = Number(r['回転数']), hi = ref[r['球種']];
    if (v >= hi * 0.38 && v <= hi * 0.62) { r['回転数疑い'] = 1; n++; }
  });
  return n;
}

/* ================= グラフ（SVG手描き） =================
   どれも「見る人が一目で分かる」ことを優先して、装飾は最小限。 */
function scatter(opts) {
  // opts: {w,h, xr:[lo,hi], yr:[lo,hi], xl, yl, pts:[{x,y,c,cls?}], zero:true, extra:svg, xticks, yticks, xlabels:{lo,hi}}
  const w = opts.w || 360, h = opts.h || 300, L = 38, R = 10, T = 12, B = 30;
  const [xa, xb] = opts.xr, [ya, yb] = opts.yr;
  const tf = (v, a, b) => (b - a) >= 20 ? String(Math.round(v)) : (b - a) >= 4 ? v.toFixed(1) : v.toFixed(2);
  const X = v => L + (v - xa) / (xb - xa) * (w - L - R);
  const Y = v => T + (yb - v) / (yb - ya) * (h - T - B);
  let s = `<svg class="ch" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">`;
  const xt = opts.xticks || 5, yt = opts.yticks || 5;
  for (let i = 0; i <= xt; i++) { const v = xa + (xb - xa) * i / xt; s += `<line class="ax" x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${h - B}"/><text x="${X(v)}" y="${h - B + 13}" text-anchor="middle">${tf(v, xa, xb)}</text>`; }
  for (let i = 0; i <= yt; i++) { const v = ya + (yb - ya) * i / yt; s += `<line class="ax" x1="${L}" y1="${Y(v)}" x2="${w - R}" y2="${Y(v)}"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end">${tf(v, ya, yb)}</text>`; }
  if (opts.zero !== false) {
    if (xa < 0 && xb > 0) s += `<line class="ax0" x1="${X(0)}" y1="${T}" x2="${X(0)}" y2="${h - B}"/>`;
    if (ya < 0 && yb > 0) s += `<line class="ax0" x1="${L}" y1="${Y(0)}" x2="${w - R}" y2="${Y(0)}"/>`;
  }
  if (opts.extra) s += opts.extra(X, Y);
  opts.pts.forEach(p => {
    if (!isNum(p.x) || !isNum(p.y)) return;
    const x = X(Math.max(xa, Math.min(xb, p.x))), y = Y(Math.max(ya, Math.min(yb, p.y)));
    const r = p.r || 3.2;
    if (p.hollow) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="var(--paper)" stroke="${p.c}" stroke-width="1.4" opacity="${p.o != null ? p.o : .9}"><title>${esc(p.t || '')}</title></circle>`;
    else s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${p.c}" opacity="${p.o != null ? p.o : .85}" ${p.stroke ? `stroke="${p.stroke}" stroke-width="1.5"` : ''}><title>${esc(p.t || '')}</title></circle>`;
    if (p.label) s += x > w * 0.78
      ? `<text class="lab" x="${(x - r - 2).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end">${esc(p.label)}</text>`
      : `<text class="lab" x="${(x + r + 2).toFixed(1)}" y="${(y + 3).toFixed(1)}">${esc(p.label)}</text>`;
  });
  (opts.means || []).forEach(m => {
    if (!isNum(m.x) || !isNum(m.y)) return;
    const x = X(Math.max(xa, Math.min(xb, m.x))), y = Y(Math.max(ya, Math.min(yb, m.y)));
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${m.c}" stroke="var(--paper)" stroke-width="2.5"><title>${esc(m.t || '')}</title></circle>`
       + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="none" stroke="${m.c}" stroke-width="1.2"/>`;
    if (m.label) s += `<text class="lab" x="${(x + 11).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" style="font-size:10.5px;paint-order:stroke;stroke:var(--paper);stroke-width:3px">${esc(m.label)}</text>`;
  });
  if (opts.xl) s += `<text x="${(L + w - R) / 2}" y="${h - 3}" text-anchor="middle" class="lab">${esc(opts.xl)}</text>`;
  if (opts.yl) s += `<text transform="translate(9,${(T + h - B) / 2}) rotate(-90)" text-anchor="middle" class="lab">${esc(opts.yl)}</text>`;
  if (opts.xlabels) s += `<text x="${L + 2}" y="${T + 10}">${esc(opts.xlabels[0])}</text><text x="${w - R - 2}" y="${T + 10}" text-anchor="end">${esc(opts.xlabels[1])}</text>`;
  return s + '</svg>';
}

/* 球種ごとの分布：最小〜最大の線、平均±1σの太線、平均の点 */
function rangeChart(groups, opts) {
  // groups: [{name,c,vals:[]}]  opts:{unit,dec,w}
  const w = opts.w || 360, rowH = 26, L = 92, R = 44, T = 8;
  const all = groups.flatMap(g => g.vals); if (!all.length) return '<div class="empty">データがありません</div>';
  let lo = Math.min(...all), hi = Math.max(...all); if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
  const h = T + groups.length * rowH + 22;
  const X = v => L + (v - lo) / (hi - lo) * (w - L - R);
  let s = `<svg class="ch" viewBox="0 0 ${w} ${h}">`;
  for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4; s += `<line class="ax" x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${h - 20}"/><text x="${X(v)}" y="${h - 7}" text-anchor="middle">${v.toFixed(opts.dec || 0)}</text>`; }
  groups.forEach((g, i) => {
    const y = T + i * rowH + rowH / 2;
    s += `<text x="${L - 6}" y="${y + 4}" text-anchor="end" class="lab">${esc(g.name)}</text><text x="${L - 6}" y="${y + 14}" text-anchor="end" style="font-size:9px">${g.vals.length}球</text>`;
    if (!g.vals.length) return;
    const m = mean(g.vals), d = sd(g.vals), mn = Math.min(...g.vals), mx = Math.max(...g.vals);
    s += `<line x1="${X(mn)}" y1="${y}" x2="${X(mx)}" y2="${y}" stroke="${g.c}" stroke-width="1.5" opacity=".5"/>`;
    if (d != null) s += `<line x1="${X(Math.max(mn, m - d))}" y1="${y}" x2="${X(Math.min(mx, m + d))}" y2="${y}" stroke="${g.c}" stroke-width="7" opacity=".55"/>`;
    s += `<circle cx="${X(m)}" cy="${y}" r="4.5" fill="${g.c}" stroke="var(--paper)" stroke-width="1.5"/>`;
    s += `<text x="${X(mx) + 5}" y="${y + 4}" style="font-family:var(--num);font-size:11px;fill:var(--ink)">${m.toFixed(opts.dec || 0)}</text>`;
  });
  return s + '</svg>';
}

/* 日付ごとの推移：球種ごとに線 */
function trendChart(series, opts) {
  // series: [{name,c,pts:[{d,v,n}]}] sorted by d
  const w = opts.w || 360, h = opts.h || 190, L = 40, R = 10, T = 10, B = 28;
  const dates = [...new Set(series.flatMap(s => s.pts.map(p => p.d)))].sort();
  const vals = series.flatMap(s => s.pts.map(p => p.v));
  if (!dates.length || !vals.length) return '<div class="empty">データがありません</div>';
  let lo = Math.min(...vals), hi = Math.max(...vals); if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * .12; lo -= pad; hi += pad;
  const X = d => dates.length === 1 ? (L + w - R) / 2 : L + dates.indexOf(d) / (dates.length - 1) * (w - L - R);
  const Y = v => T + (hi - v) / (hi - lo) * (h - T - B);
  let s = `<svg class="ch" viewBox="0 0 ${w} ${h}">`;
  for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4; s += `<line class="ax" x1="${L}" y1="${Y(v)}" x2="${w - R}" y2="${Y(v)}"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end">${v.toFixed(opts.dec || 0)}</text>`; }
  const step = Math.max(1, Math.ceil(dates.length / 6));
  dates.forEach((d, i) => { if (i % step === 0 || i === dates.length - 1) s += `<text x="${X(d)}" y="${h - B + 13}" text-anchor="middle">${d.slice(5)}</text>`; });
  series.forEach(sr => {
    const pts = sr.pts.filter(p => isNum(p.v));
    if (pts.length > 1) s += `<polyline fill="none" stroke="${sr.c}" stroke-width="2" opacity=".8" points="${pts.map(p => X(p.d).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}"/>`;
    pts.forEach(p => s += `<circle cx="${X(p.d)}" cy="${Y(p.v)}" r="3.5" fill="${sr.c}"><title>${esc(sr.name)} ${p.d} ${p.v.toFixed(opts.dec || 1)}（${p.n}球）</title></circle>`);
  });
  if (opts.yl) s += `<text transform="translate(9,${(T + h - B) / 2}) rotate(-90)" text-anchor="middle" class="lab">${esc(opts.yl)}</text>`;
  return s + '</svg>';
}

/* コース図：捕手側から見た向き。ゾーンは設定の固定値 */
function zoneChart(pts, zone, opts) {
  const w = opts.w || 300, h = opts.h || 300;
  return scatter({ w, h, xr: [-0.7, 0.7], yr: [0, 1.6], xticks: 7, yticks: 4,
    xl: opts.xl || 'コース横 m（捕手から見て）', yl: '高さ m', zero: false,
    xlabels: opts.xlabels,
    extra: (X, Y) => `<rect class="zone" x="${X(-zone.side)}" y="${Y(zone.top)}" width="${X(zone.side) - X(-zone.side)}" height="${Y(zone.bot) - Y(zone.top)}"/>`
      + `<line class="ax0" x1="${X(-0.216)}" y1="${Y(0.02)}" x2="${X(0.216)}" y2="${Y(0.02)}"/>`,
    pts });
}

/* ================= 本体 ================= */
export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-trackman'; st.textContent = CSS; document.head.appendChild(st);
  const $ = (s, r) => (r || ROOT).querySelector(s);

  const CFG = CORE.cfg;
  const CONN_KEY = 'hsp-conn-' + CFG.TEAM_ID + CFG.STORE;
  const DBKEY = 'hsp-v3-' + CFG.TEAM_ID + CFG.STORE;
  const conn = (() => { try { return JSON.parse(localStorage.getItem(CONN_KEY) || 'null'); } catch (e) { return null; } })() || {};
  const role = String(conn.user && conn.user.role || '');
  /* 選手がログインしているとき：自分の分だけをサーバーから受け取り、自分のページだけを出す。
     この端末にスタッフの名簿やデータが残っていても使わない（控えも別の場所に置く） */
  const SELF = role.indexOf('選手') === 0;
  const TMKEY = (SELF ? 'hsp-tm-me-' : 'hsp-tm-') + CFG.TEAM_ID + CFG.STORE;
  const isAdmin = () => role.indexOf('管理') === 0;
  const appUrl = () => { let u = ''; if (CFG.APP_URL_B64) { try { u = atob(String(CFG.APP_URL_B64).trim()); } catch (e) {} }
    return conn.url || (/^https?:\/\/.+/.test(u) ? u : ''); };
  async function api(action, payload) {
    const url = appUrl(); if (!url) throw new Error('接続先が設定されていません');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, token: conn.token }, payload || {})) });
    const j = await res.json();
    if (!j.ok && j.error === 'unauthorized') throw new Error(SELF ? 'ログインが切れています。マイページからログインし直してください' : 'ログインが切れています。「ログイン」タブでログインし直してください');
    return j;
  }

  /* ---- 状態 ---- */
  let view = 'player';   // データが無いときは取り込み画面から
  let MASTER = null, PITCHERS = [], SESSIONS = [], ROWS = [], SETTINGS = {};
  let loaded = false, busy = false, msg = '', masterFresh = false, fetchedFrom = fiscalStart();
  const F = { pview: 'day', day: null, dayAll: false, from: fiscalStart(), to: '', kind: '', warm: false, type: '', hand: '', player: '', hideTypes: {}, kType: '', kRange: '6', showRetired: false, retPanel: false,
              teamType: 'Fastball', tx: '横変化量', ty: '縦変化量', cmp: {}, cmpMin: '', cmpMax: '', sortKey: '球速', sortDir: -1, showPanel: false };
  const QUEUE = [];    // 取り込み待ちのファイル
  let IMPMSG = '';

  const pname = pid => { const p = (MASTER && MASTER.players || []).find(x => String(x['選手ID']) === String(pid)); return p ? String(p['氏名']) : String(pid); };
  const phand = pid => { const p = (MASTER && MASTER.players || []).find(x => String(x['選手ID']) === String(pid)); return p ? (String(p['投'] || '右')) : '右'; };
  const jtype = t => { const v = SETTINGS['球種:' + (t || '')]; return v ? String(v) : (t || '未分類'); };
  const zone = () => ({ top: Number(SETTINGS['ゾーン上限']) || 0.98, bot: Number(SETTINGS['ゾーン下限']) || 0.47, side: Number(SETTINGS['ゾーン横']) || 0.25 });
  const inZone = r => isNum(r['コース高さ']) && isNum(r['コース横']) && r['コース高さ'] >= zone().bot && r['コース高さ'] <= zone().top && Math.abs(r['コース横']) <= zone().side;
  const tunnelDist = () => Number(SETTINGS['トンネル距離']) || 7.25;
  const rhSign = () => (String(SETTINGS['右投げの符号'] || '+') === '-' ? -1 : 1);
  const sideLabels = () => String(SETTINGS['コース+側'] || '三塁側') === '一塁側' ? ['三塁側', '一塁側'] : ['一塁側', '三塁側'];
  const isEst = () => false;   // 計算で埋めた値はもう無い
  const eff = r => isNum(r['回転効率']) ? { v: Number(r['回転効率']), est: false } : null;   // 回転効率：Trackmanの実測だけを使う（推定はしない）

  /* ---- 端末に残っているもので先に出す ---- */
  function masterFromLocal() {
    let db = null; try { db = JSON.parse(localStorage.getItem(DBKEY) || 'null'); } catch (e) {}
    if (!db || !db.teams) return null;
    const teams = [], players = [];
    Object.keys(db.teams).forEach(k => { const t = db.teams[k]; if (!t) return;
      teams.push({ 'チームID': t.tid, 'チーム名': t.name, '自チーム': t.mine ? 1 : '' });
      (t.players || []).forEach((p, i) => players.push({ '選手ID': p.pid, '氏名': p.name, 'チームID': t.tid, '投': p.throws || '', '投手': p.isP ? 1 : '',
        '状態': p.state || '', '備考': p.mergedTo ? '統合先:' + p.mergedTo : '', '順': (p.ord != null ? p.ord : i) })); });
    return teams.length ? { teams, players } : null;
  }
  /* 引退・卒業の投手は、選手の一覧とチーム平均から外す（「引退も表示」で一覧には出せる）。
     名簿の書き換え直後は記録タブの名簿がまだ古いことがあるので、この端末で変えた分を上書きで覚えておく */
  const RET_ST = { '引退': 1, '卒業': 1 };
  const RETKEY = 'hsp-tmret-' + CFG.TEAM_ID + CFG.STORE;
  let RETOV = (() => { try { return JSON.parse(localStorage.getItem(RETKEY) || '{}'); } catch (e) { return {}; } })();
  const saveRetOv = () => { try { localStorage.setItem(RETKEY, JSON.stringify(RETOV)); } catch (e) {} };
  const stateOf = p => { const id = String(p['選手ID']); return (id in RETOV) ? RETOV[id] : String(p['状態'] || ''); };
  let ALLP = [], ACTIVE = {};
  function applyMaster(m) {
    MASTER = m;
    // 自チームが2つ以上あるとき（端末のお試しデータが残っている等）は、設定のチーム名と同じものを優先する
    const cands = (m.teams || []).filter(t => String(t['自チーム']) === '1');
    const mineTeam = cands.length <= 1 ? cands[0] : (cands.find(t => String(t['チーム名']) === CFG.TEAM_NAME) || cands.find(t => String(t['チームID']) === 't-' + CFG.TEAM_ID) || cands[0]);
    const tid = mineTeam ? String(mineTeam['チームID']) : '';
    ALLP = (m.players || []).filter(x => String(x['チームID']) === tid && String(x['投手']) === '1'
      && String(x['状態'] || '') !== '退部' && !String(x['備考'] || '').startsWith('統合先:'))
      .sort((a, b) => Number(a['順'] || 0) - Number(b['順'] || 0));
    // 記録タブの名簿（端末）が追いついたら、上書きは消す（サーバーの名簿を入れたときは消さない：記録タブがまだ古いことがあるため）
    if (!m.dead) { let ch = false; (m.players || []).forEach(x => { const id = String(x['選手ID']); if ((id in RETOV) && String(x['状態'] || '') === RETOV[id]) { delete RETOV[id]; ch = true; } }); if (ch) saveRetOv(); }
    ACTIVE = {}; ALLP.forEach(x => { if (!RET_ST[stateOf(x)]) ACTIVE[String(x['選手ID'])] = 1; });
    PITCHERS = F.showRetired ? ALLP : ALLP.filter(x => ACTIVE[String(x['選手ID'])]);
    if (PITCHERS.length && !PITCHERS.some(p => String(p['選手ID']) === F.player)) F.player = String(PITCHERS[0]['選手ID']);
  }
  /* 以前の版で、空欄を軌道から計算して埋めた値（「補完」の列に名前が入っている）は使わない。データなしにする */
  function dropFilled(rows) {
    (rows || []).forEach(r => { const ks = String(r['補完'] || '').split(',').filter(Boolean); ks.forEach(k => { r[k] = ''; }); if (ks.length) r['補完'] = ''; });
    return rows || [];
  }
  function applyTm(p) { SESSIONS = p.sessions || []; ROWS = dropFilled(p.rows); SETTINGS = p.settings || {}; }
  /* 選手本人だけの名簿を作る */
  function applySelf(me) {
    if (!me || !me.pid) return;
    applyMaster({ teams: [{ 'チームID': 'me', 'チーム名': CFG.TEAM_NAME, '自チーム': 1 }],
                  players: [{ '選手ID': me.pid, '氏名': me.name, 'チームID': 'me', '投手': 1, '投': me.hand || '右', '順': 0 }] });
    F.player = String(me.pid);
  }
  function warmStart() {
    let c = null; try { c = JSON.parse(localStorage.getItem(TMKEY) || 'null'); } catch (e) {}
    if (SELF) { if (c && c.rows && c.me) { applySelf(c.me); applyTm(c); fetchedFrom = c.from || fetchedFrom; loaded = true; } return; }
    const lm = masterFromLocal(); if (lm) applyMaster(lm);
    if (c && c.rows) { applyTm(c); fetchedFrom = c.from || fetchedFrom; if (MASTER) loaded = true; }
  }
  async function load(from) {
    if (from) fetchedFrom = from;
    busy = true; if (!loaded) render();
    const sig = () => JSON.stringify([ROWS.length, SESSIONS.length, PITCHERS.map(p => [p['選手ID'], p['氏名'], p['投']]), SETTINGS]);
    const before = loaded ? sig() : '';
    try {
      let me = null;
      if (SELF) {
        const p = await api('getMyTrackman', { from: fetchedFrom });
        if (!p.ok) throw new Error(p.error || 'Trackmanのデータを取れませんでした');
        me = p.me; applySelf(me); applyTm(p);
      } else {
        const [m, p] = await Promise.all([masterFresh ? null : api('getMaster'), api('getTrackman', { from: fetchedFrom })]);
        if (m) { if (!m.ok) throw new Error(m.error || 'マスタを取れませんでした'); applyMaster(m.master); masterFresh = true; }
        if (!p.ok) throw new Error(p.error || 'Trackmanのデータを取れませんでした');
        applyTm(p);
      }
      try { const s = JSON.stringify({ sessions: SESSIONS, rows: ROWS, settings: SETTINGS, from: fetchedFrom, me }); if (s.length < 2500000) localStorage.setItem(TMKEY, s); else localStorage.removeItem(TMKEY); } catch (e) {}
      loaded = true; msg = ''; busy = false;
      if (before !== sig()) render();
      return;
    } catch (e) { msg = String(e.message || e); }
    busy = false; render();
  }

  /* ---- 絞り込み ---- */
  function filt(rows, o) {
    o = o || {};
    const from = o.from != null ? o.from : F.from, to = o.to != null ? o.to : F.to, kind = o.kind != null ? o.kind : F.kind;
    const warm = o.warm != null ? o.warm : F.warm;
    return rows.filter(r => (!from || r['測定日'] >= from) && (!to || r['測定日'] <= to) && (!kind || r['種別'] === kind)
      && (warm || String(r['区分']) !== 'Warmup') && (!o.pid || String(r['投手ID']) === String(o.pid))
      && (!o.type || String(r['球種']) === o.type) && (!o.hand || phand(r['投手ID']) === o.hand));
  }
  const typesIn = rows => TYPE_ORDER.filter(t => rows.some(r => String(r['球種']) === t)).concat([...new Set(rows.map(r => String(r['球種'])))].filter(t => TYPE_ORDER.indexOf(t) < 0));
  const spinOK = rows => rows.filter(r => isNum(r['回転数']) && !r['回転数疑い']);
  function stats(rows) {   // 1つの球種のまとまりの数字
    const v = nums(rows, '球速'), sp = nums(spinOK(rows), '回転数');
    const loc = rows.filter(r => isNum(r['コース高さ']) && isNum(r['コース横']));
    const effs = rows.map(eff).filter(Boolean);
    return { n: rows.length, velo: mean(v), vmax: v.length ? Math.max(...v) : null, vsd: sd(v), spin: mean(sp), nspin: sp.length,
      eff: effs.length ? mean(effs.map(e => e.v)) : null, effEst: effs.length && effs.every(e => e.est), neff: effs.length,
      ivb: mean(nums(rows, '縦変化量')), hb: mean(nums(rows, '横変化量')), nbrk: nums(rows, '縦変化量').length,
      relH: mean(nums(rows, 'リリース高さ')), relS: mean(nums(rows, 'リリース横幅')), ext: mean(nums(rows, 'エクステンション')),
      vaa: mean(nums(rows, '入射角縦')), haa: mean(nums(rows, '入射角横')), vra: mean(nums(rows, 'リリース角縦')), hra: mean(nums(rows, 'リリース角横')),
      zone: loc.length ? loc.filter(inZone).length / loc.length * 100 : null, nloc: loc.length,
      locSdH: sd(nums(loc, 'コース高さ')), locSdS: sd(nums(loc, 'コース横')),
      bauer: (v.length && sp.length) ? mean(sp) / (mean(v) / 1.609344) : null, effv: mean(nums(rows, '体感球速')) };   // Bauer Unit = rpm ÷ mph
  }
  const fmtEst = (s, key, dec, est) => est ? `<td class="n est" title="推定">${num(s, dec)}<small>推</small></td>` : `<td class="n">${num(s, dec)}</td>`;

  /* ================= 画面：取り込み =================
     投手が一覧で並び、それぞれの行でCSVを選ぶ（複数可）。最後に「まとめて取り込む」を1回。 */
  const summarize = q => {
    const hand = phand(q.pid), sides = nums(q.rows, 'リリース横幅'), ms = mean(sides);
    const expect = (hand === '左' ? -1 : 1) * rhSign();
    q.ms = ms; q.handWarn = (ms != null && sides.length >= 3 && Math.sign(ms) !== expect);
    q.dup = q.rows.filter(r => r['PlayID'] && ROWS.some(x => x['PlayID'] === r['PlayID'])).length;
    q.missBrk = q.rows.filter(r => !isNum(r['縦変化量'])).length; q.spinBad = q.rows.filter(r => r['回転数疑い']).length;
    q.dates = [...new Set(q.rows.map(r => r['測定日']))].sort();
  };
  function buildQ(q) {
    const first = q.recs.map(r => normDate(r.Date)).filter(Boolean).sort()[0] || today();
    q.sid = q.sid || uid('ts-'); q.date = first;
    q.rows = q.recs.map(r => toRow(r, { pid: q.pid, sid: q.sid, kind: q.kind, flip: q.flip, date: normDate(r.Date) || first }));
    flagSpin(q.rows); summarize(q);
  }
  async function addFiles(pid, files) {
    for (const file of files) {
      let text = ''; try { text = await file.text(); } catch (e) { continue; }
      const recs = parseCSV(text);
      if (!recs.length || !('PitchNo' in recs[0]) || !('RelSpeed' in recs[0])) { msg = `${file.name}：TrackmanのCSVではないようです（PitchNo や RelSpeed の列がありません）`; continue; }
      const pt = recs.map(r => r.PracticeType).filter(Boolean);
      const ptype = pt.sort((a, b) => pt.filter(x => x === b).length - pt.filter(x => x === a).length)[0] || '';
      const q = { id: uid('q-'), pid, name: file.name, recs, ptype, kind: KIND_OF(ptype), flip: false, force: false, status: '' };
      buildQ(q); QUEUE.push(q);
    }
    render();
  }
  function viewImport() {
    const pending = QUEUE.filter(q => !q.done);
    const ready = pending.filter(q => !q.handWarn || q.force);
    const rowsFor = pid => QUEUE.filter(q => q.pid === pid);
    const qHtml = q => {
      const hand = phand(q.pid);
      return `<div style="margin:8px 0 0 12px; padding:8px 10px; background:var(--raise); border-radius:8px; ${q.done ? 'opacity:.6' : ''}">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap">
          <b style="font-size:13px">${esc(q.name)}</b>
          <span class="muted">${q.rows.length}球</span>
          <span class="muted">${q.dates.join('、')}${q.dates.length > 1 ? ' <span class="pill bad">日付が複数</span>' : ''}</span>
          ${q.done ? `<span class="pill live">${esc(q.status)}</span>` : `<select data-qkind="${q.id}"><option ${q.kind === '対戦' ? 'selected' : ''}>対戦</option><option ${q.kind === 'ブルペン' ? 'selected' : ''}>ブルペン</option></select>
          <button class="b" data-qdel="${q.id}" style="padding:3px 9px;font-size:12px">外す</button>`}
        </div>
        <div class="muted" style="font-size:11.5px; margin-top:4px">
          ${q.ms != null ? (q.handWarn ? `<span class="pill bad">${esc(hand)}投げの選手に${hand === '右' ? '左' : '右'}投げの形のデータ（リリース横幅 ${num(q.ms, 2)} m）</span> 選手が違う可能性が高いです。`
                                       : `投げ手 一致（${esc(hand)}投・${num(q.ms, 2)} m）`) : '投げ手 判定できず'}
          ${q.missBrk ? `　変化量が計測されていない ${q.missBrk}球（データなしとして扱います）` : ''}　回転数の疑い ${q.spinBad}球${q.dup ? `　<b>すでに入っている ${q.dup}球</b>（飛ばします）` : ''}
          ${q.status && !q.done ? `　<b style="color:var(--accent)">${esc(q.status)}</b>` : ''}
        </div>
        ${q.handWarn && !q.done ? `<div class="noprint" style="margin-top:4px"><label class="c"><input type="checkbox" data-qforce="${q.id}" ${q.force ? 'checked' : ''}> それでも取り込む</label>　<label class="c"><input type="checkbox" data-qflip="${q.id}" ${q.flip ? 'checked' : ''}> 左右を反転して取り込む（機器の向きが逆だと分かっているときだけ）</label></div>` : ''}
      </div>`;
    };
    const table = `<div class="card"><h3>投手ごとにCSVを選ぶ<span class="u">1つのCSVは1人分。複数のファイルをまとめて選べます</span></h3>
      ${PITCHERS.map(p => { const pid = String(p['選手ID']); const qs = rowsFor(pid);
          return `<div style="border-top:1px solid var(--line); padding:9px 0">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
              <b style="font-size:14px">${esc(p['氏名'])}</b><span class="muted">${esc(phand(pid))}投</span>
              <span class="muted" style="font-size:12px">${qs.length ? `${qs.length}ファイル・${qs.reduce((n, q) => n + q.rows.length, 0)}球` : 'まだ選んでいません'}</span>
              <button class="b" data-pick="${esc(pid)}" style="margin-left:auto">CSVを選ぶ</button><input type="file" accept=".csv,text/csv" multiple hidden data-pidfile="${esc(pid)}">
            </div>
            ${qs.map(qHtml).join('')}
          </div>`; }).join('')}
      <div class="note">対戦（LiveBpPitching）もブルペン（Pitching）も同じ列なので、どちらも同じ手順です。ここで選んだだけでは保存されません。下の「まとめて取り込む」を押すと、上から順に保存します。</div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px">
        <button class="b primary" id="tm-goall" ${(!ready.length || busy) ? 'disabled' : ''}>${ready.length ? `${ready.length}ファイル・${ready.reduce((s, q) => s + q.rows.length, 0)}球をまとめて取り込む` : 'まとめて取り込む'}</button>
        ${pending.length - ready.length ? `<span class="muted" style="font-size:12px">警告のある${pending.length - ready.length}ファイルは、「それでも取り込む」に印を付けない限り飛ばします</span>` : ''}
        ${QUEUE.some(q => q.done) ? `<button class="b" id="tm-clear">済んだ分を消す</button>` : ''}
      </div>
      ${IMPMSG ? `<div class="ok" style="margin-top:10px">${esc(IMPMSG)}</div>` : ''}
    </div>`;
    const sess = SESSIONS.slice().sort((a, b) => String(b['取り込み日時']).localeCompare(String(a['取り込み日時']))).slice(0, 30);
    return table + `<div class="card"><h3>取り込み済み<span class="u">新しい順・最近30件</span></h3>
        ${sess.length ? `<div class="tw"><table><tr><th>測定日</th><th>投手</th><th>種別</th><th class="n">球数</th><th>取り込み</th><th>ファイル</th><th></th></tr>
        ${sess.map(s => `<tr><td>${esc(s['測定日'])}</td><td>${esc(pname(s['投手ID']))}</td><td>${esc(s['種別'])}</td><td class="n">${esc(s['球数'])}</td>
          <td class="muted">${esc(String(s['取り込み日時']).slice(0, 16))} ${esc(s['記録者'])}</td><td class="muted">${esc(s['ファイル名'])}</td>
          <td>${isAdmin() ? `<button class="b danger" data-delsess="${esc(s['セッションID'])}" style="padding:3px 9px;font-size:12px">削除</button>` : ''}</td></tr>`).join('')}</table></div>`
        : '<div class="empty">まだ取り込んでいません</div>'}</div>`;
  }
  async function importAll() {
    const todo = QUEUE.filter(q => !q.done && (!q.handWarn || q.force));
    if (!todo.length) return;
    busy = true; IMPMSG = ''; render();
    let okN = 0, ballN = 0, skipN = 0, earliest = null; const errs = [];
    for (const q of todo) {
      try {
        const rows = q.rows.filter(r => !(r['PlayID'] && ROWS.some(x => x['PlayID'] === r['PlayID'])));
        if (!rows.length) { q.done = true; q.status = 'すべて入っていました'; okN++; skipN += q.rows.length; render(); continue; }
        q.status = '保存中…'; render();
        const s = await api('upsertTmSession', { row: { 'セッションID': q.sid, '投手ID': q.pid, '測定日': q.date, '種別': q.kind, '球数': rows.length,
          'ファイル名': q.name, '備考': q.flip ? '左右反転' : '' } });
        if (!s.ok) throw new Error(s.error || 'セッションを保存できませんでした');
        let added = 0, skipped = 0;
        for (let i = 0; i < rows.length; i += 200) {
          const j = await api('upsertTmPitches', { rows: rows.slice(i, i + 200) });
          if (!j.ok) throw new Error(j.error || '投球を保存できませんでした');
          added += j.added || 0; skipped += j.skipped || 0;
          q.status = `保存中… ${Math.min(i + 200, rows.length)} / ${rows.length}`; render();
        }
        // 次のファイルの重複判定のために、いま入れた球を手元にも足しておく
        rows.forEach(r => ROWS.push(r));
        q.done = true; q.status = `${added}球 取り込み済み${skipped ? `（${skipped}球は入っていた）` : ''}`;
        okN++; ballN += added; skipN += skipped;
        if (!earliest || q.date < earliest) earliest = q.date;
      } catch (e) { q.status = ''; errs.push(`${q.name}：${String(e.message || e)}`); }
      render();
    }
    busy = false;
    IMPMSG = `${okN}ファイル・${ballN}球を取り込みました${skipN ? `（${skipN}球はすでに入っていたので飛ばしました）` : ''}`;
    msg = errs.length ? errs.join(' / ') : '';
    await load(earliest && earliest < fetchedFrom ? earliest : undefined);
    render();
  }

  /* ================= 画面：個人 ================= */
  /* ---- 表示項目（レポートに出す列・グラフ）。端末ごとに覚える ---- */
  const METRICS = [['球速', 'velo', 1], ['最速', 'vmax', 1], ['回転数', 'spin', 0], ['回転効率', 'eff', 0], ['縦変化量', 'ivb', 1], ['横変化量', 'hb', 1],
    ['リリース高さ', 'relH', 2], ['リリース横幅', 'relS', 2], ['エクステンション', 'ext', 2], ['入射角縦', 'vaa', 1], ['入射角横', 'haa', 1], ['リリース角縦', 'vra', 1], ['リリース角横', 'hra', 1],
    ['ゾーン率', 'zone', 0], ['ばらつき', 'locsd', 0], ['Bauer', 'bauer', 1], ['体感球速', 'effv', 1]];
  /* 個人①の表：上段「球の質」・下段「リリース・角度」。直球との差は個人画面だけの列 */
  const P_COLQ = [['球速', 'velo', 1], ['最速', 'vmax', 1], ['直球との差', 'gap', 1], ['回転数', 'spin', 0], ['回転効率', 'eff', 0], ['縦変化量', 'ivb', 1], ['横変化量', 'hb', 1],
    ['ゾーン率', 'zone', 0], ['ばらつき', 'locsd', 0], ['Bauer', 'bauer', 1], ['体感球速', 'effv', 1]];
  const P_COLR = [['リリース高さ', 'relH', 2], ['リリース横幅', 'relS', 2], ['エクステンション', 'ext', 2], ['リリース角縦', 'vra', 1], ['リリース角横', 'hra', 1], ['入射角縦', 'vaa', 1], ['入射角横', 'haa', 1]];
  const P_CHARTS = ['軌道（横から・トンネル）', '変化量', 'リリース点', 'コース', 'リリースをそろえたシミュレーション'];
  const SHOWKEY = 'hsp-tmshow-' + CFG.TEAM_ID + CFG.STORE;
  let SHOW = (() => { try { return JSON.parse(localStorage.getItem(SHOWKEY) || '{}'); } catch (e) { return {}; } })();
  const DEF_HIDE = { 'p:col:体感球速': 1,
                     'c:col:入射角横': 1, 'c:col:リリース角縦': 1, 'c:col:リリース角横': 1, 'c:col:体感球速': 1 };
  const on = k => (k in SHOW) ? !!SHOW[k] : !DEF_HIDE[k];
  const saveShow = () => { try { localStorage.setItem(SHOWKEY, JSON.stringify(SHOW)); } catch (e) {} };
  const ITEMS = {
    player: [['① その日の投球', [['p:kpi', '上の数字（球数・平均球速など）'], ['p:table', '球種別の表']].concat(P_CHARTS.map(n => ['p:chart:' + n, n]))],
             ['表の列（球の質）', P_COLQ.map(m => ['p:col:' + m[0], m[0]])],
             ['表の列（リリース・角度）', P_COLR.map(m => ['p:col:' + m[0], m[0]])],
             ['シミュレーションの中身', [['p:sim:same', '① 同じ角度で投げた図'], ['p:sim:zone', '① 捕手から見た到達点'], ['p:sim:aim', '② 真ん中に通す図'], ['p:sim:table', '表']]]],
    team:   [['表の列', METRICS.map(m => ['t:col:' + m[0], m[0]])],
             ['その他', [['t:scatter', '散布図'], ['t:alltypes', '球種ごとの球速と回転数']]]],
    compare:[['表の列', METRICS.map(m => ['c:col:' + m[0], m[0]])],
             ['グラフ', ['変化量', 'リリース点', 'リリース高さ×エクステンション', '球速', '回転数', 'コース'].map(n => ['c:chart:' + n, n])]]
  };
  function showPanel(view) {
    if (!F.showPanel) return '';
    const groups = ITEMS[view] || [];
    return `<div class="card noprint"><h3>表示項目<span class="u">消した項目はPDFにも出ません。この端末にだけ覚えます</span></h3>
      ${groups.map(([g, items]) => `<div class="note" style="margin:6px 0 4px"><b>${esc(g)}</b></div><div class="chips">${items.map(([k, n]) => `<button class="chip" data-show="${esc(k)}" aria-pressed="${on(k)}">${esc(n)}</button>`).join('')}</div>`).join('')}
      <div style="margin-top:10px"><button class="b" id="tm-showall" data-view="${view}">この画面をすべて表示に戻す</button></div></div>`;
  }
  const showBtn = () => `<button class="b" id="tm-showbtn" aria-pressed="${!!F.showPanel}">表示項目</button>`;
  function cell(s, m) {
    if (m[1] === 'eff') return fmtEst(s.eff, '', 0, s.effEst);
    if (m[1] === 'locsd') return `<td class="n">${num(s.locSdH != null ? s.locSdH * 100 : null, 0)} / ${num(s.locSdS != null ? s.locSdS * 100 : null, 0)}<small>cm</small></td>`;
    const extra = m[1] === 'spin' ? `<small>${s.nspin}</small>` : m[1] === 'zone' ? `<small>${s.nloc}</small>` : m[1] === 'ivb' ? `<small>${s.nbrk}</small>` : '';
    return `<td class="n">${num(s[m[1]], m[2])}${extra}</td>`;
  }
  const colsOf = pre => METRICS.filter(m => on(pre + m[0]));

  function filterBar(extra) {
    return `<div class="bar noprint">
      ${SELF ? '' : `<label class="f">投手<select id="tm-player">${PITCHERS.map(p => `<option value="${esc(p['選手ID'])}" ${String(p['選手ID']) === F.player ? 'selected' : ''}>${esc(p['氏名'])}${ACTIVE[String(p['選手ID'])] ? '' : '（' + esc(stateOf(p)) + '）'}</option>`).join('')}</select></label>
        <label class="c" style="padding-bottom:7px"><input type="checkbox" id="tm-showret" ${F.showRetired ? 'checked' : ''}> 引退も表示</label>`}
      <label class="f">期間 から<input type="date" id="tm-from" value="${F.from}"></label>
      <label class="f">まで<input type="date" id="tm-to" value="${F.to}"></label>
      <label class="f">種別<select id="tm-kindf"><option value="">対戦もブルペンも</option><option value="対戦" ${F.kind === '対戦' ? 'selected' : ''}>対戦だけ</option><option value="ブルペン" ${F.kind === 'ブルペン' ? 'selected' : ''}>ブルペンだけ</option></select></label>
      <label class="c" style="padding-bottom:7px"><input type="checkbox" id="tm-warm" ${F.warm ? 'checked' : ''}> Warmupも含める</label>
      ${extra || ''}
      <div style="margin-left:auto; display:flex; gap:6px">${SELF ? '' : `<button class="b" id="tm-retbtn" aria-pressed="${!!F.retPanel}">現役・引退</button>`}${showBtn()}<button class="b" id="tm-print">PDFで保存</button></div>
    </div>`;
  }
  function typeChips(types, rows) {
    return `<div class="chips noprint" style="margin-bottom:10px">${types.map(t => `<button class="chip" data-tt="${esc(t)}" aria-pressed="${!F.hideTypes[t]}"><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))} <span class="muted">${rows.filter(r => String(r['球種']) === t).length}</span></button>`).join('')}</div>`;
  }
  function simCard(rows, types) {
    const o = { tun: tunnelDist(), zone: zone(), color: typeColor, jtype, xlabels: sideLabels() };
    const S = simCalc(rows, types, o);
    const head = `<h3>リリースをそろえたシミュレーション<span class="u">参考値。ストレートの平均リリース点から、各球種の平均の球速・変化で投げたとして計算</span></h3>`;
    if (!S || S.rows.length < 2) return `<div class="card" style="grid-column:1 / -1">${head}<div class="empty">計算できる球種が2つ以上ありません（リリース・エクステンション・軌道がそろって計測できた球だけを使います）</div></div>`;
    const side = v => { if (!isNum(v)) return '—'; const a = Math.round(Math.abs(v)); return a === 0 ? '0' : `${sideLabels()[v > 0 ? 1 : 0]} ${a}`; };
    const pm = (v, d) => !isNum(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(d);
    const tb = `<div class="tw"><table>
      <tr><th rowspan="2">球種</th><th class="n" rowspan="2">球数</th><th class="n" rowspan="2">球速</th>
        <th colspan="2" class="c1">① ストレートと同じ角度で投げたら</th><th colspan="3" class="c2">② 真ん中に通すなら</th><th class="n" rowspan="2">実際の<br>リリース角 縦</th></tr>
      <tr><th class="n c1">高さの差 cm</th><th class="n c1">横の差 cm</th><th class="n c2">リリース角 縦</th><th class="n c2">ストレートとの差</th><th class="n c2">トンネル点での差 cm</th></tr>
      ${S.rows.map(r => { const isB = r.t === S.base; return `<tr><td><span class="sw" style="background:${typeColor(r.t)}"></span>${esc(jtype(r.t))}${isB ? ' <small class="muted">基準</small>' : ''}</td>
        <td class="n">${r.m.n}${r.m.n < 3 ? '<small>少</small>' : ''}</td><td class="n">${num(r.m.kmh, 1)}</td>
        <td class="n">${isB ? '0' : pm(Math.round(r.dz), 0)}${r.same.plate && r.same.plate[1] < 0 ? '<small>ワンバン</small>' : ''}</td><td class="n">${isB ? '0' : side(r.dx)}</td>
        <td class="n">${num(r.th, 1)}°</td><td class="n">${isB ? '—' : pm(r.dth, 1) + '°'}</td><td class="n">${isB ? '—' : num(r.tun, 0)}</td>
        <td class="n">${num(r.m.vra, 1)}°</td></tr>`; }).join('')}
      ${types.filter(t => !S.rows.some(r => r.t === t)).map(t => `<tr class="muted"><td><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))}</td><td class="n">0</td><td colspan="7">データなし（変化量・リリース・軌道がそろって計測できた球がありません）</td></tr>`).join('')}
      </table></div>`;
    const pSame = on('p:sim:same') ? `<div><div class="note" style="margin:0 0 4px"><b>① ストレートが真ん中の高さに届く角度（縦 ${S.a0[0].toFixed(1)}°）で、ほかの球種も投げたら</b>　どこまで落ちる・曲がるか</div>${simSide(S, 'same', o)}</div>` : '';
    const pZone = on('p:sim:zone') ? `<div><div class="note" style="margin:0 0 4px"><b>捕手から見た到達点（①）</b>　＋が真ん中</div>${simZone(S, o)}</div>` : '';
    const pAim = on('p:sim:aim') ? `<div class="note" style="margin:10px 0 4px"><b>② 全球種を真ん中（高さ ${S.tz.toFixed(2)} m）に通すなら</b>　リリースでどれだけ上（下）に投げ出す必要があるか</div>${simSide(S, 'aim', o)}` : '';
    const row1 = pSame && pZone ? `<div class="simrow">${pSame}${pZone}</div>` : pSame ? pSame : pZone ? `<div style="max-width:420px">${pZone}</div>` : '';
    if (!row1 && !pAim && !on('p:sim:table')) return '';
    return `<div class="card sim" style="grid-column:1 / -1">${head}
      ${row1}${pAim}
      ${on('p:sim:table') ? tb : ''}
      <div class="note" style="margin:6px 0 0">角度は上向きが＋。投げ出しの角度が1°違うと、本塁では約30cmずれます。②の「ストレートとの差」が小さいほど、リリース直後は打者から見分けにくい球です。「実際のリリース角」はTrackmanの計測（それぞれの球種のリリース点・コースのまま）なので、②の値とは一致しません。「少」は使えた球が3球未満で、数字がぶれやすい球種です。<br>球速と変化は狙う角度を変えても同じ、という前提の近似です。実際に同じリリースで投げ分けられるかは別なので、数字は参考にしてください。</div></div>`;
  }
  /* ================= 球種カルテ（1つの球種の移り変わり） =================
     セッション＝「測定日 × 種別（対戦／ブルペン）」。上の絞り込み（期間・種別・Warmup）がそのまま効く。
     チーム平均：スタッフは端末にある全投手のデータから、選手本人はサーバーから平均と順位だけを受け取る。
     どちらも「同じ投げ手（右/左）」「現役（名簿の状態が 引退・卒業・退部 でない）」の投手だけ。 */
  const FB_KEYS = ['Fastball', 'TwoSeamFastBall', 'Sinker'];
  const fbKeyOf = rows => FB_KEYS.find(k => rows.some(r => String(r['球種']) === k)) || '';
  /* 空振りゾーン：MLB 2024・2025年 Statcast の集計で、直球との球速差が10%以上で空振り率が高かった球種だけ色分けする */
  const ZONE_T = { Slider: 1, Splitter: 1, ChangeUp: 1 };
  const ZONE_LO = 10, ZONE_MID = 8;
  const K_MIN = 5;   // チーム平均に入れる最少球数（1人・1球種あたり）
  let TEAMREF = { key: '', data: null, busy: false, err: '' };

  /* 1人分の球種ごとの平均（チーム平均・順位のもと） */
  function playerTypeStats(rows) {
    const fk = fbKeyOf(rows), out = {};
    const fs = fk ? stats(rows.filter(r => String(r['球種']) === fk)) : null;
    typesIn(rows).forEach(t => {
      const rs = rows.filter(r => String(r['球種']) === t); if (rs.length < K_MIN) return;
      const s = stats(rs);
      out[t] = { n: rs.length, velo: s.velo, spin: s.spin, ivb: s.ivb, hb: s.hb, relH: s.relH, relS: s.relS, ext: s.ext, vaa: s.vaa,
        gap: (t !== fk && fs && fs.n >= K_MIN && isNum(fs.velo) && isNum(s.velo)) ? (fs.velo - s.velo) / fs.velo * 100 : null };
    });
    return out;
  }
  /* スタッフ：端末のデータから、同じ投げ手の現役投手の一覧（値つき） */
  function teamRefLocal(hand) {
    const rows = filt(ROWS, {}).filter(r => ACTIVE[String(r['投手ID'])] && phand(r['投手ID']) === hand);
    const byP = {}; rows.forEach(r => { (byP[r['投手ID']] = byP[r['投手ID']] || []).push(r); });
    const types = {};
    Object.keys(byP).forEach(pid => { const ps = playerTypeStats(byP[pid]);
      Object.keys(ps).forEach(t => { (types[t] = types[t] || []).push(Object.assign({ pid }, ps[t])); }); });
    const out = {};
    Object.keys(types).forEach(t => { const list = types[t]; const avg = {};
      ['velo', 'gap', 'spin', 'ivb', 'hb', 'relH', 'relS', 'ext', 'vaa'].forEach(k => { avg[k] = mean(list.map(x => x[k]).filter(isNum)); });
      out[t] = { n: list.length, avg, list }; });
    return out;
  }
  const refKey = () => JSON.stringify([F.from, F.to, F.kind, F.warm]);
  /* 選手本人：サーバーに平均と順位だけ聞く（ほかの選手の値そのものは受け取らない） */
  async function fetchTeamRef() {
    const key = refKey(); if (TEAMREF.busy || TEAMREF.key === key) return;
    TEAMREF.busy = true;
    try { const j = await api('getMyTeamRef', { from: F.from, to: F.to, kind: F.kind, warm: F.warm });
      TEAMREF = { key, data: j.ok ? (j.types || {}) : null, busy: false, err: j.ok ? '' : (j.error || '') }; }
    catch (e) { TEAMREF = { key, data: null, busy: false, err: String(e.message || e) }; }
    render();
  }
  function teamRefFor(t, hand) {
    if (!SELF) { const r = teamRefLocal(hand)[t]; return r ? { n: r.n, avg: r.avg, list: r.list } : null; }
    if (TEAMREF.key !== refKey()) { fetchTeamRef(); return null; }
    const r = TEAMREF.data && TEAMREF.data[t]; return r ? { n: r.n, avg: r.avg || {}, rank: r.rank || {} } : null;
  }
  /* セッションごとの数字 */
  function karteSessions(all, t) {
    const fk = fbKeyOf(all);
    const keys = [...new Set(all.map(r => r['測定日'] + '|' + r['種別']))].sort();
    return keys.map(k => { const [d, kind] = k.split('|');
      const rs = all.filter(r => r['測定日'] === d && r['種別'] === kind);
      const tr = rs.filter(r => String(r['球種']) === t); if (!tr.length) return null;
      const fr = fk ? rs.filter(r => String(r['球種']) === fk) : [];
      const s = stats(tr), f = fr.length ? stats(fr) : null;
      return { d, kind, rows: tr, s, f, gap: (t !== fk && f && isNum(f.velo) && isNum(s.velo)) ? (f.velo - s.velo) / f.velo * 100 : null };
    }).filter(Boolean);
  }
  const kMark = (kind, c, x, y, r) => kind === '対戦'
    ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" stroke="var(--paper)" stroke-width="1.2"/>`
    : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="var(--paper)" stroke="${c}" stroke-width="1.8"/>`;
  function kSpark(S, key, c, team) {
    const w = 132, h = 38, vals = S.map(x => key === 'gap' ? x.gap : x.s[key]);
    const pts = vals.map((v, i) => ({ v, i, kind: S[i].kind })).filter(p => isNum(p.v));
    if (!pts.length) return '';
    const all = pts.map(p => p.v).concat(isNum(team) ? [team] : []);
    let lo = Math.min(...all), hi = Math.max(...all); if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
    const X = i => S.length === 1 ? w / 2 : 6 + i / (S.length - 1) * (w - 12), Y = v => h - 6 - (v - lo) / (hi - lo) * (h - 12);
    let s = `<svg class="ch" viewBox="0 0 ${w} ${h}" style="max-width:${w}px">`;
    if (isNum(team)) s += `<line x1="2" x2="${w - 2}" y1="${Y(team).toFixed(1)}" y2="${Y(team).toFixed(1)}" stroke="var(--muted)" stroke-dasharray="3 3" stroke-width="1"/>`;
    if (pts.length > 1) s += `<polyline fill="none" stroke="${c}" stroke-width="1.8" points="${pts.map(p => X(p.i).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}"/>`;
    pts.forEach((p, k) => { s += kMark(p.kind, c, X(p.i), Y(p.v), k === pts.length - 1 ? 3.6 : 2.6); });
    return s + '</svg>';
  }
  function kTile(S, m, c, ref, hand) {
    const vals = S.map(x => m.k === 'gap' ? x.gap : x.s[m.k]).filter(isNum);
    if (!vals.length) return '';
    const last = vals[vals.length - 1], prev = vals.length > 1 ? vals[vals.length - 2] : null;
    const d = prev == null ? null : last - prev;
    const col = d == null || !m.good || Math.abs(d) < 1e-9 ? 'var(--ink2)' : (d * m.good > 0 ? 'var(--hit,#1e8a4c)' : 'var(--clay)');
    const arrow = d == null ? '' : `<div class="kd" style="color:${col}">${d > 0 ? '▲' : d < 0 ? '▼' : '±'}${Math.abs(d).toFixed(m.dec)} <span>前回比</span></div>`;
    const tv = ref && isNum(ref.avg[m.k]) ? ref.avg[m.k] : null;
    const rk = ref && ref.rank && ref.rank[m.k];
    const team = tv != null ? `<div class="kt">チーム${esc(hand)}投平均 ${tv.toFixed(m.dec)}${m.u}${rk ? `　${rk[0]}位/${rk[1]}人` : ''}</div>` : '';
    const zone = m.k === 'gap' && m.zone ? (last >= ZONE_LO ? ' zone' : last >= ZONE_MID ? ' mid' : '') : '';
    const badge = zone === ' zone' ? '<span class="kbadge">空振りゾーン</span>' : '';
    return `<div class="ktile${zone}"><div class="kk">${esc(m.n)}</div><div class="ktv">${last.toFixed(m.dec)}<small>${m.u}</small>${badge}</div>${arrow}${kSpark(S, m.k, c, tv)}${team}</div>`;
  }
  function kGapChart(S, isZone, tv, c) {
    const P = S.map((x, i) => ({ i, v: x.gap, kind: x.kind, d: x.d })).filter(p => isNum(p.v));
    if (!P.length) return '<div class="empty">直球と同じ日に投げた記録がありません</div>';
    const w = 420, h = 230, L = 36, R = isZone ? 70 : 12, T = 14, B = 34;
    const vs = P.map(p => p.v).concat(isNum(tv) ? [tv] : []);
    const lo = Math.min(4, Math.floor(Math.min(...vs) - 1)), hi = Math.max(16, Math.ceil(Math.max(...vs) + 1));
    const X = i => S.length === 1 ? (L + w - R) / 2 : L + i / (S.length - 1) * (w - L - R), Y = v => T + (hi - v) / (hi - lo) * (h - T - B);
    let s = `<svg class="ch" viewBox="0 0 ${w} ${h}">`;
    if (isZone) {
      s += `<rect x="${L}" y="${Y(hi).toFixed(1)}" width="${w - L - R}" height="${(Y(ZONE_LO) - Y(hi)).toFixed(1)}" fill="var(--hit,#1e8a4c)" opacity=".12"/>`;
      s += `<rect x="${L}" y="${Y(ZONE_LO).toFixed(1)}" width="${w - L - R}" height="${(Y(ZONE_MID) - Y(ZONE_LO)).toFixed(1)}" fill="#c98a00" opacity=".10"/>`;
      s += `<text x="${w - R + 8}" y="${(Y((hi + ZONE_LO) / 2) - 2).toFixed(1)}" class="lab" style="fill:var(--hit,#1e8a4c)">空振り</text><text x="${w - R + 8}" y="${(Y((hi + ZONE_LO) / 2) + 11).toFixed(1)}" class="lab" style="fill:var(--hit,#1e8a4c)">ゾーン</text>`;
      s += `<text x="${w - R + 8}" y="${(Y(9) + 4).toFixed(1)}" style="fill:#a87400">ふつう</text><text x="${w - R + 8}" y="${(Y(Math.max(lo + 1, 6)) + 4).toFixed(1)}">差が小さい</text>`;
    }
    for (let v = lo; v <= hi; v += 2) s += `<line class="ax" x1="${L}" y1="${Y(v).toFixed(1)}" x2="${w - R}" y2="${Y(v).toFixed(1)}"/><text x="${L - 4}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end">${v}%</text>`;
    if (isNum(tv)) s += `<line x1="${L}" x2="${w - R}" y1="${Y(tv).toFixed(1)}" y2="${Y(tv).toFixed(1)}" stroke="var(--muted)" stroke-dasharray="5 4" stroke-width="1.2"/><text x="${w - R - 3}" y="${(Y(tv) + 12).toFixed(1)}" text-anchor="end">チーム平均 ${tv.toFixed(1)}%</text>`;
    if (P.length > 1) s += `<polyline fill="none" stroke="${c}" stroke-width="1.8" points="${P.map(p => X(p.i).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}"/>`;
    const step = Math.max(1, Math.ceil(S.length / 7));
    P.forEach(p => { s += kMark(p.kind, c, X(p.i), Y(p.v), 4) + `<text x="${X(p.i).toFixed(1)}" y="${(Y(p.v) - 8).toFixed(1)}" text-anchor="middle" style="fill:var(--ink2)">${p.v.toFixed(1)}</text><title>${p.d} ${p.kind} ${p.v.toFixed(1)}%</title>`; });
    S.forEach((x, i) => { if (i % step === 0 || i === S.length - 1) s += `<text x="${X(i).toFixed(1)}" y="${h - B + 13}" text-anchor="middle">${x.d.slice(5)}</text><text x="${X(i).toFixed(1)}" y="${h - B + 25}" text-anchor="middle" style="font-size:9px">${x.kind}</text>`; });
    return s + '</svg>';
  }
  /* 日ごとの平均を矢印でつないだ散布図（変化量・リリース点で共通） */
  function kPathChart(series, o) {
    const ptsAll = series.flatMap(sr => sr.pts.filter(p => isNum(p.x) && isNum(p.y)));
    if (!ptsAll.length) return '<div class="empty">データがありません</div>';
    const xs = ptsAll.map(p => p.x).concat(o.ref ? [o.ref.x] : []).filter(isNum), ys = ptsAll.map(p => p.y).concat(o.ref ? [o.ref.y] : []).filter(isNum);
    const px = Math.max((Math.max(...xs) - Math.min(...xs)) * .25, o.minPad), py = Math.max((Math.max(...ys) - Math.min(...ys)) * .25, o.minPad);
    const xa = Math.min(...xs) - px, xb = Math.max(...xs) + px, ya = Math.min(...ys) - py, yb = Math.max(...ys) + py;
    const extra = (X, Y) => {
      let s = `<defs>${series.map((sr, k) => `<marker id="km${o.id}${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${sr.c}"/></marker>`).join('')}</defs>`;
      (o.cloud || []).forEach(p => { if (isNum(p.x) && isNum(p.y) && p.x >= xa && p.x <= xb && p.y >= ya && p.y <= yb) s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" fill="${p.c}" opacity=".18"/>`; });
      if (o.ref && isNum(o.ref.x) && isNum(o.ref.y)) s += `<path d="M${X(o.ref.x).toFixed(1)},${(Y(o.ref.y) - 7).toFixed(1)} l7,7 l-7,7 l-7,-7 z" fill="var(--paper)" stroke="var(--muted)" stroke-width="1.5"><title>${esc(o.ref.t)}</title></path><text x="${(X(o.ref.x) + 9).toFixed(1)}" y="${(Y(o.ref.y) + 4).toFixed(1)}">${esc(o.ref.t)}</text>`;
      series.forEach((sr, k) => {
        const P = sr.pts.filter(p => isNum(p.x) && isNum(p.y)), n = P.length;
        for (let i = 0; i < n - 1; i++) { const x1 = X(P[i].x), y1 = Y(P[i].y), x2 = X(P[i + 1].x), y2 = Y(P[i + 1].y);
          if (Math.hypot(x2 - x1, y2 - y1) < 3) continue;
          s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${sr.c}" stroke-width="1.6" opacity="${(0.3 + 0.6 * (i + 1) / n).toFixed(2)}" marker-end="url(#km${o.id}${k})"/>`; }
        P.forEach((p, i) => { s += `<g opacity="${(0.35 + 0.65 * (i + 1) / n).toFixed(2)}">${kMark(p.kind, sr.c, X(p.x), Y(p.y), i === n - 1 ? 5.5 : 3.8)}</g><title>${esc(sr.name)} ${p.d} ${p.kind}</title>`;
          if (i === n - 1 || i === 0) s += `<text x="${(X(p.x) + 8).toFixed(1)}" y="${(Y(p.y) + (i === 0 ? 13 : -7)).toFixed(1)}" class="${i === n - 1 ? 'lab' : ''}" style="paint-order:stroke;stroke:var(--paper);stroke-width:3px${i === n - 1 ? ';fill:' + sr.c : ''}">${i === n - 1 ? esc(sr.name) + ' ' : ''}${p.d.slice(5)}</text>`; });
      });
      return s;
    };
    return scatter({ xr: [xa, xb], yr: [ya, yb], xl: o.xl, yl: o.yl, w: 420, h: 300, xticks: 5, yticks: 5, pts: [], extra, zero: false, xlabels: o.xlabels });
  }
  function karteCard(all, hand) {
    const types = typesIn(all);
    if (!types.length) return '';
    const fk = fbKeyOf(all);
    if (!F.kType || types.indexOf(F.kType) < 0) F.kType = fk || types[0];
    const t = F.kType, isFB = t === fk, c = typeColor(t), isZone = !!ZONE_T[t];
    let S = karteSessions(all, t);
    const nAll = S.length; if (F.kRange !== 'all') S = S.slice(-6);
    const ref = teamRefFor(t, hand), refFB = fk ? teamRefFor(fk, hand) : null;
    const chips = `<div class="chips noprint" style="margin-bottom:8px">${types.map(x => `<button class="chip" data-kt="${esc(x)}" aria-pressed="${x === t}"><span class="sw" style="background:${typeColor(x)}"></span>${esc(jtype(x))}</button>`).join('')}
      <span style="width:8px"></span><button class="chip" data-kr="6" aria-pressed="${F.kRange !== 'all'}">直近6回</button><button class="chip" data-kr="all" aria-pressed="${F.kRange === 'all'}">全期間（${nAll}回）</button></div>`;
    const head = `<h3>球種カルテ　${esc(jtype(t))}<span class="u">1回＝1日の対戦またはブルペン。● 対戦　○ ブルペン　点線＝チーム${esc(hand)}投の平均（現役のみ）</span></h3>`;
    if (!S.length) return `<div class="card karte">${head}${chips}<div class="empty">この球種の記録がありません</div></div>`;
    const M = [{ k: 'velo', n: '平均球速', u: 'km/h', dec: 1, good: 1 }]
      .concat(isFB ? [{ k: 'vmax', n: '最高球速', u: 'km/h', dec: 1, good: 1 }] : [{ k: 'gap', n: '直球との球速差', u: '%', dec: 1, good: isZone ? 1 : 0, zone: isZone }])
      .concat([{ k: 'spin', n: '回転数', u: 'rpm', dec: 0, good: isFB ? 1 : 0 }, { k: 'ivb', n: '縦変化量', u: 'cm', dec: 0, good: isFB ? 1 : 0 },
               { k: 'hb', n: '横変化量', u: 'cm', dec: 0, good: 0 }, { k: 'eff', n: '回転効率', u: '%', dec: 0, good: 0 },
               { k: 'relH', n: 'リリース高さ', u: 'm', dec: 2, good: 0 }, { k: 'ext', n: 'エクステンション', u: 'm', dec: 2, good: 1 }]);
    const last = S[S.length - 1];
    const tiles = `<div class="ktiles">${M.map(m => kTile(S, m, c, ref, hand)).join('')}</div>
      <div class="note" style="margin:6px 0 0">最新は ${last.d}（${last.kind}・${last.s.n}球）。▲▼は前回との差で、緑＝よくなった方向・赤＝下がった方向（向きに良し悪しがない項目は黒）。</div>`;
    // 球速差
    const gapCard = isFB ? '' : `<div class="card"><h3>直球との球速差（％）<span class="u">（その日の直球平均 − ${esc(jtype(t))}）÷ 直球平均</span></h3>${kGapChart(S, isZone, ref && ref.avg.gap, c)}
      <div class="note" style="margin:4px 0 0">${isZone ? `緑の帯（${ZONE_LO}%以上）は、MLBの実測で空振り率が高かった範囲です。130km/hの直球なら10%＝13km/h差。` : 'この球種は、球速差より変化の大きさの方が空振りに効くため色分けしていません。'}</div></div>`;
    // 変化量の移動
    const mvCard = `<div class="card"><h3>変化量の移動<span class="u">日ごとの平均。薄い粒＝最新日の1球ずつ</span></h3>${kPathChart(
      [{ name: jtype(t), c, pts: S.map(x => ({ x: x.s.hb, y: x.s.ivb, d: x.d, kind: x.kind })) }],
      { id: 'mv', minPad: 3, xl: '横変化量 cm', yl: '縦変化量 cm', xlabels: sideLabels(), cloud: last.rows.map(r => ({ x: r['横変化量'], y: r['縦変化量'], c })),
        ref: ref && isNum(ref.avg.hb) && isNum(ref.avg.ivb) ? { x: ref.avg.hb, y: ref.avg.ivb, t: `チーム${hand}投平均` } : null })}</div>`;
    // フォームチェック：リリース点
    const fbS = fk ? karteSessions(all, fk) : [];
    const fbR = F.kRange !== 'all' ? fbS.slice(-6) : fbS;
    const relSeries = [];
    if (fk) relSeries.push({ name: jtype(fk), c: typeColor(fk), pts: fbR.map(x => ({ x: x.s.relS, y: x.s.relH, d: x.d, kind: x.kind })) });
    if (!isFB) relSeries.push({ name: jtype(t), c, pts: S.map(x => ({ x: x.s.relS, y: x.s.relH, d: x.d, kind: x.kind })) });
    const alerts = [];
    const fbRel = fbS.filter(x => isNum(x.s.relH) && isNum(x.s.relS));
    if (fbRel.length >= 3) {
      const base = fbRel.slice(0, Math.min(3, fbRel.length - 1)), lr = fbRel[fbRel.length - 1];
      const dh = (lr.s.relH - mean(base.map(x => x.s.relH))) * 100, ds = (lr.s.relS - mean(base.map(x => x.s.relS))) * 100;
      const sideW = v => `${sideLabels()[v > 0 ? 1 : 0]}へ ${Math.abs(v).toFixed(0)}cm`;
      if (Math.abs(dh) >= 4 || Math.abs(ds) >= 4) alerts.push(`<div class="warn"><b>要確認</b>　${esc(jtype(fk))}のリリースが、最初の${base.length}回の平均より 高さ ${dh >= 0 ? '+' : '−'}${Math.abs(dh).toFixed(0)}cm・${sideW(ds)}（${lr.d}）。腕の位置や体の傾きが変わっていないか確認してください。</div>`);
      else alerts.push(`<div class="ok"><b>変化なし</b>　${esc(jtype(fk))}のリリースは、最初の${base.length}回の平均から 高さ ${Math.abs(dh).toFixed(0)}cm・横 ${Math.abs(ds).toFixed(0)}cm 以内です。</div>`);
    }
    if (!isFB && fk) {
      const lf = fbS.find(x => x.d === last.d && x.kind === last.kind);
      if (lf && isNum(lf.s.relH) && isNum(last.s.relH) && isNum(lf.s.relS) && isNum(last.s.relS)) {
        const dh = (last.s.relH - lf.s.relH) * 100, ds = (last.s.relS - lf.s.relS) * 100, big = Math.max(Math.abs(dh), Math.abs(ds)) >= 5;
        alerts.push(`<div class="${big ? 'warn' : 'ok'}"><b>${big ? 'クセに注意' : 'クセなし'}</b>　${last.d}の${esc(jtype(t))}と${esc(jtype(fk))}のリリースのずれ：高さ ${Math.abs(dh).toFixed(0)}cm・横 ${Math.abs(ds).toFixed(0)}cm（目安5cm以内）${big ? '。打者に球種を見破られやすくなります' : ''}。</div>`);
      }
    }
    const relRef = refFB && isNum(refFB.avg.relS) && isNum(refFB.avg.relH) ? { x: refFB.avg.relS, y: refFB.avg.relH, t: `チーム${hand}投平均（${jtype(fk)}）` } : null;
    // フォームの数字（選んだ球種）：最初の3回の平均からのずれ。位置は4cm・角度は0.5°以上で注意
    const FM = [['リリース高さ', 'relH', 100, 'cm', 4], ['リリース横幅', 'relS', 100, 'cm', 4], ['エクステンション', 'ext', 100, 'cm', 4], ['リリース角 縦', 'vra', 1, '°', 0.5]];
    const fRows = FM.map(([n, k, mul, u, th]) => { const P = S.filter(x => isNum(x.s[k])); if (!P.length) return '';
      const lv = P[P.length - 1].s[k], base = P.length >= 3 ? P.slice(0, Math.min(3, P.length - 1)) : null;
      const d = base ? (lv - mean(base.map(x => x.s[k]))) * mul : null, dec = u === '°' ? 1 : 0;
      const judge = d == null ? '<span class="muted">—</span>' : Math.abs(d) >= th ? `<b style="color:var(--clay)">⚠ ${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(dec)}${u}</b>` : `<span style="color:var(--hit,#1e8a4c)">安定</span>`;
      return `<tr><td>${esc(n)}</td><td style="width:140px">${kSpark(S, k, c, null)}</td><td class="n">${u === '°' ? num(lv, 1) + '°' : num(lv, 2) + '<small>m</small>'}</td><td class="n">${judge}</td></tr>`; }).join('');
    const fTable = fRows ? `<div class="tsub" style="margin-top:12px">${esc(jtype(t))}のフォームの数字<span style="font-weight:400">　最新と、最初の回（最大3回）の平均とのずれ。位置4cm・角度0.5°以上で注意</span></div>
      <div class="tw"><table><tr><th>項目</th><th>変遷</th><th class="n">最新</th><th class="n">判定</th></tr>${fRows}</table></div>` : '';
    const formCard = `<div class="card"><h3>フォームチェック：リリース点の移動<span class="u">日ごとの平均 m</span></h3>${kPathChart(relSeries, { id: 'rl', minPad: 0.03, xl: 'リリース横幅 m', yl: 'リリース高さ m', xlabels: sideLabels(), ref: relRef })}${alerts.join('') || '<div class="note">比べるには3回以上の記録が必要です。</div>'}${fTable}</div>`;
    // 対戦とブルペン
    const kinds = ['ブルペン', '対戦'].filter(k => all.some(r => r['種別'] === k && String(r['球種']) === t));
    let gbCard = '';
    if (kinds.length === 2) {
      const sk = k => { const rs = all.filter(r => r['種別'] === k); const st = stats(rs.filter(r => String(r['球種']) === t)); const sf = fk ? stats(rs.filter(r => String(r['球種']) === fk)) : null;
        return { st, sf, gap: !isFB && sf && isNum(sf.velo) && isNum(st.velo) ? (sf.velo - st.velo) / sf.velo * 100 : null }; };
      const b = sk('ブルペン'), g = sk('対戦');
      const rowsT = [[`${jtype(t)} 平均球速`, 'km/h', x => x.st.velo, 1], !isFB ? ['直球との球速差', 'pt', x => x.gap, 1] : null, ['回転数', 'rpm', x => x.st.spin, 0],
        ['縦変化量', 'cm', x => x.st.ivb, 1], ['横変化量', 'cm', x => x.st.hb, 1], ['リリース高さ', 'm', x => x.st.relH, 2], ['エクステンション', 'm', x => x.st.ext, 2]].filter(Boolean);
      gbCard = `<div class="card"><h3>対戦とブルペンの比較<span class="u">この期間の平均（${esc(jtype(t))}）</span></h3><div class="tw"><table><tr><th></th><th class="n">ブルペン ○</th><th class="n">対戦 ●</th><th class="n">対戦−ブルペン</th></tr>
        ${rowsT.map(([n, u, fn, dec]) => { const vb = fn(b), vg = fn(g); return `<tr><td>${esc(n)}</td><td class="n">${num(vb, dec)}</td><td class="n">${num(vg, dec)}</td><td class="n">${isNum(vb) && isNum(vg) ? (vg - vb >= 0 ? '+' : '−') + Math.abs(vg - vb).toFixed(dec) + `<small>${u}</small>` : '—'}</td></tr>`; }).join('')}
        </table></div><div class="note" style="margin:4px 0 0">球数　ブルペン ${b.st.n}球・対戦 ${g.st.n}球</div></div>`;
    }
    const basis = `<details class="card noprint"><summary style="cursor:pointer;font-size:13px;color:var(--ink2)">空振りゾーンの根拠（MLB 2024・2025年の実測）</summary><div class="tw" style="margin-top:8px"><table>
      <tr><th>球種</th><th class="n">MLBの中央値</th><th>直球との球速差ごとの空振り率（スイングあたり）</th><th>この画面</th></tr>
      <tr><td>スライダー</td><td class="n">8.7%</td><td>6〜8%：30.4%　8〜10%：34.8%　<b>10〜12%：37.5%</b>　12〜14%：40.3%</td><td>10%以上を緑</td></tr>
      <tr><td>スプリット</td><td class="n">8.6%</td><td>6〜8%：31.1%　8〜10%：35.1%　<b>10〜12%：36.5%</b>　12〜14%：46.8%</td><td>10%以上を緑</td></tr>
      <tr><td>チェンジアップ</td><td class="n">8.4%</td><td>6〜8%：30.6%　8〜10%：31.6%　<b>10〜12%：36.4%</b>　12〜14%：34.3%</td><td>10%以上を緑</td></tr>
      <tr><td>カーブ</td><td class="n">14.4%</td><td>差を広げても空振り率は上がらない</td><td>色分けしない</td></tr>
      <tr><td>カット</td><td class="n">4.5%</td><td>差による違いが小さい</td><td>色分けしない</td></tr></table></div>
      <div class="note" style="margin:6px 0 0">Baseball Savant（Statcast）の投手ごとの球種別平均球速と空振り率を集計（スライダー389・スプリット92・チェンジアップ270・カーブ192・カット197 投手シーズン）。プロの傾向なので、高校生の目安として使ってください。</div></details>`;
    return `<div class="card karte">${head}${chips}${tiles}</div>
      <div class="kgrid">${gapCard}${mvCard}${formCard}${gbCard}</div>${basis}`;
  }
  /* 現役・引退の設定（管理者だけ）。名簿の「状態」を書き換える（記録タブの名簿と同じ場所） */
  function retPanel() {
    if (SELF || !F.retPanel) return '';
    const list = ALLP.slice().sort((a, b) => (Number(a['入学年度']) || 9999) - (Number(b['入学年度']) || 9999));
    return `<div class="card noprint"><h3>現役・引退の設定<span class="u">引退・卒業にした投手は、選手の一覧とチーム平均から外れます（記録は残ります）</span></h3>
      ${isAdmin() ? '' : '<div class="note" style="color:var(--clay)">変更できるのは管理者だけです。</div>'}
      <div class="tw"><table><tr><th>投手</th><th>投</th><th class="n">学年</th><th>状態</th><th></th></tr>
      ${list.map(p => { const st = stateOf(p); const ret = RET_ST[st]; return `<tr${ret ? ' class="muted"' : ''}><td>${esc(p['氏名'])}</td><td>${esc(p['投'] || '')}</td><td class="n">${gradeOf(p) ? gradeOf(p) + '<small>年</small>' : '—'}</td><td>${esc(st || '現役')}</td>
        <td>${isAdmin() ? `<button class="b" data-ret="${esc(p['選手ID'])}" data-to="${ret ? '' : '引退'}" ${busy ? 'disabled' : ''}>${ret ? '現役に戻す' : '引退にする'}</button>` : ''}</td></tr>`; }).join('')}
      </table></div>
      ${isAdmin() ? `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="b" data-retgrade="3" ${busy ? 'disabled' : ''}>3年生をまとめて引退にする</button><button class="b" id="tm-retclose">閉じる</button></div>` : '<div style="margin-top:8px"><button class="b" id="tm-retclose">閉じる</button></div>'}</div>`;
  }
  async function setRetire(pids, to) {
    if (!isAdmin() || !pids.length) return;
    busy = true; render();
    try {
      const m = await api('getMaster'); if (!m.ok) throw new Error(m.error || '名簿を取れませんでした');
      const now = Date.now();
      const rows = (m.master.players || []).filter(p => pids.indexOf(String(p['選手ID'])) >= 0).map(p => Object.assign({}, p, { '状態': to, '更新日時': now }));
      if (!rows.length) throw new Error('名簿に見つかりませんでした');
      const j = await api('upsertMaster', { master: { players: rows } }); if (!j.ok) throw new Error(j.error || '保存できませんでした');
      pids.forEach(id => { RETOV[id] = to; }); saveRetOv();
      applyMaster(j.master || m.master); masterFresh = true;
      msg = `${rows.length}人を「${to || '現役'}」にしました`;
    } catch (e) { msg = String(e.message || e); }
    busy = false; render();
  }
  /* ================= 画面：個人 =================
     ① その日の投球（1日分の全体像）／② 球種ごとの変遷（球種カルテ）／③ チーム内での比較 の3つに分ける。 */
  const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  /* 良くなった向き（＋1＝大きいほど良い、−1＝小さいほど良い、0＝良し悪しなし）。球種で変わるものは関数 */
  const GOOD = { velo: 1, vmax: 1, ext: 1, zone: 1, locsd: -1, effv: 1, spin: t => FB_KEYS.indexOf(t) >= 0 ? 1 : 0 };
  const goodOf = (k, t) => { const g = GOOD[k]; return typeof g === 'function' ? g(t) : (g || 0); };
  function dl(v, u, dec, good, mul) {
    if (!isNum(v) || !isNum(u)) return '';
    const d = (v - u) * (mul || 1), e = 0.5 * Math.pow(10, -dec);
    if (Math.abs(d) < e) return '<span class="dl">±0</span>';
    const cls = !good ? '' : d * good > 0 ? ' up' : ' dn';
    return `<span class="dl${cls}">${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(dec)}</span>`;
  }
  const md = d => Number(d.slice(5, 7)) + '/' + Number(d.slice(8, 10));
  function daySessions(all) {
    const m = {}; all.forEach(r => { const k = r['測定日'] + '|' + r['種別']; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).sort().reverse().map(k => { const [d, kind] = k.split('|'); return { k, d, kind, n: m[k] }; });
  }
  /* 球種ごとの数字（直球との差つき） */
  function typeStatsWithGap(rows) {
    const fk = fbKeyOf(rows), fs = fk ? stats(rows.filter(r => String(r['球種']) === fk)) : null, out = {};
    typesIn(rows).forEach(t => { const s = stats(rows.filter(r => String(r['球種']) === t));
      s.gap = (t !== fk && fs && isNum(fs.velo) && isNum(s.velo)) ? (fs.velo - s.velo) / fs.velo * 100 : null; out[t] = s; });
    return out;
  }
  function dayView(all, hand) {
    const SS = daySessions(all);
    if (F.day == null || (F.day && !SS.some(x => x.k === F.day))) F.day = SS.length ? SS[0].k : '';
    const shown = F.dayAll ? SS : SS.slice(0, 8);
    const chips = `<div class="card noprint" style="padding:9px 12px"><div class="chips"><b style="font-size:11px;color:var(--muted);margin-right:2px;align-self:center">見る日</b>
      <button class="chip" data-day="" aria-pressed="${F.day === ''}">期間全体 <span class="muted">${all.length}球</span></button>
      ${shown.map(x => `<button class="chip" data-day="${esc(x.k)}" aria-pressed="${F.day === x.k}">${esc(md(x.d))} ${esc(x.kind)} <span class="muted">${x.n}球</span></button>`).join('')}
      ${SS.length > 8 ? `<button class="chip" data-dayall="1">${F.dayAll ? '少なく表示' : `ほかの日（${SS.length - 8}回）`}</button>` : ''}</div></div>`;
    const day = F.day ? SS.find(x => x.k === F.day) : null;
    const rows = day ? all.filter(r => r['測定日'] === day.d && r['種別'] === day.kind) : all;
    // いつも＝その日の前30日（同じ種別の絞り込み・その日は除く）。期間全体のときは比べない
    const base = day ? filt(ROWS, { pid: F.player, from: addDays(day.d, -30), to: day.d }).filter(r => !(r['測定日'] === day.d && r['種別'] === day.kind)) : [];
    const types = typesIn(rows), vis = rows.filter(r => !F.hideTypes[String(r['球種'])]);
    const TS = typeStatsWithGap(rows), TU = base.length ? typeStatsWithGap(base) : {};
    const U = t => (TU[t] && TU[t].n >= 3) ? TU[t] : null;
    const fk = fbKeyOf(rows), sfb = fk ? TS[fk] : stats([]), ufb = fk ? U(fk) : null, sall = stats(rows), uall = base.length >= 10 ? stats(base) : null;
    const label = day ? `${md(day.d)} ${day.kind}` : '期間全体';
    const vsTxt = (v, u, dec, good) => { const x = dl(v, u, dec, good); return x ? x.replace('<span class="dl', '<div class="dl').replace('</span>', ' <i style="font-style:normal;font-weight:400;color:var(--muted)">いつもより</i></div>') : ''; };
    const kpis = `<div class="kpis">
      <div class="kpi"><b>球数</b><span>${rows.length}</span><small>球</small><div class="dl" style="font-weight:400">${day ? esc(day.kind) + '・' + types.length + '球種' : `${rows.filter(r => r['種別'] === '対戦').length}対戦 / ${rows.filter(r => r['種別'] === 'ブルペン').length}ブルペン`}</div></div>
      <div class="kpi"><b>${esc(fk ? jtype(fk) : 'ストレート')} 平均球速</b><span>${num(sfb.velo, 1)}</span><small>km/h</small>${vsTxt(sfb.velo, ufb && ufb.velo, 1, 1)}</div>
      <div class="kpi"><b>${esc(fk ? jtype(fk) : 'ストレート')} 最速</b><span>${num(sfb.vmax, 1)}</span><small>km/h</small>${vsTxt(sfb.vmax, ufb && ufb.vmax, 1, 1)}</div>
      <div class="kpi"><b>${esc(fk ? jtype(fk) : 'ストレート')} 回転数</b><span>${num(sfb.spin, 0)}</span><small>rpm</small>${vsTxt(sfb.spin, ufb && ufb.spin, 0, 1)}</div>
      <div class="kpi"><b>ゾーン率</b><span>${num(sall.zone, 0)}</span><small>%　${sall.nloc}球</small>${vsTxt(sall.zone, uall && uall.zone, 0, 1)}</div>
    </div>`;
    const dcell = (t, m) => { const s = TS[t], u = U(t), k = m[1];
      if (k === 'locsd') return `<td class="n">${num(s.locSdH != null ? s.locSdH * 100 : null, 0)} / ${num(s.locSdS != null ? s.locSdS * 100 : null, 0)}<small>cm</small></td>`;
      if (k === 'gap' && !isNum(s.gap)) return '<td class="n muted">—</td>';
      const unit = k === 'gap' || k === 'zone' || k === 'eff' ? '<small>%</small>' : (k === 'vra' || k === 'hra' || k === 'vaa' || k === 'haa') ? '°' : '';
      return `<td class="n">${num(s[k], m[2])}${unit}${u ? dl(s[k], u[k], m[2], goodOf(k, t)) : ''}</td>`; };
    const tbl = cols => !cols.length ? '' : `<div class="tw"><table><tr><th>球種</th>${cols === pq ? '<th class="n">球数</th>' : ''}${cols.map(m => `<th class="n">${esc(m[0])}</th>`).join('')}</tr>
      ${types.map(t => `<tr><td><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))}</td>${cols === pq ? `<td class="n">${TS[t].n}<span class="dl" style="font-weight:400">${rows.length ? Math.round(TS[t].n / rows.length * 100) : 0}%</span></td>` : ''}${cols.map(m => dcell(t, m)).join('')}</tr>`).join('')}</table></div>`;
    const pq = P_COLQ.filter(m => on('p:col:' + m[0])), pr = P_COLR.filter(m => on('p:col:' + m[0]));
    const table = `<div class="card"><h3>球種別の数字（${esc(label)}）<span class="u">${day ? (base.length ? '小さい数字＝いつも（この日の前30日の平均、同じ球種3球以上）との差' : 'この日の前30日に記録がないので、いつもとの差は出していません') : '期間の平均'}</span></h3>
      ${pq.length ? `<div class="tsub">球の質</div>${tbl(pq)}` : ''}
      ${pr.length ? `<div class="tsub">リリース・角度<span style="font-weight:400">　角度は上向きが＋</span></div>${tbl(pr)}` : ''}
      <div class="note" style="margin:6px 0 0">単位：球速 km/h、回転数 rpm、変化量 cm、リリース m、角度 度、ばらつき cm（縦/横）、Bauer＝回転数÷球速(mph)。直球との差＝その日の直球平均との球速差 %。ゾーンは175cm想定（高さ ${zone().bot}〜${zone().top} m、横 ±${zone().side} m）。Warmupは${F.warm ? '含みます' : '除いています'}。列は「表示項目」で出し入れできます。</div></div>`;
    // グラフ
    const ref = veloRef(rows);
    const col = r => shade(typeColor(r['球種']), ref ? Number(r['球速']) / ref : null);
    const vt = r => `${jtype(r['球種'])} ${r['測定日']} ${num(r['球速'], 1)}km/h${ref && isNum(r['球速']) ? `（${Math.round(r['球速'] / ref * 100)}%）` : ''}`;
    const vtypes = types.filter(t => !F.hideTypes[t]);
    const rings = (kx, ky) => (X, Y) => vtypes.map(t => { const u = U(t); if (!u || !isNum(u[kx]) || !isNum(u[ky])) return '';
      return `<circle cx="${X(u[kx]).toFixed(1)}" cy="${Y(u[ky]).toFixed(1)}" r="9" fill="none" stroke="${typeColor(t)}" stroke-width="1.8" stroke-dasharray="3 2"><title>${esc(jtype(t))} いつもの平均</title></circle>`; }).join('');
    const ringNote = day && base.length ? '点線の輪＝いつも（前30日）の平均。' : '';
    const meansMv = vtypes.map(t => ({ x: TS[t].hb, y: TS[t].ivb, c: typeColor(t), label: jtype(t), t: `${jtype(t)} 平均 縦${num(TS[t].ivb, 0)} 横${num(TS[t].hb, 0)}（${TS[t].nbrk}球）` }));
    const shadeNote = ref ? `色の濃さ＝球速（ストレート平均 ${num(ref, 1)} km/h を100%として）。` : '';
    const CH = {
      '軌道（横から・トンネル）': () => `<div class="card" style="grid-column:1 / -1"><h3>軌道（横から）とピッチトンネル<span class="u">細い線＝1球、太い線＝球種の平均。トンネル点の縦線はストレートとの離れ</span></h3>${sideView(vis, vtypes, { tun: tunnelDist(), zone: zone(), color: typeColor, jtype })}<div class="note" style="margin:6px 0 0">トンネル点＝打者が振るか決めるとされる地点（本塁まで ${tunnelDist()} m、到達の約0.2秒前）。ストレートとの離れが、トンネル点で小さく本塁で大きいほど見分けにくい球です。離れは球種の平均軌道どうしで測っています。</div></div>`,
      '変化量': () => `<div class="card"><h3>変化量（${esc(label)}）<span class="u">横 × 縦 cm。大きい点はこの日の平均</span></h3>${scatter({ xr: [-70, 70], yr: [-70, 70], xl: '横変化量 cm', yl: '縦変化量 cm', xticks: 7, yticks: 7, xlabels: sideLabels(),
        pts: vis.map(r => ({ x: r['横変化量'], y: r['縦変化量'], c: col(r), t: `${vt(r)} 縦${num(r['縦変化量'], 0)} 横${num(r['横変化量'], 0)}` })), means: meansMv, extra: day ? rings('hb', 'ivb') : null })}<div class="note" style="margin:6px 0 0">${ringNote}${shadeNote}</div></div>`,
      'リリース点': () => `<div class="card"><h3>リリース点（${esc(label)}）<span class="u">横 × 高さ m</span></h3>${scatter({ xr: [-1.2, 1.2], yr: [1.0, 2.2], xl: 'リリース横幅 m', yl: 'リリース高さ m', xticks: 6, yticks: 6, xlabels: sideLabels(),
        pts: vis.map(r => ({ x: r['リリース横幅'], y: r['リリース高さ'], c: col(r), t: `${vt(r)} 横${num(r['リリース横幅'], 2)} 高${num(r['リリース高さ'], 2)}` })), extra: day ? rings('relS', 'relH') : null })}${ringNote ? `<div class="note" style="margin:6px 0 0">${ringNote}</div>` : ''}</div>`,
      'コース': () => `<div class="card"><h3>コース（${esc(label)}）<span class="u">捕手から見て。枠がゾーン</span></h3>${zoneChart(vis.map(r => ({ x: r['コース横'], y: r['コース高さ'], c: col(r), t: vt(r) })), zone(), { xlabels: sideLabels() })}</div>`,
      'リリースをそろえたシミュレーション': () => simCard(vis, vtypes)
    };
    const charts = `<div class="grid2">${P_CHARTS.filter(k => on('p:chart:' + k)).map(k => CH[k]()).join('')}</div>`;
    return chips + (rows.length ? (on('p:kpi') ? kpis : '') + typeChips(types, rows) + (on('p:table') ? table : '') + charts : '<div class="empty">この日の記録がありません</div>');
  }

  /* ③ チーム内での比較：同じ投げ手（右/左）の現役投手の中での順位・位置 */
  /* 順位の向き。縦変化・入射角は球種で向きが変わる。横変化は曲がりの大きさ（絶対値）。向きが決まらない球種は順位なし */
  const RK_IVB = { Fastball: 1, Cutter: 1, Sinker: -1, TwoSeamFastBall: -1, Curveball: -1, Splitter: -1, ChangeUp: -1 };
  const RK_HB = { Slider: 1, Curveball: 1, Sinker: 1, TwoSeamFastBall: 1, ChangeUp: 1 };
  const RK_VAA = { Fastball: 1, Curveball: -1, Splitter: -1, ChangeUp: -1 };
  const rankVal = (t, k, v) => { if (!isNum(v)) return null;
    if (k === 'ivb') return RK_IVB[t] ? RK_IVB[t] * v : null;
    if (k === 'hb') return RK_HB[t] ? Math.abs(v) : null;
    if (k === 'vaa') return RK_VAA[t] ? RK_VAA[t] * v : null;
    return v; };
  const RK_NOTE = '順位は「大きいほど上」（球速・直球との差・回転数・エクステ）。縦変化は 直球・カット＝大きいほど上、カーブ・スプリット・チェンジ・シンカー・ツーシーム＝小さい（よく落ちる）ほど上。横変化は 曲がりの大きさ で比べます（スライダー・カーブ・チェンジ・シンカー・ツーシーム）。入射角は 直球＝浅い（0に近い）ほど上、カーブ・スプリット・チェンジ＝深いほど上。向きが決まらない組み合わせは順位を付けません。入射角はコースの高さでも変わるので目安です。';
  const T_M = [['球速', 'velo', 'km/h', 1], ['直球との差', 'gap', '%', 1], ['回転数', 'spin', 'rpm', 0], ['縦変化', 'ivb', 'cm', 0], ['横変化', 'hb', 'cm', 0], ['エクステ', 'ext', 'm', 2], ['入射角 縦', 'vaa', '°', 1]];
  function teamView(all, hand) {
    const mine = playerTypeStats(all), fk = fbKeyOf(all);
    const types = typesIn(all).filter(t => mine[t]);
    const head = `<div class="info noprint">比べる相手：<b>同じ${esc(hand)}投の現役投手</b>（引退・卒業・退部は入りません）。1人${K_MIN}球以上投げた球種だけで集計。期間・種別・Warmupは上の絞り込みのままです。${SELF ? '' : 'スタッフ用の「チーム」「比較」タブ（全員の一覧・並べて比較）は今までどおりです。'}</div>`;
    if (!types.length) return head + `<div class="empty">この期間に${K_MIN}球以上投げた球種がありません</div>`;
    const R = {}; types.forEach(t => { R[t] = teamRefFor(t, hand); });
    if (SELF && TEAMREF.key !== refKey() || (SELF && TEAMREF.busy)) return head + '<div class="empty">チーム平均を読み込んでいます…</div>';
    if (SELF && !TEAMREF.data) return head + `<div class="empty">${TEAMREF.err && /unknown|権限/.test(TEAMREF.err) ? 'チーム平均は、サーバー（Apps Script）の更新後に表示されます。' : 'チーム平均を取得できませんでした。'}</div>`;
    const rankOf = (t, k) => { const ref = R[t], me = mine[t]; if (!ref || !me) return null;
      if (SELF) return ref.rank && ref.rank[k] || null;
      const mv = rankVal(t, k, me[k]); if (mv == null) return null;
      const others = (ref.list || []).filter(x => String(x.pid) !== String(F.player)).map(x => rankVal(t, k, x[k])).filter(isNum);
      if (!others.length) return null;
      return [others.filter(v => v > mv + 1e-9).length + 1, others.length + 1]; };
    const chip = rk => { if (!rk) return ''; const [r, n] = rk; const cls = n >= 3 && r <= 2 ? ' hi' : n >= 4 && r >= n - 1 ? ' lo' : ''; return `<span class="rk${cls}">${r}位</span>`; };
    const cellT = (t, m) => { const me = mine[t], ref = R[t], k = m[1];
      if (k === 'gap' && !isNum(me.gap)) return '<td class="n muted">—</td>';
      const unit = m[2] === '°' ? '°' : m[2] === '%' ? '%' : '';
      return `<td class="n"><b>${num(me[k], m[3])}${unit}</b>${chip(rankOf(t, k))}<span class="dl" style="font-weight:400">平均 ${ref ? num(ref.avg[k], m[3]) + unit : '—'}</span></td>`; };
    const nOf = t => R[t] ? R[t].n + ((SELF || (R[t].list || []).some(x => String(x.pid) === String(F.player))) ? 0 : 1) : 1;
    const table = `<div class="card"><h3>球種ごとの順位（チームの${esc(hand)}投・現役）<span class="u">数字＝本人の平均　小さい字＝チーム平均</span></h3><div class="tw"><table>
      <tr><th>球種</th>${T_M.map(m => `<th class="n">${esc(m[0])}</th>`).join('')}</tr>
      ${types.map(t => `<tr><td><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))}<span class="dl" style="font-weight:400;font-family:var(--jp)">${nOf(t)}人中</span></td>${T_M.map(m => cellT(t, m)).join('')}</tr>`).join('')}
      </table></div><div class="note" style="margin:6px 0 0">${RK_NOTE}${SELF ? '　ほかの選手の名前や値は出さず、平均と順位だけを表示しています。' : ''}</div></div>`;
    // 球種を選んで詳しく（帯グラフ）
    if (!F.kType || types.indexOf(F.kType) < 0) F.kType = types.indexOf(fk) >= 0 ? fk : types[0];
    const t = F.kType, c = typeColor(t), ref = R[t], me = mine[t];
    const tchips = `<div class="chips noprint" style="margin-bottom:8px">${types.map(x => `<button class="chip" data-kt="${esc(x)}" aria-pressed="${x === t}"><span class="sw" style="background:${typeColor(x)}"></span>${esc(jtype(x))}</button>`).join('')}</div>`;
    const strip = m => { const k = m[1]; if (!isNum(me[k])) return '';
      const others = SELF ? [] : (ref && ref.list || []).filter(x => String(x.pid) !== String(F.player)).map(x => x[k]).filter(isNum);
      const av = ref ? ref.avg[k] : null;
      const vs = others.concat([me[k]], isNum(av) ? [av] : []);
      let lo = Math.min(...vs), hi = Math.max(...vs); const pd = (hi - lo) * .15 || Math.max(Math.abs(hi) * .05, 1); lo -= pd; hi += pd;
      const w = 260, X = v => 12 + (v - lo) / (hi - lo) * (w - 24), unit = m[2] === '°' ? '°' : '';
      let s = `<svg class="ch" viewBox="0 0 ${w} 70" style="max-width:${w}px"><line x1="12" x2="${w - 12}" y1="34" y2="34" stroke="var(--line)" stroke-width="2"/>`;
      others.forEach(v => { s += `<circle cx="${X(v).toFixed(1)}" cy="34" r="5" fill="var(--muted)" opacity=".45"/>`; });
      if (isNum(av)) s += `<path d="M${X(av).toFixed(1)},24 l6,10 l-6,10 l-6,-10 z" fill="var(--paper)" stroke="var(--ink2)" stroke-width="1.4"/><text x="${X(av).toFixed(1)}" y="16" text-anchor="middle">平均 ${num(av, m[3])}${unit}</text>`;
      s += `<circle cx="${X(me[k]).toFixed(1)}" cy="34" r="7" fill="${c}" stroke="var(--paper)" stroke-width="2"/><text x="${X(me[k]).toFixed(1)}" y="60" text-anchor="middle" class="lab">${SELF ? '自分' : '本人'} ${num(me[k], m[3])}${unit}</text>`;
      return `<div class="strip"><b>${esc(m[0])}${m[2] && m[2] !== '°' ? ' ' + esc(m[2]) : ''}${(() => { const rk = rankOf(t, k); return rk ? `　${rk[0]}位/${rk[1]}人` : ''; })()}</b>${s}</svg></div>`; };
    const strips = `<div class="card"><h3>球種を選んで詳しく<span class="u">${SELF ? '◇＝チーム平均' : '灰色＝ほかの投手　◇＝平均'}</span></h3>${tchips}<div class="grid3">${T_M.map(strip).join('')}</div></div>`;
    // 変化量マップ
    const extra = (X, Y) => { let s = '';
      types.forEach(tt => { const rf = R[tt], cc = typeColor(tt);
        if (!SELF && rf && rf.list) rf.list.filter(x => String(x.pid) !== String(F.player)).forEach(x => { if (isNum(x.hb) && isNum(x.ivb)) s += `<circle cx="${X(x.hb).toFixed(1)}" cy="${Y(x.ivb).toFixed(1)}" r="5" fill="${cc}" opacity=".22"/>`; });
        if (rf && isNum(rf.avg.hb) && isNum(rf.avg.ivb)) s += `<path d="M${X(rf.avg.hb).toFixed(1)},${(Y(rf.avg.ivb) - 6).toFixed(1)} l6,6 l-6,6 l-6,-6 z" fill="var(--paper)" stroke="${cc}" stroke-width="1.6"><title>${esc(jtype(tt))} チーム平均</title></path>`;
        const m = mine[tt]; if (isNum(m.hb) && isNum(m.ivb)) s += `<circle cx="${X(m.hb).toFixed(1)}" cy="${Y(m.ivb).toFixed(1)}" r="7.5" fill="${cc}" stroke="var(--ink)" stroke-width="1.5"><title>${esc(jtype(tt))} 本人 縦${num(m.ivb, 0)} 横${num(m.hb, 0)}</title></circle>`; });
      return s; };
    const mv = `<div class="card"><h3>変化量マップ（チームの${esc(hand)}投）<span class="u">${SELF ? '濃い点＝自分　◇＝平均' : '濃い点＝本人　薄い点＝ほかの投手　◇＝平均'}</span></h3>${scatter({ xr: [-70, 70], yr: [-70, 70], xl: '横変化量 cm', yl: '縦変化量 cm', xticks: 7, yticks: 7, pts: [], extra, xlabels: sideLabels() })}</div>`;
    // 自動まとめ
    const good = [], grow = [];
    types.forEach(tt => T_M.forEach(m => { const rk = rankOf(tt, m[1]); if (!rk || rk[1] < 3) return; const v = mine[tt][m[1]], av = R[tt] && R[tt].avg[m[1]];
      const u = m[2] === '°' ? '°' : m[2] === '%' ? '%' : m[2];
      const txt = `${jtype(tt)}の${m[0]}（${num(v, m[3])}${u}、平均 ${num(av, m[3])}${u}）`;
      if (rk[0] === 1) good.push({ o: 0, s: `${txt}がチーム1位` }); else if (rk[0] === 2) good.push({ o: 1, s: `${txt}がチーム2位` });
      if (rk[1] >= 4 && rk[0] === rk[1]) grow.push(`${txt}が${rk[1]}人中${rk[0]}位`); }));
    types.forEach(tt => { if (ZONE_T[tt] && isNum(mine[tt].gap) && mine[tt].gap >= ZONE_LO) good.push({ o: 0.5, s: `${jtype(tt)}の直球との差が ${mine[tt].gap.toFixed(1)}% で空振りゾーン（${ZONE_LO}%以上）` }); });
    good.sort((a, b) => a.o - b.o);
    let similar = '';
    if (!SELF) {   // 変化量がいちばん近い投手（同じ球種どうしの平均の距離）
      const cand = {}; types.forEach(tt => { const rf = R[tt]; if (!rf || !rf.list) return; const m = mine[tt]; if (!isNum(m.hb) || !isNum(m.ivb)) return;
        rf.list.forEach(x => { if (String(x.pid) === String(F.player) || !isNum(x.hb) || !isNum(x.ivb)) return; const o = cand[x.pid] = cand[x.pid] || { d: 0, n: 0 }; o.d += Math.hypot(x.hb - m.hb, x.ivb - m.ivb); o.n++; }); });
      const best = Object.keys(cand).filter(p => cand[p].n >= Math.min(2, types.length)).sort((a, b) => cand[a].d / cand[a].n - cand[b].d / cand[b].n)[0];
      if (best) similar = `<div class="info"><b>似たタイプ</b>　変化量がいちばん近いのは <a href="#" data-goto="${esc(best)}">${esc(pname(best))}</a>（同じ球種どうしで平均 ${(cand[best].d / cand[best].n).toFixed(0)}cm 差・${cand[best].n}球種）。</div>`;
    }
    const sum = `<div class="card"><h3>チーム内での特徴<span class="u">順位から自動でまとめています</span></h3>
      ${good.slice(0, 4).map(g => `<div class="ok"><b>強み</b>　${esc(g.s)}。</div>`).join('')}
      ${grow.slice(0, 3).map(g => `<div class="warn"><b>伸びしろ</b>　${esc(g)}。</div>`).join('')}
      ${similar}${!good.length && !grow.length && !similar ? '<div class="note">比べられる投手が少ないため、まとめは出していません（3人以上で表示）。</div>' : ''}</div>`;
    return head + table + strips + `<div class="grid2">${mv}${sum}</div>`;
  }

  function viewPlayer() {
    if (!F.player) return '<div class="empty">投手が登録されていません。スプレッドシートの「選手マスタ」で投手の列に 1 を入れてください。</div>';
    const all = filt(ROWS, { pid: F.player }), hand = phand(F.player);
    const PV = [['day', '① その日の投球', '1日分の全体像', '① その日'], ['trend', '② 球種ごとの変遷', '日ごとの移り変わり', '② 変遷'], ['team', '③ チーム内での比較', `同じ${hand}投の中で`, '③ チーム比較']];
    if (!PV.some(x => x[0] === F.pview)) F.pview = 'day';
    const seg = `<div class="seg3 noprint">${PV.map(([k, n, sub, sh]) => `<button data-pv="${k}" aria-pressed="${F.pview === k}"><span class="ln">${n}</span><span class="sh">${sh}</span><small>${esc(sub)}</small></button>`).join('')}</div>`;
    const pvName = PV.find(x => x[0] === F.pview)[1];
    const head = `<div class="note" id="print-head"><b style="font-size:14px">${esc(pname(F.player))}</b>　${esc(hand)}投　${esc(pvName)}　${F.from || ''}〜${F.to || '現在'}　${F.kind || '対戦・ブルペン'}　<span class="muted">作成 ${today()}　取扱注意</span></div>`;
    const body = !all.length ? '<div class="empty">この期間の記録がありません</div>'
      : F.pview === 'trend' ? karteCard(all, hand) : F.pview === 'team' ? teamView(all, hand) : dayView(all, hand);
    return filterBar() + retPanel() + (F.pview === 'day' ? showPanel('player') : '') + seg + head + body;
  }

  /* ================= 画面：チーム ================= */
  function viewTeam() {
    const base = filt(ROWS, { hand: F.hand });
    const types = typesIn(base);
    if (types.length && types.indexOf(F.teamType) < 0) F.teamType = types[0];
    const rows = PITCHERS.map(p => { const rs = base.filter(r => String(r['投手ID']) === String(p['選手ID']) && String(r['球種']) === F.teamType);
      return { pid: String(p['選手ID']), name: String(p['氏名']), hand: phand(p['選手ID']), s: stats(rs) }; }).filter(x => x.s.n > 0);
    const key = METRICS.find(m => m[0] === F.sortKey) || METRICS[0];
    rows.sort((a, b) => ((b.s[key[1]] == null ? -1e9 : b.s[key[1]]) - (a.s[key[1]] == null ? -1e9 : a.s[key[1]])) * F.sortDir);
    const bar = `<div class="bar noprint">
      <label class="f">期間 から<input type="date" id="tm-from" value="${F.from}"></label>
      <label class="f">まで<input type="date" id="tm-to" value="${F.to}"></label>
      <label class="f">種別<select id="tm-kindf"><option value="">対戦もブルペンも</option><option value="対戦" ${F.kind === '対戦' ? 'selected' : ''}>対戦だけ</option><option value="ブルペン" ${F.kind === 'ブルペン' ? 'selected' : ''}>ブルペンだけ</option></select></label>
      <label class="f">投げ手<select id="tm-hand"><option value="">右も左も</option><option value="右" ${F.hand === '右' ? 'selected' : ''}>右投げ</option><option value="左" ${F.hand === '左' ? 'selected' : ''}>左投げ</option></select></label>
      <label class="f">球種<select id="tm-ttype">${types.map(t => `<option value="${esc(t)}" ${t === F.teamType ? 'selected' : ''}>${esc(jtype(t))}</option>`).join('')}</select></label>
      <label class="c" style="padding-bottom:7px"><input type="checkbox" id="tm-warm" ${F.warm ? 'checked' : ''}> Warmupも含める</label>
      <div style="margin-left:auto; display:flex; gap:6px">${showBtn()}<button class="b" id="tm-print">PDFで保存</button></div></div>` + showPanel('team');
    if (!rows.length) return bar + '<div class="empty">この条件の記録がありません</div>';
    const tc = colsOf('t:col:');
    const th = m => `<th class="n s" data-sort="${esc(m[0])}">${esc(m[0])}${F.sortKey === m[0] ? (F.sortDir < 0 ? ' ▼' : ' ▲') : ''}</th>`;
    const table = `<div class="card"><h3>${esc(jtype(F.teamType))}の比較<span class="u">見出しを押すと並べ替え。括弧内は有効球数</span></h3><div class="tw"><table>
      <tr><th>投手</th><th class="n">球数</th>${tc.map(th).join('')}</tr>
      ${rows.map(x => `<tr class="${x.pid === F.player ? 'me' : ''}"><td><span class="sw" style="background:${HAND_COLOR[x.hand] || 'var(--t0)'}"></span><a href="#" data-goto="${esc(x.pid)}" style="color:inherit">${esc(x.name)}</a> <span class="muted">${esc(x.hand)}</span></td><td class="n">${x.s.n}</td>
        ${tc.map(m => cell(x.s, m)).join('')}</tr>`).join('')}
      </table></div><div class="note">平均が0球の項目は「—」。回転数は取りこぼしの疑いがある球を除いた平均。Bauer＝回転数÷球速(mph)。</div></div>`;
    const mx = METRICS.find(m => m[0] === F.tx) || METRICS[5], my = METRICS.find(m => m[0] === F.ty) || METRICS[4];
    const xs = rows.map(r => r.s[mx[1]]).filter(isNum), ys = rows.map(r => r.s[my[1]]).filter(isNum);
    const rng = (a, sym) => { if (!a.length) return [-1, 1]; let lo = Math.min(...a), hi = Math.max(...a); if (sym) { const m = Math.max(Math.abs(lo), Math.abs(hi), 5); return [-m * 1.15, m * 1.15]; } const p = Math.max((hi - lo) * .15, 0.5); return [lo - p, hi + p]; };
    const sym = k => /変化量|横幅|角横|入射角横/.test(k);
    const sc = scatter({ xr: rng(xs, sym(mx[0])), yr: rng(ys, sym(my[0])), xl: mx[0], yl: my[0], w: 520, h: 380,
      pts: rows.map(r => ({ x: r.s[mx[1]], y: r.s[my[1]], c: HAND_COLOR[r.hand] || 'var(--t0)', r: 5, label: r.name, t: `${r.name} ${mx[0]} ${num(r.s[mx[1]], mx[2])} / ${my[0]} ${num(r.s[my[1]], my[2])}` })) });
    const sel = (id, cur) => `<select id="${id}">${METRICS.filter(m => m[1] !== 'locsd').map(m => `<option ${m[0] === cur ? 'selected' : ''}>${esc(m[0])}</option>`).join('')}</select>`;
    const chart = `<div class="card"><h3>散布図<span class="u"><span class="sw" style="background:${HAND_COLOR['右']}"></span>右投げ <span class="sw" style="background:${HAND_COLOR['左']}"></span>左投げ</span></h3>
      <div class="noprint" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px"><label class="f">横軸${sel('tm-tx', mx[0])}</label><label class="f">縦軸${sel('tm-ty', my[0])}</label></div><div style="max-width:640px">${sc}</div></div>`;
    const allT = `<div class="card"><h3>球種ごとの球速と回転数<span class="u">全投手</span></h3><div class="tw"><table><tr><th>球種</th><th class="n">球数</th><th class="n">投手数</th><th class="n">球速</th><th class="n">最速</th><th class="n">回転数</th><th class="n">縦変化量</th><th class="n">横変化量</th><th class="n">ゾーン率</th></tr>
      ${types.map(t => { const rs = base.filter(r => String(r['球種']) === t); const s = stats(rs); return `<tr><td><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))}</td><td class="n">${s.n}</td><td class="n">${new Set(rs.map(r => r['投手ID'])).size}</td><td class="n">${num(s.velo, 1)}</td><td class="n">${num(s.vmax, 1)}</td><td class="n">${num(s.spin, 0)}</td><td class="n">${num(s.ivb, 1)}</td><td class="n">${num(s.hb, 1)}</td><td class="n">${num(s.zone, 0)}</td></tr>`; }).join('')}</table></div></div>`;
    return bar + `<div class="note" id="print-head"><b style="font-size:14px">チーム</b>　${F.from || ''}〜${F.to || '現在'}　${F.kind || '対戦・ブルペン'}　<span class="muted">作成 ${today()}　取扱注意</span></div>` + table + (on('t:scatter') ? chart : '') + (on('t:alltypes') ? allT : '');
  }

  /* ================= 画面：比較 ================= */
  const CMP_COLORS = ['var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t7)', 'var(--t8)', 'var(--t5)'];
  function viewCompare() {
    const picked = PITCHERS.filter(p => F.cmp[String(p['選手ID'])]).slice(0, 6);
    const base = filt(ROWS).filter(r => (!F.cmpMin || r['球速'] >= Number(F.cmpMin)) && (!F.cmpMax || r['球速'] <= Number(F.cmpMax)));
    const types = typesIn(base);
    const bar = `<div class="bar noprint">
      <label class="f">期間 から<input type="date" id="tm-from" value="${F.from}"></label>
      <label class="f">まで<input type="date" id="tm-to" value="${F.to}"></label>
      <label class="f">種別<select id="tm-kindf"><option value="">対戦もブルペンも</option><option value="対戦" ${F.kind === '対戦' ? 'selected' : ''}>対戦だけ</option><option value="ブルペン" ${F.kind === 'ブルペン' ? 'selected' : ''}>ブルペンだけ</option></select></label>
      <label class="f">球速 km/h<span><input type="number" id="tm-cmin" value="${F.cmpMin}" placeholder="以上"> 〜 <input type="number" id="tm-cmax" value="${F.cmpMax}" placeholder="以下"></span></label>
      <label class="c" style="padding-bottom:7px"><input type="checkbox" id="tm-warm" ${F.warm ? 'checked' : ''}> Warmupも含める</label>
      <div style="margin-left:auto; display:flex; gap:6px">${showBtn()}<button class="b" id="tm-print">PDFで保存</button></div></div>` + showPanel('compare') + `
      <div class="card noprint"><h3>比べる投手<span class="u">6人まで</span></h3><div class="chips">${PITCHERS.map(p => `<button class="chip" data-cmp="${esc(p['選手ID'])}" aria-pressed="${!!F.cmp[String(p['選手ID'])]}">${esc(p['氏名'])} <span class="muted">${esc(phand(p['選手ID']))}</span></button>`).join('')}</div>
      <div class="chips" style="margin-top:8px">${types.map(t => `<button class="chip" data-tt="${esc(t)}" aria-pressed="${!F.hideTypes[t]}"><span class="sw" style="background:${typeColor(t)}"></span>${esc(jtype(t))}</button>`).join('')}</div></div>`;
    if (picked.length < 1) return bar + '<div class="empty">上で投手を選んでください</div>';
    const sets = picked.map((p, i) => ({ pid: String(p['選手ID']), name: String(p['氏名']), hand: phand(p['選手ID']), c: CMP_COLORS[i % CMP_COLORS.length],
      rows: base.filter(r => String(r['投手ID']) === String(p['選手ID']) && !F.hideTypes[String(r['球種'])]) }));
    const legend = `<div class="legend">${sets.map(s => `<span><span class="sw" style="background:${s.c}"></span>${esc(s.name)} <span class="cnt">${s.rows.length}球</span></span>`).join('')}</div>`;
    sets.forEach(s => { s.ref = veloRef(base.filter(r => String(r['投手ID']) === s.pid)); });
    const scol = (s, r) => shade(s.c, s.ref ? Number(r['球速']) / s.ref : null);
    const meansC = sets.flatMap(s => typesIn(s.rows).map(t => { const rs = s.rows.filter(r => String(r['球種']) === t); const x = mean(nums(rs, '横変化量')), y = mean(nums(rs, '縦変化量'));
      return { x, y, c: s.c, t: `${s.name} ${jtype(t)} 平均 縦${num(y, 0)} 横${num(x, 0)}` }; }));
    const mv = scatter({ xr: [-70, 70], yr: [-70, 70], xl: '横変化量 cm', yl: '縦変化量 cm', xticks: 7, yticks: 7, w: 380, h: 340, xlabels: sideLabels(), means: meansC,
      pts: sets.flatMap(s => s.rows.map(r => ({ x: r['横変化量'], y: r['縦変化量'], c: scol(s, r), hollow: isEst(r, '縦変化量'), t: `${s.name} ${jtype(r['球種'])} ${num(r['球速'], 1)}km/h` }))) });
    const rel = scatter({ xr: [-1.2, 1.2], yr: [1.0, 2.2], xl: 'リリース横幅 m', yl: 'リリース高さ m', xticks: 6, yticks: 6, xlabels: sideLabels(),
      pts: sets.flatMap(s => s.rows.map(r => ({ x: r['リリース横幅'], y: r['リリース高さ'], c: scol(s, r), hollow: isEst(r, 'リリース高さ'), t: `${s.name} ${jtype(r['球種'])} ${num(r['球速'], 1)}km/h` }))) });
    const loc = zoneChart(sets.flatMap(s => s.rows.map(r => ({ x: r['コース横'], y: r['コース高さ'], c: scol(s, r), hollow: isEst(r, 'コース高さ'), t: `${s.name} ${jtype(r['球種'])} ${num(r['球速'], 1)}km/h` }))), zone(), { xlabels: sideLabels() });
    const ext = scatter({ xr: [1.2, 2.4], yr: [1.0, 2.2], xl: 'エクステンション m', yl: 'リリース高さ m', xticks: 6, yticks: 6, zero: false,
      pts: sets.flatMap(s => s.rows.map(r => ({ x: r['エクステンション'], y: r['リリース高さ'], c: scol(s, r), hollow: isEst(r, 'エクステンション') || isEst(r, 'リリース高さ'), t: `${s.name} ${jtype(r['球種'])} ${num(r['球速'], 1)}km/h` }))) });
    const velo = rangeChart(sets.map(s => ({ name: s.name, c: s.c, vals: nums(s.rows, '球速') })), { dec: 1 });
    const spin = rangeChart(sets.map(s => ({ name: s.name, c: s.c, vals: nums(spinOK(s.rows), '回転数') })), { dec: 0 });
    const table = `<div class="card"><h3>数字で比べる<span class="u">選んだ球種をまとめた平均</span></h3><div class="tw"><table>
      <tr><th>投手</th><th class="n">球数</th>${colsOf('c:col:').map(m => `<th class="n">${esc(m[0])}</th>`).join('')}</tr>
      ${sets.map(s => { const x = stats(s.rows); return `<tr><td><span class="sw" style="background:${s.c}"></span>${esc(s.name)} <span class="muted">${esc(s.hand)}</span></td><td class="n">${x.n}</td>${colsOf('c:col:').map(m => cell(x, m)).join('')}</tr>`; }).join('')}
      </table></div></div>`;
    return bar + `<div class="note" id="print-head"><b style="font-size:14px">比較</b>　${sets.map(s => esc(s.name)).join('・')}　${F.from || ''}〜${F.to || '現在'}　<span class="muted">作成 ${today()}　取扱注意</span></div>` + legend + table
      + `<div class="grid2">${on('c:chart:変化量') ? `<div class="card"><h3>変化量<span class="u">大きい点は投手×球種の平均</span></h3>${mv}<div class="note" style="margin:6px 0 0">色の濃さ＝球速（各投手のストレート平均を100%として）。計測できなかった球は出していません</div></div>` : ''}${on('c:chart:リリース点') ? `<div class="card"><h3>リリース点</h3>${rel}</div>` : ''}${on('c:chart:リリース高さ×エクステンション') ? `<div class="card"><h3>リリース高さ × エクステンション</h3>${ext}</div>` : ''}${on('c:chart:球速') ? `<div class="card"><h3>球速</h3>${velo}</div>` : ''}${on('c:chart:回転数') ? `<div class="card"><h3>回転数<span class="u">疑いのある球は除く</span></h3>${spin}</div>` : ''}${on('c:chart:コース') ? `<div class="card"><h3>コース</h3>${loc}</div>` : ''}</div>`;
  }

  /* ================= 描画 ================= */
  function render() {
    const sy = window.scrollY;
    if (SELF) view = 'player';
    const tabs = SELF ? [] : [['player', '個人'], ['team', 'チーム'], ['compare', '比較'], ['in', '取り込み']];
    const body = !loaded
      ? (busy ? '<div class="empty">読み込んでいます…</div>'
              : `<div class="empty">${esc(msg || 'まだ読み込んでいません')}<br><br><button class="b" id="tm-reload">読み込む</button></div>`)
      : (view === 'in' ? viewImport() : view === 'team' ? viewTeam() : view === 'compare' ? viewCompare() : viewPlayer());
    ROOT.innerHTML = `<div class="pw">
      <div class="hd"><h2>Trackman</h2><span class="sub">${SELF ? `${ROWS.length}球` : `投手 ${PITCHERS.length}人・${ROWS.length}球`}</span>
        <div class="sp">${tabs.length ? `<div class="seg">${tabs.map(([k, n]) => `<button data-v="${k}" aria-pressed="${view === k}">${n}</button>`).join('')}</div>` : ''}
          <button class="b" id="tm-refresh" ${busy ? 'disabled' : ''}>${busy ? '更新中…' : '更新'}</button></div></div>
      ${msg && loaded ? `<div class="note" style="color:var(--clay)">${esc(msg)}</div>` : ''}
      ${body}</div>`;
    if (sy) window.scrollTo(0, sy);
  }

  /* ================= 操作 ================= */
  ROOT.addEventListener('click', async e => {
    const v = e.target.closest('[data-v]'); if (v) { if (!SELF) view = v.dataset.v; render(); return; }
    const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); F.player = g.dataset.goto; view = 'player'; render(); return; }
    const kt = e.target.closest('[data-kt]'); if (kt) { F.kType = kt.dataset.kt; render(); return; }
    const pv = e.target.closest('[data-pv]'); if (pv) { F.pview = pv.dataset.pv; render(); return; }
    const dy = e.target.closest('[data-day]'); if (dy) { F.day = dy.dataset.day; render(); return; }
    if (e.target.closest('[data-dayall]')) { F.dayAll = !F.dayAll; render(); return; }
    const kr = e.target.closest('[data-kr]'); if (kr) { F.kRange = kr.dataset.kr; render(); return; }
    const rt = e.target.closest('[data-ret]'); if (rt) { const to = rt.dataset.to || ''; const p = ALLP.find(x => String(x['選手ID']) === rt.dataset.ret);
      if (p && window.confirm(`${p['氏名']} を「${to || '現役'}」にします。よろしいですか。`)) await setRetire([rt.dataset.ret], to); return; }
    const rg = e.target.closest('[data-retgrade]'); if (rg) {
      const ids = ALLP.filter(p => gradeOf(p) && gradeOf(p) >= Number(rg.dataset.retgrade) && !RET_ST[stateOf(p)]).map(p => String(p['選手ID']));
      if (!ids.length) { msg = '対象の投手がいません（入学年度が入っている現役の3年生）'; render(); return; }
      if (window.confirm(`${ids.length}人を「引退」にします。よろしいですか。`)) await setRetire(ids, '引退'); return; }
    if (e.target.id === 'tm-retbtn') { F.retPanel = !F.retPanel; if (F.retPanel && !masterFresh) load(); render(); return; }
    if (e.target.id === 'tm-retclose') { F.retPanel = false; render(); return; }
    const tt = e.target.closest('[data-tt]'); if (tt) { F.hideTypes[tt.dataset.tt] = !F.hideTypes[tt.dataset.tt]; render(); return; }
    const cp = e.target.closest('[data-cmp]'); if (cp) { F.cmp[cp.dataset.cmp] = !F.cmp[cp.dataset.cmp]; render(); return; }
    const sh = e.target.closest('[data-show]'); if (sh) { SHOW[sh.dataset.show] = !on(sh.dataset.show); saveShow(); render(); return; }
    if (e.target.id === 'tm-showbtn') { F.showPanel = !F.showPanel; render(); return; }
    if (e.target.id === 'tm-showall') { const pre = { player: 'p:', team: 't:', compare: 'c:' }[e.target.dataset.view]; Object.keys(SHOW).forEach(k => { if (k.startsWith(pre)) delete SHOW[k]; }); Object.keys(DEF_HIDE).forEach(k => { if (k.startsWith(pre)) SHOW[k] = true; }); saveShow(); render(); return; }
    const so = e.target.closest('[data-sort]'); if (so) { if (F.sortKey === so.dataset.sort) F.sortDir = -F.sortDir; else { F.sortKey = so.dataset.sort; F.sortDir = -1; } render(); return; }
    const ds = e.target.closest('[data-delsess]');
    if (ds) { const s = SESSIONS.find(x => String(x['セッションID']) === ds.dataset.delsess); if (!s) return;
      if (!window.confirm(`${pname(s['投手ID'])} ${s['測定日']} ${s['種別']} ${s['球数']}球を削除します。元に戻せません。よろしいですか。`)) return;
      busy = true; render();
      try { const j = await api('deleteTmSession', { id: ds.dataset.delsess }); if (!j.ok) throw new Error(j.error || '削除できませんでした'); msg = `削除しました（${j.pitches}球）`; busy = false; await load(); render(); setTimeout(() => { msg = ''; render(); }, 5000); }
      catch (err) { busy = false; msg = String(err.message || err); render(); } return; }
    if (e.target.id === 'tm-reload' || e.target.id === 'tm-refresh') { masterFresh = false; load(); return; }
    const pk = e.target.closest('[data-pick]'); if (pk) { const i = ROOT.querySelector(`input[data-pidfile="${pk.dataset.pick}"]`); if (i) i.click(); return; }
    const qd = e.target.closest('[data-qdel]'); if (qd) { const k = QUEUE.findIndex(q => q.id === qd.dataset.qdel); if (k >= 0) QUEUE.splice(k, 1); render(); return; }
    if (e.target.id === 'tm-clear') { for (let k = QUEUE.length - 1; k >= 0; k--) if (QUEUE[k].done) QUEUE.splice(k, 1); IMPMSG = ''; render(); return; }
    if (e.target.id === 'tm-goall') { await importAll(); return; }
    if (e.target.id === 'tm-print') { document.documentElement.classList.add('prt'); setTimeout(() => { window.print(); setTimeout(() => document.documentElement.classList.remove('prt'), 400); }, 60); return; }
  });
  ROOT.addEventListener('change', e => {
    const id = e.target.id, val = e.target.value;
    const pf = e.target.dataset && e.target.dataset.pidfile;
    if (pf && e.target.files && e.target.files.length) { const files = [...e.target.files]; e.target.value = ''; addFiles(pf, files); return; }
    const qk = e.target.dataset && e.target.dataset.qkind; if (qk) { const q = QUEUE.find(x => x.id === qk); if (q) { q.kind = val; buildQ(q); } render(); return; }
    const qf = e.target.dataset && e.target.dataset.qforce; if (qf) { const q = QUEUE.find(x => x.id === qf); if (q) q.force = e.target.checked; render(); return; }
    const ql = e.target.dataset && e.target.dataset.qflip; if (ql) { const q = QUEUE.find(x => x.id === ql); if (q) { q.flip = e.target.checked; buildQ(q); } render(); return; }
    if (id === 'tm-player') { F.player = val; render(); return; }
    if (id === 'tm-showret') { F.showRetired = e.target.checked; if (MASTER) applyMaster(MASTER); render(); return; }
    if (id === 'tm-from') { F.from = val; if (val && val < fetchedFrom) load(val); else render(); return; }
    if (id === 'tm-to') { F.to = val; render(); return; }
    if (id === 'tm-kindf') { F.kind = val; render(); return; }
    if (id === 'tm-warm') { F.warm = e.target.checked; render(); return; }
    if (id === 'tm-hand') { F.hand = val; render(); return; }
    if (id === 'tm-ttype') { F.teamType = val; render(); return; }
    if (id === 'tm-tx') { F.tx = val; render(); return; }
    if (id === 'tm-ty') { F.ty = val; render(); return; }
    if (id === 'tm-cmin') { F.cmpMin = val; render(); return; }
    if (id === 'tm-cmax') { F.cmpMax = val; render(); return; }
  });

  /* タブを開くたびに、記録タブが端末に持っている名簿（追加した選手・投げ手の変更）を取り直す */
  ROOT.addEventListener('hsp:show', () => {
    if (!loaded && !busy) { load(); return; }
    if (SELF) return;
    const lm = masterFromLocal(); if (lm) { const b = JSON.stringify(PITCHERS.map(p => [p['選手ID'], p['氏名'], p['投']])); applyMaster(lm);
      if (b !== JSON.stringify(PITCHERS.map(p => [p['選手ID'], p['氏名'], p['投']]))) render(); }
  });
  warmStart();
  if (!ROWS.length && !SELF) view = 'in';
  render();
  load();
}

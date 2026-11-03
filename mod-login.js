/* ログイン（トヨタ自動車東日本・投手陣用）
   このアプリには「記録」タブが無いので、ログイン・ログアウト・パスワード変更・
   ユーザー管理（管理者だけ）をここにまとめている。
   ・スタッフ（管理・強化）… ログインすると Trackman・フィジカル・セッション記録のタブが出る
   ・選手 … ログインすると自分の分だけが見られる
   名簿（投手の追加・左右の変更）はスプレッドシートの「選手マスタ」で直接編集する。 */

const CSS = `
#tab-me .pw{ max-width:720px; margin:0 auto; padding:18px 14px 60px }
#tab-me .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:16px 16px; margin-bottom:14px }
#tab-me h2{ margin:4px 2px 14px; font-size:18px; letter-spacing:.04em }
#tab-me h3{ margin:0 0 10px; font-size:14px; color:var(--ink2) }
#tab-me label.f{ display:flex; flex-direction:column; gap:4px; font-size:12px; color:var(--muted); margin-bottom:10px }
#tab-me input,#tab-me select{ font:inherit; font-size:16px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:9px; padding:10px 11px; width:100% }
#tab-me button.b{ appearance:none; font:inherit; font-size:15px; cursor:pointer; border:1px solid var(--line); background:var(--paper);
  color:var(--ink); border-radius:9px; padding:10px 16px }
#tab-me button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700; width:100% }
#tab-me button.b.mini{ font-size:12.5px; padding:5px 9px; border-radius:7px }
#tab-me button.b[disabled]{ opacity:.5 }
#tab-me .msg{ font-size:13px; color:var(--clay); margin:8px 0 0; min-height:1.2em }
#tab-me .ok{ color:var(--hit,#1e8a4c) }
#tab-me .note{ font-size:12px; color:var(--muted); line-height:1.7 }
#tab-me .who{ font-size:20px; font-weight:800 }
#tab-me .role{ display:inline-block; font-size:11px; font-weight:700; color:var(--accentInk); background:var(--accent); border-radius:999px; padding:2px 9px; margin-left:8px; vertical-align:middle }
#tab-me .links{ display:flex; flex-wrap:wrap; gap:8px; margin-top:12px }
#tab-me .warn{ font-size:12.5px; color:var(--clay); background:color-mix(in srgb, var(--clay) 9%, transparent); border-radius:8px; padding:8px 10px; margin:8px 0 0 }
#tab-me table{ width:100%; border-collapse:collapse; font-size:13px }
#tab-me th,#tab-me td{ text-align:left; padding:6px 6px; border-bottom:1px solid var(--line); vertical-align:top }
#tab-me th{ font-size:11px; color:var(--muted); font-weight:700 }
#tab-me td select{ font-size:13px; padding:4px 6px; width:auto }
#tab-me .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px }
#tab-me .grid label.f{ margin-bottom:0 }
#tab-me .tw{ overflow:auto }
#tab-me .plink{ font-family:ui-monospace,Menlo,monospace; font-size:12px; user-select:all; word-break:break-all }
`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-login'; st.textContent = CSS; document.head.appendChild(st);
  const CFG = CORE.cfg;
  const CONN_KEY = 'hsp-conn-' + CFG.TEAM_ID + CFG.STORE;
  const PLINK_KEY = 'hsp-plink-' + CFG.TEAM_ID + CFG.STORE;
  const conn = () => { try { return JSON.parse(localStorage.getItem(CONN_KEY) || 'null') || {}; } catch (e) { return {}; } };
  const saveConn = c => { try { localStorage.setItem(CONN_KEY, JSON.stringify(c)); } catch (e) {} };
  const appUrl = () => { let u = ''; if (CFG.APP_URL_B64) { try { u = atob(String(CFG.APP_URL_B64).trim()); } catch (e) {} }
    return conn().url || (/^https?:\/\/.+/.test(u) ? u : ''); };
  async function post(payload) {
    const url = appUrl(); if (!url) throw new Error('接続先が設定されていません。管理者に確認してください');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    return res.json();
  }
  const api = (action, payload) => post(Object.assign({ action, token: conn().token }, payload || {}));
  const roleOf = c => String(c.user && c.user.role || '');
  const isAdmin = c => roleOf(c).indexOf('管理') === 0;
  const isPlayer = c => roleOf(c).indexOf('選手') === 0;
  let busy = false, msg = '', okMsg = '', bind = '', admin = null, pwMsg = '';

  /* 接続先ファイルのチームIDと、このアプリのチームIDが一致するか確かめる。
     空なら（初回）管理者のログイン時に書き込んで固定する。違えば警告。 */
  async function checkTeam(c) {
    try {
      const j = await post({ action: 'ping' }); if (!j || !j.ok) return;
      const t = String(j.team || '');
      if (!t) { if (isAdmin(c)) { const r = await api('setTeamId', { team: CFG.TEAM_ID }); if (r && r.ok) bind = ''; } return; }
      bind = t === CFG.TEAM_ID ? '' : `接続先が違います。このアプリは「${CFG.TEAM_NAME || CFG.TEAM_ID}」用ですが、つながっている先は別のチーム（${t}）のファイルです。管理者に連絡してください。`;
    } catch (e) {}
  }
  async function loadAdmin() {
    const j = await api('listUsers'); if (!j.ok) throw new Error(j.error || 'ユーザー一覧を取れませんでした');
    admin = { users: j.users || [], players: j.players || [], playerLogin: !!j.playerLogin };
  }

  function loginView() {
    return `<div class="pw"><h2>ログイン</h2><div class="card"><h3>${esc(CFG.TEAM_NAME || '')}</h3>
      <label class="f">ID<input id="me-id" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
      <label class="f">パスワード<input id="me-pw" type="password" autocomplete="current-password"></label>
      <button class="b primary" id="me-login" ${busy ? 'disabled' : ''}>${busy ? 'ログイン中…' : 'ログイン'}</button>
      <div class="msg">${esc(msg)}</div>
      <p class="note" style="margin-top:12px">スタッフは Trackman・フィジカル・セッション記録が、選手は自分の分だけが見られます。<br>IDとパスワードは管理者から受け取ってください。</p></div></div>`;
  }
  function popts(sel) { return `<option value="">（どの選手か選ぶ）</option>` + (admin ? admin.players : []).map(p => `<option value="${esc(p.id)}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}${p.isP ? '（投手）' : ''}</option>`).join(''); }
  function adminView() {
    if (!admin) return `<div class="card"><h3>ユーザー管理</h3><div class="note">${msg ? '読み込めませんでした：' + esc(msg) : '読み込んでいます…'}</div></div>`;
    const rows = admin.users.map(u => `<tr><td>${esc(u.id)}</td><td>${esc(u.name)}</td>
      <td><select data-urole="${esc(u.id)}">${['記録・閲覧', '強化', '管理', '選手'].map(r => `<option ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
        ${u.role === '選手' ? `<select data-upid="${esc(u.id)}" style="display:block;margin-top:4px">${popts(u.pid || '')}</select>` : ''}</td>
      <td><input type="checkbox" data-uen="${esc(u.id)}" ${u.enabled ? 'checked' : ''} ${u.id === 'admin' ? 'disabled' : ''} style="width:auto"></td>
      <td style="font-size:12px">${esc(u.last || '—')}</td>
      <td><button class="b mini" data-upw="${esc(u.id)}">パスワード再設定</button></td></tr>`).join('');
    return `<div class="card"><h3>ユーザー管理<span class="note" style="margin-left:8px">管理者だけ</span></h3>
      <label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="ad-plogin" ${admin.playerLogin ? 'checked' : ''} style="width:auto"> 選手のログインを許可する</label>
      <p class="note" style="margin:4px 0 10px">選手用のリンク：<span class="plink">${esc(location.href.split('#')[0] + '#me')}</span></p>
      <div class="tw"><table><thead><tr><th>ID</th><th>表示名</th><th>権限</th><th>有効</th><th>最終ログイン</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <h3 style="margin-top:16px">ユーザーを追加</h3>
      <p class="note" style="margin:0 0 8px"><b>強化</b>＝Trackman・フィジカル・セッション記録を見て入力できる／<b>管理</b>＝それに加えてユーザー管理／<b>選手</b>＝選んだ選手本人の分だけ見る（入力はできない）</p>
      <div class="grid">
        <label class="f">ID（半角）<input id="ad-id" autocapitalize="off"></label>
        <label class="f">表示名<input id="ad-name"></label>
        <label class="f">権限<select id="ad-role"><option>強化</option><option>管理</option><option>選手</option><option>記録・閲覧</option></select></label>
        <label class="f" id="ad-pid-wrap" hidden>選手<select id="ad-pid">${popts('')}</select></label>
        <label class="f">初期パスワード（6文字以上）<input id="ad-pw" autocapitalize="off"></label>
      </div>
      <div style="margin-top:10px"><button class="b" id="ad-add">追加する</button></div>
      <div class="msg ${okMsg ? 'ok' : ''}">${esc(okMsg || msg)}</div></div>`;
  }
  function render() {
    const c = conn();
    const tabBtn = document.querySelector('#bar button[data-tab="me"]');
    if (tabBtn) tabBtn.textContent = !c.token ? 'ログイン' : isPlayer(c) ? 'マイページ' : 'アカウント';
    if (!c.token) { ROOT.innerHTML = loginView(); return; }
    const player = isPlayer(c);
    ROOT.innerHTML = `<div class="pw"><h2>${player ? 'マイページ' : 'アカウント'}</h2>
      ${bind ? `<div class="warn">${esc(bind)}</div>` : ''}
      <div class="card"><div class="note">ログイン中</div><div class="who">${esc(c.user.name || c.user.id || '')}<span class="role">${esc(roleOf(c))}</span></div>
        <div class="links"><button class="b" data-go="trackman">Trackman</button><button class="b" data-go="physical">フィジカル</button><button class="b" data-go="session">セッション記録</button></div>
        ${player ? '' : '<p class="note" style="margin:10px 0 0">投手の追加・左右・引退は、スプレッドシートの「選手マスタ」で直接編集します（Trackmanタブの「現役・引退」でも引退にできます）。</p>'}</div>
      ${isAdmin(c) ? adminView() : ''}
      <div class="card"><h3>パスワードを変える</h3>
        <label class="f">いまのパスワード<input id="me-old" type="password" autocomplete="current-password"></label>
        <label class="f">新しいパスワード（6文字以上）<input id="me-new" type="password" autocomplete="new-password"></label>
        <button class="b" id="me-chpw" ${busy ? 'disabled' : ''}>変更する</button>
        <div class="msg ${pwMsg.indexOf('しました') >= 0 ? 'ok' : ''}">${esc(pwMsg)}</div></div>
      <div class="card"><button class="b" id="me-logout">ログアウト</button>
        <p class="note" style="margin:10px 0 0">みんなで使う iPad などでは、見終わったら必ずログアウトしてください。</p></div></div>`;
    const rs = ROOT.querySelector('#ad-role'); if (rs) ROOT.querySelector('#ad-pid-wrap').hidden = rs.value !== '選手';
  }

  ROOT.addEventListener('change', async e => {
    const t = e.target;
    if (t.id === 'ad-role') { ROOT.querySelector('#ad-pid-wrap').hidden = t.value !== '選手'; return; }
    if (t.id === 'ad-pid') { const p = admin && admin.players.find(x => x.id === t.value); const n = ROOT.querySelector('#ad-name'); if (p && n && !n.value.trim()) n.value = p.name; return; }
    if (t.id === 'ad-plogin') { const on = t.checked;
      if (!on && !window.confirm('選手のログインを止めます。ログイン中の選手も、すぐに見られなくなります。よろしいですか？')) { t.checked = true; return; }
      try { const j = await api('setPlayerLogin', { on }); if (!j.ok) throw new Error(j.error); admin.playerLogin = on; okMsg = on ? '選手のログインを許可しました' : '選手のログインを止めました'; msg = ''; }
      catch (er) { t.checked = !on; msg = String(er.message || er); okMsg = ''; }
      render(); return; }
    const r = t.dataset.urole, en = t.dataset.uen, up = t.dataset.upid;
    try {
      if (r) { const j = await api('setUser', { id: r, role: t.value }); if (!j.ok) throw new Error(j.error); okMsg = '権限を変更しました'; msg = ''; await loadAdmin(); render(); }
      if (up) { const j = await api('setUser', { id: up, pid: t.value }); if (!j.ok) throw new Error(j.error); okMsg = '選手を結び付けました'; msg = ''; await loadAdmin(); render(); }
      if (en) { const j = await api('setUser', { id: en, enabled: t.checked }); if (!j.ok) throw new Error(j.error); okMsg = t.checked ? '有効にしました' : '無効にしました'; msg = ''; render(); }
    } catch (er) { msg = String(er.message || er); okMsg = ''; render(); }
  });
  ROOT.addEventListener('click', async e => {
    const t = e.target;
    const go = t.closest('[data-go]'); if (go) { document.querySelector(`#bar button[data-tab="${go.dataset.go}"]`)?.click(); return; }
    if (t.id === 'me-login') {
      const id = (ROOT.querySelector('#me-id').value || '').trim(), pw = ROOT.querySelector('#me-pw').value || '';
      if (!id || !pw) { msg = 'IDとパスワードを入れてください'; render(); return; }
      busy = true; msg = ''; render();
      try {
        const p = await post({ action: 'ping' }).catch(() => ({}));
        const j = await post({ action: 'login', id, password: pw });
        if (!j.ok) throw new Error(j.error || 'ログインできませんでした');
        const c = { url: appUrl(), token: j.token, user: j.user, exp: j.exp, year: (p && p.year) || '' };
        saveConn(c);
        await checkTeam(c);
        if (isPlayer(c)) { try { localStorage.setItem('hsp-tab-' + CFG.TEAM_ID + CFG.STORE, 'trackman'); } catch (er) {} }
        else { try { localStorage.removeItem(PLINK_KEY); localStorage.setItem('hsp-tab-' + CFG.TEAM_ID + CFG.STORE, 'trackman'); } catch (er) {} }
        location.hash = ''; location.reload(); return;
      } catch (er) { msg = String(er.message || er); }
      busy = false; render(); return;
    }
    if (t.id === 'me-chpw') {
      const o = ROOT.querySelector('#me-old').value || '', n = ROOT.querySelector('#me-new').value || '';
      if (n.length < 6) { pwMsg = '新しいパスワードは6文字以上にしてください'; render(); return; }
      busy = true; pwMsg = ''; render();
      try { const j = await api('changePassword', { oldPassword: o, newPassword: n });
        if (!j.ok) throw new Error(j.error || '変更できませんでした'); pwMsg = 'パスワードを変更しました'; }
      catch (er) { pwMsg = String(er.message || er); }
      busy = false; render(); return;
    }
    if (t.id === 'me-logout') {
      if (!window.confirm('ログアウトします。よろしいですか。')) return;
      const c = conn();
      try { await post({ action: 'logout', token: c.token }); } catch (er) {}
      try { Object.keys(localStorage).filter(k => /^hsp-(conn|tm|tm-me|ph|ph-me|sess|sess-me)-/.test(k) && k.indexOf(CFG.TEAM_ID + CFG.STORE) >= 0).forEach(k => localStorage.removeItem(k));
        if (isPlayer(c)) localStorage.setItem(PLINK_KEY, '1'); } catch (er) {}
      location.reload(); return;
    }
    if (t.dataset.upw) { const id = t.dataset.upw; const pw = window.prompt(`${id} の新しいパスワード（6文字以上）`); if (!pw) return;
      try { const j = await api('setUser', { id, password: pw }); if (!j.ok) throw new Error(j.error); okMsg = '再設定しました'; msg = ''; } catch (er) { msg = String(er.message || er); okMsg = ''; }
      render(); return; }
    if (t.id === 'ad-add') {
      try { const role = ROOT.querySelector('#ad-role').value, pid = role === '選手' ? ROOT.querySelector('#ad-pid').value : '';
        if (role === '選手' && !pid) throw new Error('どの選手か選んでください');
        const j = await api('setUser', Object.assign({ id: ROOT.querySelector('#ad-id').value.trim(), name: ROOT.querySelector('#ad-name').value.trim(), role, password: ROOT.querySelector('#ad-pw').value }, role === '選手' ? { pid } : {}));
        if (!j.ok) throw new Error(j.error); okMsg = '追加しました'; msg = ''; await loadAdmin(); }
      catch (er) { msg = String(er.message || er); okMsg = ''; }
      render(); return;
    }
  });
  ROOT.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.target.id === 'me-pw' || e.target.id === 'me-id')) ROOT.querySelector('#me-login')?.click(); });

  render();
  const c = conn();
  if (c.token) {
    post({ action: 'me', token: c.token }).then(async j => {
      if (j && j.ok) { if (j.user) { c.user = j.user; saveConn(c); } await checkTeam(c); if (isAdmin(c)) { try { await loadAdmin(); } catch (er) { msg = String(er.message || er); } } render(); }
      else if (j && j.error === 'unauthorized') { try { localStorage.removeItem(CONN_KEY); } catch (er) {} msg = 'ログインが切れています。もう一度ログインしてください'; render(); }
    }).catch(() => {});
  }
  ROOT.addEventListener('hsp:show', () => { if (conn().token && isAdmin(conn())) loadAdmin().then(render).catch(() => {}); });
}

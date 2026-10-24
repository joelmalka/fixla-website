// Shared login gate for the Fixla admin pages (index.html, earnings.html).
//
// Real security lives in the database: RLS policies + public.is_admin() (admin_users table).
// This gate signs the admin in with Supabase so every request carries their session.
// The admin bundle's own Supabase client uses the same default storage key
// (sb-ofgiuvjaalcridojramn-auth-token), so it picks this session up automatically.
(function () {
  var SUPABASE_URL = 'https://ofgiuvjaalcridojramn.supabase.co';
  var SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZ2l1dmphYWxjcmlkb2pyYW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTM2NDEsImV4cCI6MjA2MTc4OTY0MX0.FE0tpB_fJ9W5UwPBtKZxsgjZG-UilPHJ0Lu70moU9J8';

  var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  var onReadyCallback = null;

  function el(id) {
    return document.getElementById(id);
  }

  function renderLogin(message) {
    var box = document.querySelector('#login-overlay .login-box');
    box.innerHTML =
      '<div class="logo-icon">🔐</div>' +
      '<h1>Fixla Admin</h1>' +
      '<p>Kirjaudu ylläpitäjän tilillä</p>' +
      '<div id="login-error" class="login-error' + (message ? ' show' : '') + '"></div>' +
      '<input type="email" id="admin-email" placeholder="Sähköposti" autocomplete="username" />' +
      '<input type="password" id="admin-password" placeholder="Salasana" autocomplete="current-password" style="margin-top:10px" />' +
      '<button type="button" id="admin-login-btn">Kirjaudu</button>' +
      '<button type="button" id="admin-google-btn" style="margin-top:10px;background:#fff;color:#1f2937;border:1px solid #d1d5db">Kirjaudu Googlella</button>';
    el('login-error').textContent = message || '';
    el('admin-login-btn').onclick = signInWithPassword;
    el('admin-google-btn').onclick = signInWithGoogle;
    el('admin-password').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') signInWithPassword();
    });
    el('login-overlay').style.display = 'flex';
    el('app').style.display = 'none';
  }

  function showError(message) {
    var err = el('login-error');
    if (!err) return renderLogin(message);
    err.textContent = message;
    err.classList.add('show');
  }

  async function signInWithPassword() {
    var email = el('admin-email').value.trim();
    var password = el('admin-password').value;
    if (!email || !password) return showError('Syötä sähköposti ja salasana.');
    el('admin-login-btn').disabled = true;
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    el('admin-login-btn').disabled = false;
    if (result.error) return showError('Kirjautuminen epäonnistui: ' + result.error.message);
    check();
  }

  async function signInWithGoogle() {
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }

  function addLogoutButton() {
    if (el('admin-logout-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'admin-logout-btn';
    btn.type = 'button';
    btn.textContent = 'Kirjaudu ulos';
    btn.style.cssText =
      'position:fixed;bottom:16px;right:16px;z-index:9999;padding:8px 14px;border-radius:8px;' +
      'border:1px solid #d1d5db;background:#fff;color:#374151;font:600 13px system-ui,sans-serif;cursor:pointer';
    btn.onclick = async function () {
      await client.auth.signOut();
      window.location.reload();
    };
    document.body.appendChild(btn);
  }

  async function check() {
    var sessionResult = await client.auth.getSession();
    if (!sessionResult.data.session) return renderLogin();

    var adminResult = await client.rpc('is_admin');
    if (adminResult.error || adminResult.data !== true) {
      await client.auth.signOut();
      return renderLogin('Tällä tilillä ei ole ylläpitäjän oikeuksia.');
    }

    el('login-overlay').style.display = 'none';
    el('app').style.display = 'block';
    addLogoutButton();
    if (onReadyCallback) {
      var cb = onReadyCallback;
      onReadyCallback = null; // run the page's app loader once
      cb(client);
    }
  }

  window.FixlaAdminAuth = {
    start: function (onReady) {
      onReadyCallback = onReady;
      check();
    },
  };
})();

/* Auth-lag: AWS Cognito USER_PASSWORD_AUTH + refresh.
 *
 * Vigtigste regler (fra Mikkel + testet integration):
 * - API'et kræver ID-TOKEN i "Authorization: Bearer ..." — IKKE access_token.
 * - id_token holder 60 min; refresh_token 5 dage. Vi refresher automatisk.
 * - user_id er intern: hentes via /users/lookup, holdes KUN i memory,
 *   aldrig i UI, URL'er i adresselinjen, console.log eller fejlbeskeder.
 */
window.OrbisAuth = (function () {
  function config() {
    if (window.ORBISX_CONFIG && window.ORBISX_CONFIG.clientId && !window.ORBISX_CONFIG.clientId.startsWith('INDSÆT')) {
      return window.ORBISX_CONFIG;
    }
    try { return JSON.parse(localStorage.getItem('orbisx_config')) || null; } catch { return null; }
  }

  function saveConfig(cfg) { localStorage.setItem('orbisx_config', JSON.stringify(cfg)); }

  let idToken = sessionStorage.getItem('orbisx_id_token') || null;
  let idTokenExpiry = Number(sessionStorage.getItem('orbisx_id_expiry') || 0);
  let userId = null; // intern, kun i memory — eksponeres ikke

  async function cognito(target, body) {
    const cfg = config();
    if (!cfg) throw new Error('API-opsætning mangler');
    const r = await fetch(`https://cognito-idp.${cfg.region}.amazonaws.com/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}` },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.__type || 'Login fejlede');
    return data;
  }

  function storeTokens(result) {
    idToken = result.IdToken;
    idTokenExpiry = Date.now() + (result.ExpiresIn - 60) * 1000; // 1 min margin
    sessionStorage.setItem('orbisx_id_token', idToken);
    sessionStorage.setItem('orbisx_id_expiry', String(idTokenExpiry));
    if (result.RefreshToken) localStorage.setItem('orbisx_refresh_token', result.RefreshToken);
  }

  async function login(email, password) {
    const cfg = config();
    const data = await cognito('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: cfg.clientId,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    });
    if (!data.AuthenticationResult) throw new Error('Uventet svar fra Cognito (challenge ikke understøttet i prototypen)');
    storeTokens(data.AuthenticationResult);
    localStorage.setItem('orbisx_email', email);
    userId = null;
  }

  async function refresh() {
    const cfg = config();
    const token = localStorage.getItem('orbisx_refresh_token');
    if (!token) return false;
    try {
      const data = await cognito('InitiateAuth', {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: cfg.clientId,
        AuthParameters: { REFRESH_TOKEN: token },
      });
      storeTokens(data.AuthenticationResult);
      return true;
    } catch {
      return false;
    }
  }

  /* Gyldigt id_token eller null (kalderen viser så login). */
  async function ensureIdToken() {
    if (idToken && Date.now() < idTokenExpiry) return idToken;
    return (await refresh()) ? idToken : null;
  }

  /* Integer user_id til URL-paths. KUN i memory, jf. Mikkels regel. */
  async function ensureUserId() {
    if (userId !== null) return userId;
    const me = await window.OrbisAPI.lookupUser(email());
    userId = me.user_id;
    return userId;
  }

  function email() { return localStorage.getItem('orbisx_email') || ''; }
  function isLoggedIn() { return !!(idToken && Date.now() < idTokenExpiry) || !!localStorage.getItem('orbisx_refresh_token'); }
  function hasConfig() { return !!config(); }

  function logout() {
    idToken = null; idTokenExpiry = 0; userId = null;
    sessionStorage.removeItem('orbisx_id_token');
    sessionStorage.removeItem('orbisx_id_expiry');
    localStorage.removeItem('orbisx_refresh_token');
  }

  return { config, saveConfig, hasConfig, login, logout, ensureIdToken, ensureUserId, email, isLoggedIn };
})();

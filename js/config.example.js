/* API-opsætning.
 *
 * 1. Kopiér denne fil til js/config.local.js   (den er gitignored, committes aldrig)
 * 2. Udfyld værdierne fra Cognito/API Gateway (få dem af Mikkel, eller genbrug iOS-appens)
 *
 * Alternativ uden fil: åbn login-dialogen og udfyld "API-opsætning" — så gemmes
 * værdierne i din browsers localStorage i stedet.
 *
 * Client ID er en public client (ingen secret), men vi holder den alligevel ude
 * af det offentlige repo. Læg ALDRIG passwords eller secrets her.
 */
window.ORBISX_CONFIG = {
  region: 'eu-north-1',
  clientId: 'INDSÆT-COGNITO-APP-CLIENT-ID',
  apiBase: 'https://INDSÆT-API-ID.execute-api.eu-north-1.amazonaws.com/v2',
};

import { ExpressOIDC } from "@okta/oidc-middleware";

// okta connection object
export const oidc = new ExpressOIDC({
    issuer: 'https://dev-596845.oktapreview.com/oauth2/default',
    client_id: '0oaf1ynfhd82kfcJS0h7',
    client_secret: 'Te6Mwv8IPqsLhKMQ7v8pMUbSQ8bkHGCgELuVfqG9',
    redirect_uri: 'http://localhost:3000/authorization-code/callback',
    scope: 'openid profile'
  });
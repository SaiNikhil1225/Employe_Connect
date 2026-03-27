import { LogLevel, type Configuration } from '@azure/msal-browser';

/**
 * MSAL (Microsoft Authentication Library) configuration.
 *
 * Required environment variables:
 *   VITE_AZURE_CLIENT_ID  — Application (client) ID from Azure AD App Registration
 *   VITE_AZURE_TENANT_ID  — Directory (tenant) ID (or "common" for multi-tenant)
 *   VITE_AZURE_REDIRECT_URI — Redirect URI registered in Azure AD (defaults to app origin)
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    // sessionStorage clears tokens when the tab is closed; safer than localStorage
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (import.meta.env.DEV) {
          if (level === LogLevel.Error) console.error('[MSAL]', message);
          else if (level === LogLevel.Warning) console.warn('[MSAL]', message);
        }
      },
    },
  },
};

/**
 * Default login / token-request scopes.
 * "openid", "profile", "email" are required for the ID token claims.
 * "User.Read" fetches basic Microsoft Graph profile data.
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

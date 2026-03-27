import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/config/msalConfig';

let msalInstance: PublicClientApplication | null = null;

/**
 * Returns the singleton MSAL PublicClientApplication instance.
 */
export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}

/**
 * Call early (before React renders) to let MSAL process the auth-code
 * response that Microsoft added to the URL after the redirect.
 *
 * Returns an AuthenticationResult if a redirect response was handled,
 * or null if this is a normal page load.
 */
export async function handleMsalRedirect(): Promise<AuthenticationResult | null> {
  const instance = await getMsalInstance();
  return instance.handleRedirectPromise();
}

/**
 * Starts the Microsoft login by redirecting the full page to Microsoft's
 * authorization endpoint. After the user authenticates (including MFA),
 * Microsoft redirects back to this app with an auth code in the URL.
 * handleMsalRedirect() (called in main.tsx) picks it up on the return trip.
 */
export async function loginWithMicrosoftRedirect(): Promise<void> {
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_AZURE_CLIENT_ID is not configured. ' +
        'Please add your Azure AD Application (client) ID to the .env file.'
    );
  }

  const instance = await getMsalInstance();
  await instance.loginRedirect({
    ...loginRequest,
    prompt: 'select_account',
  });
}

/**
 * Signs out the current Microsoft account.
 */
export async function logoutFromMicrosoft(): Promise<void> {
  const instance = await getMsalInstance();
  const accounts = instance.getAllAccounts();
  if (accounts.length === 0) return;

  await instance
    .logoutPopup({
      account: accounts[0],
      postLogoutRedirectUri: window.location.origin,
    })
    .catch(() => {
      instance.clearCache();
    });
}

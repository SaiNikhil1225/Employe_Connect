import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { handleMsalRedirect } from '@/services/msalService'
import authService from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

async function bootstrap() {
  // Handle any pending Microsoft redirect response BEFORE React renders.
  // After user authenticates at Microsoft, they're redirected back here
  // with an auth code in the URL. MSAL exchanges it for tokens.
  try {
    const msalResult = await handleMsalRedirect();

    if (msalResult) {
      console.log('[MSAL redirect] Got result. Account:', msalResult.account?.username);
      console.log('[MSAL redirect] idToken present:', !!msalResult.idToken, 'length:', msalResult.idToken?.length);
      console.log('[MSAL redirect] accessToken present:', !!msalResult.accessToken, 'length:', msalResult.accessToken?.length);
    }

    if (msalResult?.idToken) {
      // We just returned from Microsoft with a valid token.
      // Send it to our backend for validation and get an app JWT.
      // Also pass the access token so the backend can fetch the Graph profile photo.
      const response = await authService.loginWithMicrosoft(
        msalResult.idToken,
        msalResult.accessToken || undefined,
      );

      // Hydrate Zustand auth store BEFORE React renders so the router
      // sees isAuthenticated=true and routes to /dashboard.
      useAuthStore.getState().login(response.user);

      // Store a flag so Login.tsx (or AppRouter) can redirect correctly
      localStorage.setItem('msal-login-pending', 'true');
    }
  } catch (err: unknown) {
    console.error('[MSAL redirect] Error:', err);
    const axiosErr = err as { response?: { data?: { message?: string } } };
    if (axiosErr?.response?.data) {
      console.error('[MSAL redirect] Server response:', JSON.stringify(axiosErr.response.data));
    }
    // Store error so Login.tsx can show a toast after React renders
    const serverMsg = axiosErr?.response?.data?.message;
    const msg = serverMsg || (err instanceof Error ? err.message : 'Microsoft login failed');
    localStorage.setItem('msal-login-error', msg);
  }

  createRoot(document.getElementById('root')!).render(
    <App />
  )
}

bootstrap();

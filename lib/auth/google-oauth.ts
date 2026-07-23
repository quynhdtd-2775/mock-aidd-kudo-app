// Direct Google OAuth (code flow) for the DB-less demo deployment.
//
// Active only when BOTH mock auth is enabled AND GOOGLE_CLIENT_ID/SECRET are
// set: the mock_session cookie keeps gating routes exactly as in mock mode,
// while the google_profile cookie overlays the real Google identity on top
// (read back in lib/auth/mock-session-server.ts). Once a hosted Supabase
// project exists, drop the GOOGLE_* env vars — Supabase's own OAuth flow in
// app/login/actions.ts takes over.
import "server-only";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GOOGLE_PROFILE_COOKIE = "google_profile";
export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

export function isGoogleOAuthEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function buildGoogleAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${origin}/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleProfile = {
  email: string;
  name: string;
  avatarUrl: string;
};

/**
 * Exchange the authorization code for tokens and decode the id_token payload.
 * The id_token arrives directly from Google's token endpoint over TLS, so
 * decoding without signature verification is safe. Returns null on failure.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<GoogleProfile | null> {
  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) {
      console.error(
        "exchangeGoogleCode: token endpoint returned",
        res.status,
        await res.text(),
      );
      return null;
    }
    const { id_token: idToken } = (await res.json()) as { id_token?: string };
    if (!idToken) {
      console.error("exchangeGoogleCode: token response had no id_token");
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"),
    ) as { email?: string; name?: string; picture?: string };
    return {
      email: payload.email ?? "",
      name: payload.name ?? payload.email ?? "",
      avatarUrl: payload.picture ?? "",
    };
  } catch (err) {
    console.error("exchangeGoogleCode threw", err);
    return null;
  }
}

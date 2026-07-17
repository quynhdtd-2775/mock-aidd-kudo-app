// Shape the app consumes for the signed-in user, independent of the auth
// backend (mock today, Supabase once connected).
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

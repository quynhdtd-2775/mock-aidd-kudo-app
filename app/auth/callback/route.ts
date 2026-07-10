import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/`);
      }
      console.error("auth callback: exchangeCodeForSession failed", error);
    } catch (err) {
      console.error("auth callback: exchangeCodeForSession threw", err);
      // fall through to the error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

/** Enables Draft Mode for Sanity live preview. Requires the preview secret. */
export async function GET(request: NextRequest) {
  const secret = process.env.SANITY_PREVIEW_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, message: "Invalid preview secret." }, { status: 401 });
  }
  const dm = await draftMode();
  dm.enable();
  const slug = request.nextUrl.searchParams.get("slug") ?? "/";
  // Only same-site relative redirects — never an open redirect.
  const target = slug.startsWith("/") && !slug.startsWith("//") ? slug : "/";
  redirect(target);
}

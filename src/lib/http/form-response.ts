import { NextResponse } from "next/server";

export function formRedirect(request: Request, path: string) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ redirectTo: path });
  }
  return NextResponse.redirect(new URL(path, request.url), 303);
}

import { NextResponse } from "next/server";

export function formRedirect(request: Request, path: string) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ redirectTo: path });
  }
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export function formFailure(
  request: Request,
  path: string,
  message: string,
  status = 400,
) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ message }, { status });
  }
  return NextResponse.redirect(new URL(path, request.url), 303);
}

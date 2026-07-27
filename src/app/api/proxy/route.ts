import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const targetUrl = searchParams.get("url");
  const referer = searchParams.get("referer") || "https://autoembed.cc/";

  if (!targetUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: referer,
      },
    });

    if (!res.ok) {
      return new NextResponse(`Proxy fetch failed with status ${res.status}`, {
        status: res.status,
      });
    }

    const contentType =
      res.headers.get("content-type") || "application/x-mpegURL";

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy Error: ${err.message}`, { status: 500 });
  }
}
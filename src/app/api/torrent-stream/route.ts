// Placeholder - torrent streaming requires complex setup with native dependencies
// Users will receive magnet link and can open in their torrent client

export async function GET() {
  return new Response("Torrent streaming not available", { status: 501 });
}

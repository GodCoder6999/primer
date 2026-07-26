import VideoPlayer from "@/components/VideoPlayer"; // Default import works now

export default async function DetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoplay?: string; season?: string; episode?: string }>;
}) {
  const { id } = await params;
  const { season = "1", episode = "1" } = await searchParams;

  const title = {
    tmdbId: id,
    isSeries: true, // Set dynamically according to your route logic
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Playing ID: {id}</h1>
      <VideoPlayer title={title} season={season} episode={episode} />
    </main>
  );
}
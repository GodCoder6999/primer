import { StorefrontPage } from "@/components/StorefrontPage";
import { heroSlides, tvRows } from "@/lib/mock-data";

export const metadata = {
  title: "Prime Video: Watch, rent, or buy TV shows online",
};

export default function TvShowsPage() {
  return (
    <StorefrontPage
      activeHref="/tv"
      heading="TV shows"
      slides={heroSlides}
      rows={tvRows}
    />
  );
}

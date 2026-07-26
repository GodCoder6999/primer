import { StorefrontPage } from "@/components/StorefrontPage";
import { heroSlides, movieRows } from "@/lib/mock-data";

export const metadata = {
  title: "Prime Video: Watch, rent, or buy movies online",
};

export default function MoviesPage() {
  return (
    <StorefrontPage
      activeHref="/movie"
      heading="Movies"
      slides={heroSlides}
      rows={movieRows}
    />
  );
}

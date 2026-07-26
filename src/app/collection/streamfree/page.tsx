import { StorefrontPage } from "@/components/StorefrontPage";
import { freeRows, heroSlides } from "@/lib/mock-data";

export const metadata = {
  title: "Free to me — Prime Video",
};

/** The target renders no <h1> here; the hero carries the page identity. */
export default function FreeToMePage() {
  return (
    <StorefrontPage
      activeHref="/collection/streamfree"
      slides={heroSlides}
      rows={freeRows}
    />
  );
}

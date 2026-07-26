import { StorefrontPage } from "@/components/StorefrontPage";
import { heroSlides, kidsRows } from "@/lib/mock-data";

export const metadata = { title: "Kids — Prime Video" };

/** /kids has both a hero billboard and an h1, unlike the genre pages. */
export default function KidsPage() {
  return (
    <StorefrontPage
      activeHref="/kids"
      heading="Kids"
      slides={heroSlides}
      rows={kidsRows}
    />
  );
}

import { StorefrontPage } from "@/components/StorefrontPage";
import { heroSlides, subscriptionRows } from "@/lib/mock-data";

export const metadata = {
  title: "Prime Video: Browse and start subscriptions — Watch now",
};

/** The target shows a single hero slide here rather than a rotating carousel. */
export default function SubscriptionsPage() {
  return (
    <StorefrontPage
      activeHref="/addons"
      slides={heroSlides.slice(0, 1)}
      rows={subscriptionRows}
    />
  );
}

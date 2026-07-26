import { StorefrontSkeleton } from "@/components/StorefrontSkeleton";

export default function Loading() {
  return <StorefrontSkeleton activeHref="/addons" rows={4} />;
}

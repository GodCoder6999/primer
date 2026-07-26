import { StorefrontSkeleton } from "@/components/StorefrontSkeleton";

export default function Loading() {
  return <StorefrontSkeleton activeHref="/movie" rows={4} />;
}

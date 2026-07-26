import { StorefrontSkeleton } from "@/components/StorefrontSkeleton";

/** /livetv has no hero billboard on the target. */
export default function Loading() {
  return <StorefrontSkeleton activeHref="/livetv" hero={false} rows={3} />;
}

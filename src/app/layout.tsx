import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Amazon Ember — the target's typeface, mirrored into public/fonts.
const amazonEmber = localFont({
  variable: "--font-amazon-ember",
  display: "swap",
  fallback: ["Amazon Arabic Ember", "Arial", "sans-serif"],
  src: [
    { path: "../../public/fonts/AmazonEmber-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/AmazonEmber-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/AmazonEmber-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/AmazonEmber-Heavy.woff2", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.primevideo.com"),
  title: "Prime Video: Watch movies, TV shows, sports, and live TV",
  description:
    "Stream popular movies, TV shows, sports, and live TV included with Prime, and even more with add-on subscriptions. Watch anywhere, anytime.",
  openGraph: {
    type: "website",
    url: "https://www.primevideo.com/",
    title: "Prime Video: Watch movies, TV shows, sports, and live TV",
    description:
      "Stream popular movies, TV shows, sports, and live TV included with Prime, and even more with add-on subscriptions. Watch anywhere, anytime.",
    images: ["/seo/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/seo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/seo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/seo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/seo/favicon-196x196.png", sizes: "196x196", type: "image/png" },
    ],
    apple: [
      { url: "/seo/apple-touch-icon.png" },
      { url: "/seo/apple-touch-icon-152x152.png", sizes: "152x152" },
    ],
  },
};

export const viewport = {
  themeColor: "#00050d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-us" className={`${amazonEmber.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--pv-base)] text-white">
        {children}
      </body>
    </html>
  );
}

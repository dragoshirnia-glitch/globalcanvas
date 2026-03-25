import "./globals.css";

export const metadata = {
  title: "GlobalCanvas — Own a piece of the internet for €1",
  description: "Buy a block on the world's largest collaborative digital artwork. 1,000,000 blocks, €1 each, yours forever. Add your color, name and link permanently.",
  keywords: "collaborative art, digital canvas, buy pixel, internet art, globalcanvas",
  openGraph: {
    title: "GlobalCanvas — Own a piece of the internet for €1",
    description: "1,000,000 blocks. €1 each. Yours forever. Be part of the world's largest collaborative artwork.",
    url: "https://www.globalcanvas.design",
    siteName: "GlobalCanvas",
    images: [
      {
        url: "https://www.globalcanvas.design/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalCanvas — Own a piece of the internet for €1",
    description: "1,000,000 blocks. €1 each. Yours forever.",
    images: ["https://www.globalcanvas.design/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
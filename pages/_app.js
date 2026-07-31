import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-src",
  display: "swap",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-src",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-src",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}

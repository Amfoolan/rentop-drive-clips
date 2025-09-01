import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rentop Drive Clips",
  description: "Générateur de vidéos MP4 avec encodage serveur",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
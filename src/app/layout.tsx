import "./style.css";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: {
    default: "Bully Free",
    template: "%s | Bully Free",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

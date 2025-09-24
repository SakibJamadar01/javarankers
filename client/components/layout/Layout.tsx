import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container py-8">{children}</main>
      <Footer />
    </div>
  );
}

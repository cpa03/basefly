import { SkipLink } from "~/components/skip-link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen">
      <SkipLink />
      <main id="main-content">{children}</main>
    </div>
  );
}

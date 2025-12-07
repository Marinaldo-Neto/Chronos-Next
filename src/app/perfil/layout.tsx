import { ReactNode } from "react";

export default function PerfilLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div>{children}</div>
    </div>
  );
}

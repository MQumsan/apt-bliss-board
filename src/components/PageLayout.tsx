import { TopNavbar } from './TopNavbar';

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopNavbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

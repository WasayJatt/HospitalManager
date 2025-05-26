import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  onSearch?: (query: string) => void;
}

export default function MainLayout({ children, title, onSearch }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} onSearch={onSearch} />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

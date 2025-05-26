import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

export default function Header({ title, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-slate-600 hover:text-slate-900">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search patients, doctors..." 
              className="w-64 pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-slate-900">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-alert-red rounded-full text-xs text-white flex items-center justify-center">3</span>
          </button>
        </div>
      </div>
    </header>
  );
}

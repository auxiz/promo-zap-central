
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';
import { Switch } from '@/components/ui/switch';

const lojas = [{
  id: 'promo',
  name: 'PROMO'
}, {
  id: 'shopee',
  name: 'Shopee'
}, {
  id: 'magalu',
  name: 'Magalu'
}, {
  id: 'amazon',
  name: 'Amazon'
}, {
  id: 'natura',
  name: 'Natura'
}];

export default function Header() {
  const [selectedLoja, setSelectedLoja] = useState(lojas[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const isDarkMode = theme === 'dark';
  
  return <header className="bg-background border-b border-border h-16 flex items-center px-6">
      <div className="flex-1">
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input hover:bg-accent transition-colors">
            <span>Loja:</span>
            <span className="font-medium">{selectedLoja.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", dropdownOpen ? "rotate-180" : "")}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          
          {dropdownOpen && <div className="absolute left-0 mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-10">
              <ul className="py-1">
                {lojas.map(loja => <li key={loja.id}>
                    <button onClick={() => {
                setSelectedLoja(loja);
                setDropdownOpen(false);
              }} className={cn("w-full text-left px-4 py-2 flex items-center justify-between hover:bg-accent hover:text-accent-foreground", selectedLoja.id === loja.id && "bg-accent/50")}>
                      {loja.name}
                      {selectedLoja.id === loja.id && <Check size={16} />}
                    </button>
                  </li>)}
              </ul>
            </div>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationCenter />
        
        <div className="flex items-center gap-2">
          <Sun size={18} className={cn("text-muted-foreground", !isDarkMode && "text-foreground")} />
          <Switch 
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
          />
          <Moon size={18} className={cn("text-muted-foreground", isDarkMode && "text-foreground")} />
        </div>
      </div>
    </header>;
}


import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const lojas = [
  { id: 'promo', name: 'PROMO' },
  { id: 'shopee', name: 'Shopee' },
  { id: 'magalu', name: 'Magalu' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'natura', name: 'Natura' },
];

export default function Header() {
  const [selectedLoja, setSelectedLoja] = useState(lojas[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border h-16 flex items-center px-6">
      <div className="flex-1">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input hover:bg-accent transition-colors"
          >
            <span>Loja:</span>
            <span className="font-medium">{selectedLoja.name}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={cn("transition-transform", dropdownOpen ? "rotate-180" : "")}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="absolute left-0 mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-10">
              <ul className="py-1">
                {lojas.map((loja) => (
                  <li key={loja.id}>
                    <button
                      onClick={() => {
                        setSelectedLoja(loja);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center justify-between hover:bg-accent hover:text-accent-foreground",
                        selectedLoja.id === loja.id && "bg-accent/50"
                      )}
                    >
                      {loja.name}
                      {selectedLoja.id === loja.id && <Check size={16} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2"></path>
            <path d="M12 21v2"></path>
            <path d="M4.22 4.22l1.42 1.42"></path>
            <path d="M18.36 18.36l1.42 1.42"></path>
            <path d="M1 12h2"></path>
            <path d="M21 12h2"></path>
            <path d="M4.22 19.78l1.42-1.42"></path>
            <path d="M18.36 5.64l1.42-1.42"></path>
          </svg>
          <input
            type="checkbox"
            className="toggle theme-controller"
            value="dark"
            onChange={(e) => {
              document.documentElement.classList.toggle('dark', e.target.checked);
            }}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </label>
      </div>
    </header>
  );
}

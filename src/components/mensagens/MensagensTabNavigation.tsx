
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare } from 'lucide-react';

interface MensagensTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MensagensTabNavigation({ activeTab, setActiveTab }: MensagensTabNavigationProps) {
  return (
    <div className="mensagens-tab-navigation">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="tab-navigation-container">
          <TabsList className="tab-list">
            <TabsTrigger value="editor" className="tab-trigger">
              <Bot className="h-4 w-4 flex-shrink-0" />
              <span className="tab-text">
                <span className="hidden sm:inline">Editor de Templates</span>
                <span className="sm:hidden">Editor</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="tab-trigger">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="tab-text">
                <span className="hidden sm:inline">Pré-visualização</span>
                <span className="sm:hidden">Preview</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}

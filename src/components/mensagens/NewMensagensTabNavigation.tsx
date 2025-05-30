
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, Eye } from 'lucide-react';

interface NewMensagensTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function NewMensagensTabNavigation({ activeTab, setActiveTab }: NewMensagensTabNavigationProps) {
  return (
    <div className="w-full mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto sm:mx-0">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
            <span className="sm:hidden">Edit</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">Ver</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}


import { Dispatch, SetStateAction } from 'react';
import { automationPlaceholders } from '@/hooks/useAutomationTemplateUtils';

interface AutomationPlaceholdersListProps {
  templateContent: string;
  setTemplateContent: Dispatch<SetStateAction<string>>;
}

export function AutomationPlaceholdersList({ templateContent, setTemplateContent }: AutomationPlaceholdersListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Campos Automáticos do Bot</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Estes campos são preenchidos automaticamente pelo bot quando um link é detectado
      </p>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {automationPlaceholders.map((placeholder) => (
          <div
            key={placeholder.id}
            className="p-3 border border-input rounded-md bg-card hover:bg-accent transition-colors cursor-pointer"
            onClick={() => {
              const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
              if (textarea) {
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                
                const newValue =
                  templateContent.substring(0, startPos) +
                  placeholder.label +
                  templateContent.substring(endPos);
                
                setTemplateContent(newValue);
                
                setTimeout(() => {
                  textarea.focus();
                  const newCursorPos = startPos + placeholder.label.length;
                  textarea.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
              }
            }}
          >
            <div className="font-mono text-sm text-blue-600">{placeholder.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{placeholder.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

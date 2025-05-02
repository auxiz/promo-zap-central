
import { Dispatch, SetStateAction } from 'react';

interface Placeholder {
  id: string;
  label: string;
  description: string;
}

interface PlaceholdersListProps {
  placeholders: Placeholder[];
  templateContent: string;
  setTemplateContent: Dispatch<SetStateAction<string>>;
}

export function PlaceholdersList({ placeholders, templateContent, setTemplateContent }: PlaceholdersListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Placeholders Disponíveis</h3>
      <div className="space-y-2">
        {placeholders.map((placeholder) => (
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
                
                // Reposicionar o cursor após o placeholder inserido
                setTimeout(() => {
                  textarea.focus();
                  const newCursorPos = startPos + placeholder.label.length;
                  textarea.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
              }
            }}
          >
            <div className="font-mono text-sm">{placeholder.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{placeholder.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

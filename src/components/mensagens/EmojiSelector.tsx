
import { Dispatch, SetStateAction } from 'react';

interface EmojiSelectorProps {
  templateContent: string;
  setTemplateContent: Dispatch<SetStateAction<string>>;
}

export function EmojiSelector({ templateContent, setTemplateContent }: EmojiSelectorProps) {
  const emojis = ['🔥', '✨', '💰', '🛒', '⚡', '🎁', '📦', '✅', '⚠️', '💸', '🔴', '🟢'];

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Emojis</h3>
      <div className="grid grid-cols-6 gap-1">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="p-2 text-lg hover:bg-accent rounded-md"
            onClick={() => {
              const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
              if (textarea) {
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                
                const newValue =
                  templateContent.substring(0, startPos) +
                  emoji +
                  templateContent.substring(endPos);
                
                setTemplateContent(newValue);
                
                // Reposicionar o cursor após o emoji inserido
                setTimeout(() => {
                  textarea.focus();
                  const newCursorPos = startPos + emoji.length;
                  textarea.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
              }
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

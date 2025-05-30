
import { Card } from '@/components/ui/card';

interface NewEmojiSelectorProps {
  templateContent: string;
  setTemplateContent: (content: string) => void;
}

const emojis = [
  '🔥', '✨', '💰', '🛒', '⚡', '🎁', '📦', '✅', '❌', '💸', 
  '🔴', '🟢', '🎯', '🚀', '💎', '⭐', '🏷️', '💡', '🤖', '📢',
  '⏰', '📊', '💵', '🛍️', '🔗', '📱', '💫', '🎉', '🔔', '⚠️'
];

export function NewEmojiSelector({ templateContent, setTemplateContent }: NewEmojiSelectorProps) {
  const insertEmoji = (emoji: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      
      const newValue =
        templateContent.substring(0, startPos) +
        emoji +
        templateContent.substring(endPos);
      
      setTemplateContent(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = startPos + emoji.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Emojis</h3>
          <p className="text-xs text-muted-foreground">
            Clique para inserir no template
          </p>
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => insertEmoji(emoji)}
              className="aspect-square flex items-center justify-center text-lg hover:bg-accent rounded-md transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

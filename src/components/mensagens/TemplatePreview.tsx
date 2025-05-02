
import { Card } from '@/components/ui/card';

interface TemplatePreviewProps {
  previewText: string;
}

export function TemplatePreview({ previewText }: TemplatePreviewProps) {
  return (
    <Card className="p-4 max-w-md mx-auto">
      <h3 className="font-medium mb-2 text-center">Visualização do WhatsApp</h3>
      <div className="border border-input rounded-lg p-4 bg-accent/30 whitespace-pre-wrap font-[system-ui] text-[15px] dark:text-slate-100">
        {previewText.split('\n').map((line, i) => (
          <p 
            key={i} 
            className={line.includes('*') ? 'font-bold' : ''}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                .replace(/~(.*?)~/g, '<del>$1</del>')
            }}
          />
        ))}
      </div>
    </Card>
  );
}

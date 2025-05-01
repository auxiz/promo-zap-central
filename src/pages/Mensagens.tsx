
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const messagePlaceholders = [
  { id: 'produtodescricao', label: '--produtodescricao--', description: 'Nome e descrição do produto' },
  { id: 'linklojaoficial', label: '--linklojaoficial--', description: 'Link para a loja oficial' },
  { id: 'precoantigo', label: '--precoantigo--', description: 'Preço antigo/original' },
  { id: 'precorecorrencia', label: '--precorecorrencia--', description: 'Preço com recorrência' },
];

const messageTemplateStyles = [
  { id: 'normal', name: 'Normal', description: 'Template padrão para produtos' },
  { id: 'desconto', name: 'Desconto', description: 'Template destacando descontos' },
  { id: 'recorrencia', name: 'Recorrência', description: 'Template para produtos com recorrência' },
  { id: 'descontoRecorrencia', name: 'Desconto+Recorrência', description: 'Template para produtos com desconto e recorrência' },
];

const defaultTemplate = `🔥 *SUPER OFERTA* 🔥

--produtodescricao--

✅ De: ~R$ --precoantigo--~
✅ Por apenas: *R$ 39,90*
${Array(3).fill('').join('\n')}
🛒 COMPRAR: --linklojaoficial--

⚠️ *ESTOQUE LIMITADO*
📦 Frete Grátis`;

export default function Mensagens() {
  const [activeTab, setActiveTab] = useState('editor');
  const [template, setTemplate] = useState(defaultTemplate);
  const [activeStyle, setActiveStyle] = useState(messageTemplateStyles[0]);
  
  // For preview, replace placeholders with example values
  const previewText = template
    .replace(/--produtodescricao--/g, 'Echo Dot (5ª Geração) | Smart speaker com Alexa')
    .replace(/--linklojaoficial--/g, 'https://amzn.to/exemplo')
    .replace(/--precoantigo--/g, '599,00')
    .replace(/--precorecorrencia--/g, '323,10');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mensagens</h1>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors">
            Salvar Template
          </button>
        </div>
      </div>
      
      <Card className="dashboard-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <label htmlFor="template-name" className="block text-sm font-medium mb-1">
                    Nome do Template
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Template Padrão"
                  />
                </div>
                
                <div>
                  <label htmlFor="template-content" className="block text-sm font-medium mb-1">
                    Conteúdo do Template
                  </label>
                  <textarea
                    id="template-content"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {messageTemplateStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setActiveStyle(style)}
                      className={`p-2 rounded-md border text-sm text-center transition-colors ${
                        activeStyle.id === style.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Placeholders Disponíveis</h3>
                <div className="space-y-2">
                  {messagePlaceholders.map((placeholder) => (
                    <div
                      key={placeholder.id}
                      className="p-3 border border-input rounded-md bg-card hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => {
                        const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
                        const startPos = textarea.selectionStart;
                        const endPos = textarea.selectionEnd;
                        
                        const newValue =
                          template.substring(0, startPos) +
                          placeholder.label +
                          template.substring(endPos);
                        
                        setTemplate(newValue);
                      }}
                    >
                      <div className="font-mono text-sm">{placeholder.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{placeholder.description}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Emojis</h3>
                  <div className="grid grid-cols-6 gap-1">
                    {['🔥', '✨', '💰', '🛒', '⚡', '🎁', '📦', '✅', '⚠️', '💸', '🔴', '🟢'].map((emoji) => (
                      <button
                        key={emoji}
                        className="p-2 text-lg hover:bg-accent rounded-md"
                        onClick={() => {
                          const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
                          const startPos = textarea.selectionStart;
                          const endPos = textarea.selectionEnd;
                          
                          const newValue =
                            template.substring(0, startPos) +
                            emoji +
                            template.substring(endPos);
                          
                          setTemplate(newValue);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="p-6">
            <Card className="p-4 max-w-md mx-auto">
              <h3 className="font-medium mb-2 text-center">Visualização do WhatsApp</h3>
              <div className="border border-input rounded-lg p-4 bg-accent/30 whitespace-pre-wrap font-[system-ui] text-[15px]">
                {previewText.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('*') && line.endsWith('*') ? 'font-bold' : ''}>
                    {line.replace(/\*(.*?)\*/g, '<strong>$1</strong>')}
                  </p>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

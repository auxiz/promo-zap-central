
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Trash, PlusCircle } from 'lucide-react';
import { useTemplates, Template } from '@/hooks/useTemplates';
import { toast } from '@/components/ui/sonner';

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

export default function Mensagens() {
  const [activeTab, setActiveTab] = useState('editor');
  const [templateContent, setTemplateContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState(messageTemplateStyles[0]);
  
  const { templates, isLoading, saveTemplate, deleteTemplate } = useTemplates();
  
  // Reset form for new template
  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName('');
    setTemplateContent('');
    toast.info('Novo template iniciado', { 
      description: 'Preencha os campos e clique em Salvar Template'
    });
  };
  
  // Load selected template
  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setSelectedTemplateId(templateId);
      setTemplateName(selectedTemplate.name);
      setTemplateContent(selectedTemplate.content);
    }
  };
  
  // Save current template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Por favor, dê um nome ao template');
      return;
    }
    
    if (!templateContent.trim()) {
      toast.error('O conteúdo do template não pode estar vazio');
      return;
    }
    
    const templateData = {
      id: selectedTemplateId || undefined,
      name: templateName,
      content: templateContent
    };
    
    await saveTemplate(templateData);
  };
  
  // Delete current template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error('Nenhum template selecionado para excluir');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este template?')) {
      const success = await deleteTemplate(selectedTemplateId);
      if (success) {
        handleNewTemplate(); // Reset form after deletion
      }
    }
  };
  
  // Initialize with first template if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      handleTemplateSelect(templates[0].id);
    }
  }, [templates]);
  
  // For preview, replace placeholders with example values
  const previewText = templateContent
    .replace(/--produtodescricao--/g, 'Echo Dot (5ª Geração) | Smart speaker com Alexa')
    .replace(/--linklojaoficial--/g, 'https://amzn.to/exemplo')
    .replace(/--precoantigo--/g, '599,00')
    .replace(/--precorecorrencia--/g, '323,10');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mensagens</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNewTemplate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo
          </Button>
          {selectedTemplateId && (
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Template
          </Button>
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
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label htmlFor="template-name" className="block text-sm font-medium mb-1">
                      Nome do Template
                    </label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Nome do Template"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor="template-select" className="block text-sm font-medium mb-1">
                      Templates Salvos
                    </label>
                    <Select
                      value={selectedTemplateId || ''}
                      onValueChange={handleTemplateSelect}
                      disabled={isLoading || templates.length === 0}
                    >
                      <SelectTrigger id="template-select">
                        <SelectValue placeholder="Selecione um template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="template-content" className="block text-sm font-medium mb-1">
                    Conteúdo do Template
                  </label>
                  <Textarea
                    id="template-content"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    className="w-full h-64 px-3 py-2 font-mono text-sm resize-y"
                    placeholder="Digite o conteúdo do seu template aqui..."
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
                          templateContent.substring(0, startPos) +
                          placeholder.label +
                          templateContent.substring(endPos);
                        
                        setTemplateContent(newValue);
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
                            templateContent.substring(0, startPos) +
                            emoji +
                            templateContent.substring(endPos);
                          
                          setTemplateContent(newValue);
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
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Template, useTemplates } from '@/hooks/useTemplates';
import { toast } from '@/components/ui/sonner';

// Templates padrão
export const defaultTemplates = {
  normal: `🔥 SUPER OFERTA 🔥
--produtodescricao--
🛒 COMPRAR: --linklojaoficial--
⚠️ Promoção sujeita a alteração`,
  desconto: `❌ DE: --precoantigo--
🎉 POR: --precocomdesconto--
🛒 COMPRAR: --linklojaoficial--`,
  recorrencia: `🔁 PLANO RECORRENTE
--produtodescricao--
📅 A PARTIR DE: --precorecorrencia--/mês
🛒 COMPRAR: --linklojaoficial--`,
  descontoRecorrencia: `❌ DE: --precoantigo--
🎉 POR: --precocomdesconto--
ou 🔁 A PARTIR DE: --precorecorrencia--/mês
🛒 COMPRAR: --linklojaoficial--`,
};

export type MessageTemplateStyle = {
  id: string;
  name: string;
  description: string;
};

export const messageTemplateStyles: MessageTemplateStyle[] = [
  { id: 'normal', name: 'Normal', description: 'Template padrão para produtos' },
  { id: 'desconto', name: 'Desconto', description: 'Template destacando descontos' },
  { id: 'recorrencia', name: 'Recorrência', description: 'Template para produtos com recorrência' },
  { id: 'descontoRecorrencia', name: 'Desconto+Recorrência', description: 'Template para produtos com desconto e recorrência' },
];

export const messagePlaceholders = [
  { id: 'produtodescricao', label: '--produtodescricao--', description: 'Nome e descrição do produto' },
  { id: 'linklojaoficial', label: '--linklojaoficial--', description: 'Link para a loja oficial' },
  { id: 'precoantigo', label: '--precoantigo--', description: 'Preço antigo/original' },
  { id: 'precocomdesconto', label: '--precocomdesconto--', description: 'Preço com desconto' },
  { id: 'precorecorrencia', label: '--precorecorrencia--', description: 'Preço com recorrência' },
];

export function useTemplateUtils() {
  const [activeTab, setActiveTab] = useState('editor');
  const [templateContent, setTemplateContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
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

  // Carrega um template padrão
  const loadDefaultTemplate = (templateType: keyof typeof defaultTemplates) => {
    setTemplateContent(defaultTemplates[templateType]);
    setTemplateName(messageTemplateStyles.find(style => style.id === templateType)?.name || '');
  };
  
  // Initialize with first template if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      handleTemplateSelect(templates[0].id);
    }
  }, [templates]);
  
  // For preview, replace placeholders with example values
  const getPreviewText = () => {
    return templateContent
      .replace(/--produtodescricao--/g, 'Echo Dot (5ª Geração) | Smart speaker com Alexa')
      .replace(/--linklojaoficial--/g, 'https://amzn.to/exemplo')
      .replace(/--precoantigo--/g, 'R$ 599,00')
      .replace(/--precocomdesconto--/g, 'R$ 399,00')
      .replace(/--precorecorrencia--/g, 'R$ 323,10');
  };

  return {
    activeTab,
    setActiveTab,
    templateContent,
    setTemplateContent,
    templateName,
    setTemplateName,
    selectedTemplateId,
    templates,
    isLoading,
    handleNewTemplate,
    handleTemplateSelect,
    handleSaveTemplate,
    handleDeleteTemplate,
    loadDefaultTemplate,
    getPreviewText,
  };
}

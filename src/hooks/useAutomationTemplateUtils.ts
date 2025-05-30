
import { useState, useEffect } from 'react';
import { Template, useTemplates } from '@/hooks/useTemplates';
import { toast } from '@/components/ui/sonner';

// Templates padrão otimizados para automação
export const automationTemplateStyles = {
  ofertaDetectada: `🤖 OFERTA DETECTADA AUTOMATICAMENTE 🤖
📦 --produtodescricao--
💰 Preço: --precopromocional--
🛒 LINK CONVERTIDO: --linkafiliado--
⏰ Detectado em: --datahorario--
📍 Origem: --grupoorigem--`,
  
  linkConvertido: `🔗 LINK CONVERTIDO - PROMOÇÃO 🔗
--produtodescricao--
❌ De: --precooriginal--
✅ Por: --precopromocional--
💸 Economia: --desconto--%
🛍️ Compre aqui: --linkafiliado--
🏪 Loja: --nomeloja--`,
  
  botOportunidade: `🎯 BOT: NOVA OPORTUNIDADE 🎯
--produtodescricao--
💵 Apenas: --precopromocional--
🔥 APROVEITE: --linkafiliado--
📊 Detectado automaticamente em --grupoorigem--`,
  
  monitoramentoDesconto: `📢 MONITORAMENTO: DESCONTO ENCONTRADO 📢
🏷️ --produtodescricao--
💰 Era: --precooriginal-- | Agora: --precopromocional--
📉 --desconto--% OFF
🛒 GARANTIR: --linkafiliado--
🕒 --datahorario-- | Via: --nomeloja--`
};

export type AutomationTemplateStyle = {
  id: string;
  name: string;
  description: string;
};

export const automationTemplateOptions: AutomationTemplateStyle[] = [
  { id: 'ofertaDetectada', name: 'Oferta Detectada', description: 'Template para ofertas detectadas automaticamente' },
  { id: 'linkConvertido', name: 'Link Convertido', description: 'Template destacando conversão de link' },
  { id: 'botOportunidade', name: 'Nova Oportunidade', description: 'Template para oportunidades encontradas pelo bot' },
  { id: 'monitoramentoDesconto', name: 'Desconto Encontrado', description: 'Template para descontos detectados' },
];

export const automationPlaceholders = [
  { id: 'produtodescricao', label: '--produtodescricao--', description: 'Título/descrição extraída automaticamente do link' },
  { id: 'linkafiliado', label: '--linkafiliado--', description: 'Link convertido pelo bot para afiliado' },
  { id: 'precooriginal', label: '--precooriginal--', description: 'Preço original detectado' },
  { id: 'precopromocional', label: '--precopromocional--', description: 'Preço promocional detectado' },
  { id: 'nomeloja', label: '--nomeloja--', description: 'Nome da loja/plataforma (Shopee, Amazon, etc.)' },
  { id: 'desconto', label: '--desconto--', description: 'Percentual de desconto calculado automaticamente' },
  { id: 'datahorario', label: '--datahorario--', description: 'Data/hora da detecção pelo bot' },
  { id: 'grupoorigem', label: '--grupoorigem--', description: 'Nome do grupo onde foi detectado o link' },
];

export function useAutomationTemplateUtils() {
  const [activeTab, setActiveTab] = useState('editor');
  const [templateContent, setTemplateContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeStyleId, setActiveStyleId] = useState<string>('ofertaDetectada');
  
  const { templates, isLoading, saveTemplate, deleteTemplate } = useTemplates();
  
  // Reset form for new template
  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName('');
    setTemplateContent('');
    toast.info('Novo template iniciado', { 
      description: 'Configure o template que será usado pelo bot automático'
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
    
    try {
      await saveTemplate(templateData);
      toast.success('Template salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar template', { 
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      });
    }
  };
  
  // Delete current template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error('Nenhum template selecionado para excluir');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este template?')) {
      try {
        const success = await deleteTemplate(selectedTemplateId);
        if (success) {
          handleNewTemplate();
          toast.success('Template excluído com sucesso');
        }
      } catch (error) {
        toast.error('Erro ao excluir template', { 
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
        });
      }
    }
  };

  // Carrega um template padrão de automação
  const loadAutomationTemplate = (templateType: keyof typeof automationTemplateStyles) => {
    setTemplateContent(automationTemplateStyles[templateType]);
    setTemplateName(automationTemplateOptions.find(style => style.id === templateType)?.name || '');
    setActiveStyleId(templateType);
    toast.success(`Template "${automationTemplateOptions.find(style => style.id === templateType)?.name}" aplicado`);
  };
  
  // Initialize with first template if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      handleTemplateSelect(templates[0].id);
    }
  }, [templates]);
  
  // For preview with automation context
  const getAutomationPreviewText = () => {
    return templateContent
      .replace(/--produtodescricao--/g, 'Echo Dot (5ª Geração) | Smart speaker com Alexa - Cor Preta')
      .replace(/--linkafiliado--/g, 'https://shopee.com.br/aff_link?offer_id=123456')
      .replace(/--precooriginal--/g, 'R$ 599,00')
      .replace(/--precopromocional--/g, 'R$ 399,00')
      .replace(/--nomeloja--/g, 'Shopee')
      .replace(/--desconto--/g, '33')
      .replace(/--datahorario--/g, new Date().toLocaleString('pt-BR'))
      .replace(/--grupoorigem--/g, 'Ofertas Tech Brasil');
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
    loadAutomationTemplate,
    getAutomationPreviewText,
    activeStyleId,
  };
}

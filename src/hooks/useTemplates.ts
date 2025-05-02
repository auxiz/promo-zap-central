
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

// Utiliza a mesma base de API que o restante do aplicativo
const API_BASE = 'http://168.231.98.177:4000';

export interface Template {
  id: string;
  name: string;
  content: string;
}

// Default templates that will be used as fallback if API call fails
export const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'OFERTA RELÂMPAGO',
    content: `🔥 OFERTA RELÂMPAGO 🔥
--produtodescricao--
❌ De: --precoantigo--
🎉 Por: --precocomdesconto--
🛒 COMPRAR: --linklojaoficial--`
  },
  {
    id: '2',
    name: 'ESTOQUE LIMITADO',
    content: `⚡️ ESTOQUE LIMITADO ⚡️
--produtodescricao--
Só por: --precocomdesconto--
🛒 Link: --linklojaoficial--`
  },
  {
    id: '3',
    name: 'NOVA CHEGADA',
    content: `💥 NOVA CHEGADA 💥
--produtodescricao--
Apenas: --precocomdesconto--
📦 Frete grátis!
🛒 Comprar: --linklojaoficial--`
  },
  {
    id: '4',
    name: 'SUPER DESCONTO',
    content: `🎁 SUPER DESCONTO 🎁
--produtodescricao--
❌ De: --precoantigo--
➡️ Por: --precocomdesconto--
🛒 Confira: --linklojaoficial--`
  },
  {
    id: '5',
    name: 'SUPER OFERTA',
    content: `⭐ SUPER OFERTA ⭐
--produtodescricao--
🔖 Preço especial: --precocomdesconto--
🛒 Adquira em: --linklojaoficial--`
  }
];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/api/templates`);
      
      // Check if the response data is an empty array
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log('API returned empty templates array, using fallback templates');
        setTemplates(defaultTemplates);
      } else {
        setTemplates(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMessage);
      console.log('Error fetching templates, using fallback templates:', errorMessage);
      
      // Use fallback templates on error
      setTemplates(defaultTemplates);
      
      toast.error('Erro ao carregar templates', {
        description: `Usando templates padrão. (${errorMessage})`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: Omit<Template, 'id'> & { id?: string }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/templates`, template);
      
      if (response.data.success) {
        toast.success('Template salvo com sucesso');
        fetchTemplates(); // Refresh the templates list
        return true;
      } else {
        throw new Error(response.data.error || 'Erro ao salvar template');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar template';
      toast.error('Erro ao salvar template', {
        description: errorMessage
      });
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/templates/${id}`);
      
      if (response.data.success) {
        toast.success('Template excluído com sucesso');
        fetchTemplates(); // Refresh the templates list
        return true;
      } else {
        throw new Error(response.data.error || 'Erro ao excluir template');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir template';
      toast.error('Erro ao excluir template', {
        description: errorMessage
      });
      return false;
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    saveTemplate,
    deleteTemplate
  };
}

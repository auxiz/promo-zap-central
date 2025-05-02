
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

export interface Template {
  id: string;
  name: string;
  content: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:4000/api/templates');
      setTemplates(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMessage);
      toast.error('Erro ao carregar templates', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: Omit<Template, 'id'> & { id?: string }) => {
    try {
      const response = await axios.post('http://localhost:4000/api/templates', template);
      
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
      const response = await axios.delete(`http://localhost:4000/api/templates/${id}`);
      
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

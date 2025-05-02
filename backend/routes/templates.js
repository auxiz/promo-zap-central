
const express = require('express');
const router = express.Router();

// Default templates that will be used as fallback
const defaultTemplates = [
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

// In-memory storage for templates (in a real app, this would be a database)
let templates = [...defaultTemplates];

// Get all templates
router.get('/', (req, res) => {
  // Always return something - if templates array is empty, return default templates
  if (templates.length === 0) {
    templates = [...defaultTemplates];
  }
  res.json(templates);
});

// Create or update a template
router.post('/', (req, res) => {
  try {
    const { id, name, content } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ success: false, error: 'Nome e conteúdo são obrigatórios' });
    }

    if (id) {
      // Update existing template
      const index = templates.findIndex(template => template.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Template não encontrado' });
      }
      
      templates[index] = { id, name, content };
      res.json({ success: true });
    } else {
      // Create new template
      const newId = String(Date.now());
      templates.push({ id: newId, name, content });
      res.json({ success: true, id: newId });
    }
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar template' });
  }
});

// Delete a template
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = templates.length;
    
    templates = templates.filter(template => template.id !== id);
    
    if (templates.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Template não encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir template' });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();

// In-memory storage for templates (in a real app, this would be a database)
let templates = [
  {
    id: '1',
    name: 'SUPER OFERTA',
    content: `🔥 *SUPER OFERTA* 🔥

--produtodescricao--

✅ De: ~R$ --precoantigo--~
✅ Por apenas: *R$ 39,90*

🛒 COMPRAR: --linklojaoficial--

⚠️ *ESTOQUE LIMITADO*
📦 Frete Grátis`
  },
  {
    id: '2',
    name: 'NOVA CHEGADA',
    content: `🆕 *ACABOU DE CHEGAR* 🆕

--produtodescricao--

🔸 Lançamento exclusivo!
🔸 Preço de lançamento: *R$ 49,90*

🛒 COMPRAR: --linklojaoficial--

📦 Frete Grátis para todo Brasil
⏱️ *PROMOÇÃO POR TEMPO LIMITADO*`
  },
  {
    id: '3',
    name: 'OFERTA RELÂMPAGO',
    content: `⚡ *OFERTA RELÂMPAGO* ⚡

--produtodescricao--

⏰ *APENAS HOJE*
✅ De: ~R$ --precoantigo--~
✅ Por: *R$ 29,90*

🛒 COMPRAR AGORA: --linklojaoficial--

⚠️ *ÚLTIMAS UNIDADES*`
  },
  {
    id: '4',
    name: 'ÚLTIMA CHANCE',
    content: `⏰ *ÚLTIMA CHANCE* ⏰

--produtodescricao--

🔴 PROMOÇÃO ACABA EM 24 HORAS!
✅ De: ~R$ --precoantigo--~
✅ Por apenas: *R$ 44,90*

🛒 GARANTIR AGORA: --linklojaoficial--

📦 Frete Grátis para todo Brasil`
  }
];

// Get all templates
router.get('/', (req, res) => {
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

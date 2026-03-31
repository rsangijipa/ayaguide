# Integração de Templates Pré-definidos - AyaGuide

## 📋 Visão Geral

Este documento descreve como integrar os 5 templates pré-definidos no seu aplicativo AyaGuide. Os templates foram criados para objetivos específicos e podem ser carregados com um clique.

---

## 🎯 Os 5 Templates Pré-definidos

### 1. **💚 Alívio da Ansiedade**
- **Chakra**: Coração (Anahata) - 639 Hz
- **Objetivo**: Acalmar a mente e reduzir palpitações
- **Elementos principais**: Água do Rio, Vento Suave, Floresta Tropical, Tigela Cantante
- **Melhor para**: Momentos de ansiedade, ataques de pânico, tensão emocional

### 2. **🎯 Foco Profundo**
- **Chakra**: Plexo Solar (Manipura) - 528 Hz
- **Objetivo**: Aumentar concentração e produtividade mental
- **Elementos principais**: Cachoeira, Chuva Forte, Vento Suave, Pássaros, Fogo
- **Melhor para**: Trabalho criativo, estudos, tarefas que exigem foco

### 3. **🧘 Meditação Profunda**
- **Chakra**: Coroa (Sahasrara) - 963 Hz
- **Objetivo**: Alcançar estados contemplativos e espirituais
- **Elementos principais**: Vento, Grilos, Folhas, Sinos, Gongo, Tigela
- **Melhor para**: Práticas meditativas, conexão espiritual, transcendência

### 4. **😴 Sono Restaurador**
- **Chakra**: Raiz (Muladhara) - 396 Hz
- **Objetivo**: Induzir sono profundo e restaurador
- **Elementos principais**: Ondas do Oceano, Chuva, Grilos, Gongo, Lava
- **Melhor para**: Adormecer, sono profundo, descanso restaurador

### 5. **🎨 Fluxo Criativo**
- **Chakra**: Sacral (Svadhisthana) - 417 Hz
- **Objetivo**: Desbloquear criatividade e inspiração
- **Elementos principais**: Água do Rio, Cachoeira, Pássaros, Floresta, Sinos, Tigela
- **Melhor para**: Artistas, criadores, desbloqueio criativo

---

## 📁 Arquivos Criados

### 1. **`lib/presetTemplates.ts`**
Define todos os 5 templates pré-definidos com:
- Configurações de chakra e volume
- Volumes de cada elemento natural
- Metadados descritivos
- Funções auxiliares

### 2. **`components/PresetTemplates.tsx`**
Componente React que exibe:
- Lista expansível de templates
- Informações detalhadas de cada template
- Botão para carregar template
- Visual interativo com ícones

---

## 🔧 Como Integrar

### Passo 1: Importar no Sidebar

Abra `components/Sidebar.tsx` e adicione:

```typescript
import { PresetTemplates } from './PresetTemplates';
```

### Passo 2: Adicionar o Componente

No arquivo `Sidebar.tsx`, adicione o componente `PresetTemplates` **antes** da seção de "Modelos Sagrados":

```typescript
{/* Divider */}
<div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

{/* Preset Templates Section */}
<PresetTemplates 
  onLoadTemplate={onLoadTemplate}
  activeChakra={activeChakra}
/>

{/* Divider */}
<div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

{/* Templates Section */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
  className="space-y-4 mt-auto"
>
  {/* ... resto do código ... */}
</motion.div>
```

### Passo 3: Verificar Imports

Certifique-se de que os seguintes imports estão presentes em `Sidebar.tsx`:

```typescript
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Info, Heart, Zap, Moon, Palette } from 'lucide-react';
```

---

## 💾 Como Funciona

### Fluxo de Carregamento

```
1. Usuário clica em um template pré-definido
   ↓
2. PresetTemplates.tsx chama onLoadTemplate()
   ↓
3. page.tsx recebe o template e chama loadTemplate()
   ↓
4. loadTemplate() atualiza:
   - activeChakra
   - ambientVolumes
   - chakraVolume
   - inicia reprodução
```

### Estrutura de um Template

```typescript
{
  id: 'anxiety-relief',
  name: 'Alívio da Ansiedade',
  objective: 'Acalmar a mente e reduzir palpitações',
  description: 'Combina o chakra cardíaco com sons aquáticos...',
  emoji: '💚',
  chakraId: 'heart',           // ID do chakra
  chakraVolume: 0.6,           // Volume do chakra (0-1)
  ambientVolumes: {            // Volumes dos elementos
    water: 0.5,
    ocean: 0.4,
    waterfall: 0.0,
    // ... resto dos elementos
  }
}
```

---

## 🎛️ Personalizando Templates

### Modificar um Template Existente

Edite `lib/presetTemplates.ts` e ajuste os volumes:

```typescript
{
  id: 'anxiety-relief',
  // ... outros campos ...
  ambientVolumes: {
    water: 0.5,      // ← Ajuste aqui
    ocean: 0.4,      // ← Ou aqui
    // ...
  }
}
```

### Adicionar um Novo Template

1. Adicione um novo objeto em `PRESET_TEMPLATES`:

```typescript
{
  id: 'new-template',
  name: 'Novo Template',
  objective: 'Descrição do objetivo',
  description: 'Descrição detalhada',
  emoji: '✨',
  chakraId: 'heart',
  chakraVolume: 0.6,
  ambientVolumes: {
    // ... configure os volumes
  }
}
```

2. Adicione informações em `PRESET_TEMPLATES_INFO`:

```typescript
'new-template': {
  name: 'Novo Template',
  icon: '✨',
  chakra: 'Chakra Name',
  frequency: 'XXX Hz',
  bestFor: 'Descrição de uso',
  keyElements: ['Elemento 1', 'Elemento 2', ...],
}
```

3. Adicione ícone em `PRESET_ICONS` (se necessário):

```typescript
const PRESET_ICONS = {
  // ...
  'new-template': YourIcon,
};
```

---

## 📊 Tabela de Volumes Recomendados

### Escala de Volume
- **0.0**: Mudo (elemento desativado)
- **0.2-0.3**: Muito baixo (fundo)
- **0.4-0.5**: Baixo-médio (suporte)
- **0.6-0.7**: Médio (principal)
- **0.8-1.0**: Alto (dominante)

### Recomendações por Objetivo

#### Ansiedade
- Chakra: 0.6 (médio)
- Elementos: 0.3-0.5 (suporte)
- Foco: Sons calmantes

#### Foco
- Chakra: 0.7 (médio-alto)
- Elementos: 0.3-0.5 (variado)
- Foco: Sons estruturados

#### Meditação
- Chakra: 0.8 (alto)
- Elementos: 0.5-0.7 (harmônicas)
- Foco: Sons místicos

#### Sono
- Chakra: 0.5 (baixo-médio)
- Elementos: 0.4-0.6 (rítmicos)
- Foco: Sons baixos

#### Criatividade
- Chakra: 0.7 (médio-alto)
- Elementos: 0.4-0.6 (dinâmicos)
- Foco: Sons inspiradores

---

## 🎨 Customização Visual

### Cores dos Templates

Cada template usa o emoji como identificador visual. Para adicionar cores personalizadas, edite `PresetTemplates.tsx`:

```typescript
const PRESET_COLORS = {
  'anxiety-relief': '#4ade80',      // Verde
  'deep-focus': '#facc15',           // Amarelo
  'deep-meditation': '#c084fc',      // Roxo
  'restful-sleep': '#60a5fa',        // Azul
  'creative-flow': '#fb923c',        // Laranja
};
```

---

## 🔄 Integração com localStorage

Os templates pré-definidos são **carregados dinamicamente** e não são salvos em localStorage. Quando o usuário carrega um template pré-definido, ele é convertido para o formato de salvamento:

```typescript
// Antes (pré-definido)
{
  id: 'anxiety-relief',
  name: 'Alívio da Ansiedade',
  // ...
}

// Depois (salvo)
{
  id: 'preset-anxiety-relief',
  name: '💚 Alívio da Ansiedade',
  isPreset: true,
  // ...
}
```

---

## 🐛 Troubleshooting

### Problema: Templates não aparecem
**Solução**: Verifique se `PresetTemplates` foi importado e adicionado ao Sidebar

### Problema: Volumes não estão corretos
**Solução**: Verifique se os IDs dos elementos em `ambientVolumes` correspondem aos IDs em `AMBIENT_ELEMENTS`

### Problema: Chakra não muda
**Solução**: Verifique se `chakraId` corresponde a um chakra válido em `CHAKRAS`

---

## 📝 Elementos Disponíveis

### IDs Válidos para `ambientVolumes`

```
water, ocean, waterfall,
rain, thunder, wind, storm,
birds, forest, crickets, leaves,
bells, gong, singing_bowl,
fire, lava
```

### Chakras Válidos

```
root, sacral, solar, heart, throat, thirdeye, crown
```

---

## 🚀 Próximos Passos

1. Integre o componente `PresetTemplates` no Sidebar
2. Teste cada template para verificar se os volumes estão corretos
3. Personalize os templates conforme necessário
4. Adicione novos templates para outros objetivos

---

## 📞 Referência Rápida

### Carregar um Template Programaticamente

```typescript
import { getPresetTemplate, presetToSavedTemplate } from '@/lib/presetTemplates';

const preset = getPresetTemplate('anxiety-relief');
const savedTemplate = presetToSavedTemplate(preset);
onLoadTemplate(savedTemplate);
```

### Obter Todos os Templates

```typescript
import { getAllPresetTemplates } from '@/lib/presetTemplates';

const allPresets = getAllPresetTemplates();
```

---

## ✅ Checklist de Integração

- [ ] Arquivo `lib/presetTemplates.ts` criado
- [ ] Componente `components/PresetTemplates.tsx` criado
- [ ] Importação adicionada ao `Sidebar.tsx`
- [ ] Componente adicionado ao layout do Sidebar
- [ ] Testado carregamento de cada template
- [ ] Verificados volumes de cada elemento
- [ ] Testada integração com chakras
- [ ] Verificada persistência em localStorage

---

Pronto para usar! 🎉

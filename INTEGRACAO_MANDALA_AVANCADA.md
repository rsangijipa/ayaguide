# 🎨 Mandala Avançada - Guia de Integração

## 📋 Visão Geral

A nova **Mandala Avançada** é um sistema de cores dinâmico e reativo que:

✅ **Múltiplas tonalidades**: Cada chakra tem 6 variações de cor (primária, clara, média, escura, pálida, vibrante)
✅ **Influência de elementos**: Cada som ativado adiciona cores secundárias à mandala
✅ **Partículas dinâmicas**: As partículas mudam de cor baseado nos sons ativos
✅ **Mistura de cores**: Quando múltiplos sons estão ativos, as cores se misturam
✅ **Indicador de temperatura**: Mostra se você está em sons quentes (fogo, lava) ou frios (água, vento)

---

## 🎯 Como Funciona

### Exemplo 1: Apenas Chakra Verde (Coração)
```
Mandala: Verde em todas as tonalidades
├─ Centro: Verde vibrante
├─ Pétalas: Verde claro, médio, escuro
├─ Anéis: Verde pálido
└─ Partículas: Brancas (sem elementos)
```

### Exemplo 2: Chakra Verde + Fogo (Quente)
```
Mandala: Verde com pontos de Vermelho/Laranja
├─ Centro: Verde + Vermelho = Amarelo/Laranja
├─ Pétalas: Múltiplas tonalidades de verde + vermelho
├─ Anéis: Verde pálido com toques quentes
├─ Partículas: Vermelhas, laranjas, amarelas
└─ Indicador: 🔥 Quente (em destaque)
```

### Exemplo 3: Chakra Verde + Água + Vento (Frio)
```
Mandala: Verde com pontos de Azul/Ciano
├─ Centro: Verde + Azul = Ciano/Turquesa
├─ Pétalas: Múltiplas tonalidades de verde + azul
├─ Anéis: Verde pálido com toques frios
├─ Partículas: Azuis, ciano, brancas
└─ Indicador: ❄️ Frio (em destaque)
```

### Exemplo 4: Chakra Verde + Fogo + Água (Misto)
```
Mandala: Verde colorido com Vermelho E Azul
├─ Centro: Verde + Vermelho + Azul = Cores mistas
├─ Pétalas: Múltiplas tonalidades com ambas cores
├─ Anéis: Verde pálido com toques quentes E frios
├─ Partículas: Vermelhas, azuis, verdes misturadas
├─ Indicador: 🔥 Quente + ❄️ Frio (ambos em destaque)
└─ Efeito: Mandala muito colorida e dinâmica
```

---

## 📦 Arquivos Criados

### 1. **`lib/colorSystem.ts`** ⭐
Sistema completo de cores com:
- ✅ Paletas de 6 tonalidades para cada chakra
- ✅ Influências de cores para 16 elementos naturais
- ✅ Função `calculateMandalaColor()` para misturar cores
- ✅ Função `generateParticleColors()` para partículas
- ✅ Função `getTemperatureBalance()` para classificar sons
- ✅ Conversão HSL → RGBA

### 2. **`components/MandalaAdvanced.tsx`** ⭐
Componente React com:
- ✅ Canvas para desenho de alta performance
- ✅ 6 camadas de desenho (círculos, pétalas, triângulos, anel, centro, pulsação)
- ✅ Sistema de partículas dinâmicas
- ✅ Múltiplas tonalidades em cada camada
- ✅ Resposta em tempo real ao áudio
- ✅ Indicadores visuais de temperatura

---

## 🔧 Como Integrar

### Passo 1: Copie os arquivos
```
lib/colorSystem.ts → seu projeto
components/MandalaAdvanced.tsx → seu projeto
```

### Passo 2: Substitua a Mandala no page.tsx

**Antes:**
```typescript
import { Mandala } from '@/components/Mandala';

// ...

<Mandala
  hue={activeChakra.hue}
  isPlaying={isPlaying}
  chakraId={activeChakra.id}
/>
```

**Depois:**
```typescript
import { MandalaAdvanced } from '@/components/MandalaAdvanced';

// ...

<MandalaAdvanced
  hue={activeChakra.hue}
  isPlaying={isPlaying}
  chakraId={activeChakra.id}
  ambientVolumes={ambientVolumes}
  audioLevel={audioLevel}
/>
```

### Passo 3: Certifique-se de que `audioLevel` está disponível

Verifique se você tem `audioLevel` no estado do page.tsx:

```typescript
const [audioLevel, setAudioLevel] = useState(0);

// Atualizar audioLevel baseado no áudio
useEffect(() => {
  const engine = getAudioEngine();
  if (!engine) return;

  const getLevels = () => {
    engine.getFrequencyData(freqDataRef.current);
    setAudioLevel(freqDataRef.current.reduce((a, b) => a + b, 0) / 32 / 255);
    requestAnimationFrame(getLevels);
  };
  
  if (isChakraOn || Object.values(ambientVolumes).some(v => v > 0)) {
    requestAnimationFrame(getLevels);
  }
}, [isChakraOn, ambientVolumes]);
```

---

## 🎨 Paletas de Cores

### Cada Chakra tem 6 Tonalidades

| Tonalidade | Descrição | Uso |
|-----------|-----------|-----|
| **primary** | Cor principal saturada | Centro da mandala |
| **light** | Cor clara | Pétalas externas |
| **medium** | Cor média | Pétalas intermediárias |
| **dark** | Cor escura | Pétalas internas |
| **pale** | Cor pálida/dessaturada | Anéis suaves |
| **vibrant** | Cor muito saturada | Efeitos especiais |

---

## 🌡️ Influências de Elementos

### Elementos Quentes (Warm)
- 🔥 **Fogo**: Vermelho vibrante (hue: 15°)
- 🌋 **Lava**: Laranja quente (hue: 25°)

### Elementos Frios (Cool)
- 💧 **Água**: Azul (hue: 200°)
- 🌊 **Oceano**: Azul profundo (hue: 210°)
- 💦 **Cachoeira**: Azul claro (hue: 190°)
- 🌧️ **Chuva**: Azul cinzento (hue: 220°)
- ⚡ **Trovão**: Roxo azulado (hue: 240°)
- 🌪️ **Tempestade**: Azul cinzento escuro (hue: 230°)
- 🌬️ **Vento**: Cinza neutro (hue: 0°)
- 🐦 **Pássaros**: Verde (hue: 120°)
- 🌲 **Floresta**: Verde escuro (hue: 100°)
- 🦗 **Grilos**: Verde médio (hue: 110°)
- 🍃 **Folhas**: Verde claro (hue: 130°)
- 🔔 **Sinos**: Roxo claro (hue: 280°)
- 🥁 **Gongo**: Roxo escuro (hue: 270°)
- 🍵 **Tigela**: Roxo médio (hue: 290°)

---

## 💡 Exemplos de Uso

### Exemplo 1: Ativar apenas Fogo
```typescript
ambientVolumes = {
  fire: 0.8,
  // todos outros: 0
}

// Resultado:
// Mandala verde (chakra) + pontos vermelhos (fogo)
// Partículas: Vermelhas e laranjas
// Indicador: 🔥 Quente
```

### Exemplo 2: Ativar Água + Vento
```typescript
ambientVolumes = {
  water: 0.6,
  wind: 0.4,
  // todos outros: 0
}

// Resultado:
// Mandala verde (chakra) + tons azuis (água)
// Partículas: Azuis e brancas
// Indicador: ❄️ Frio
```

### Exemplo 3: Ativar Fogo + Água (Misto)
```typescript
ambientVolumes = {
  fire: 0.5,
  water: 0.5,
  // todos outros: 0
}

// Resultado:
// Mandala verde + vermelho + azul = cores mistas
// Partículas: Vermelhas, azuis, verdes
// Indicador: 🔥 Quente + ❄️ Frio
```

---

## 🎛️ Customização

### Ajustar Intensidade de Influência

Edite `lib/colorSystem.ts`:

```typescript
export const ELEMENT_COLOR_INFLUENCES: Record<string, ElementColorInfluence> = {
  fire: {
    // ...
    intensity: 0.5,  // ← Aumentar para mais influência
  },
};
```

### Adicionar Novo Elemento

1. Edite `lib/colorSystem.ts`:

```typescript
export const ELEMENT_COLOR_INFLUENCES: Record<string, ElementColorInfluence> = {
  // ... elementos existentes ...
  
  new_element: {
    elementId: 'new_element',
    hue: 150,              // Escolha uma matiz
    saturation: 70,        // 0-100
    lightness: 50,         // 0-100
    temperature: 'warm',   // 'warm' | 'cool' | 'neutral'
    intensity: 0.3,        // 0-1
  },
};
```

2. Nenhuma mudança necessária em `MandalaAdvanced.tsx` (funciona automaticamente)

---

## 📊 Tabela de Influências

| Elemento | Hue | Sat | Light | Temp | Intensity |
|----------|-----|-----|-------|------|-----------|
| Água | 200 | 70 | 50 | cool | 0.30 |
| Oceano | 210 | 80 | 45 | cool | 0.35 |
| Cachoeira | 190 | 60 | 55 | cool | 0.25 |
| Chuva | 220 | 20 | 60 | cool | 0.20 |
| Trovão | 240 | 40 | 50 | cool | 0.40 |
| Vento | 0 | 0 | 70 | neutral | 0.15 |
| Tempestade | 230 | 50 | 40 | cool | 0.50 |
| Pássaros | 120 | 60 | 55 | cool | 0.30 |
| Floresta | 100 | 70 | 40 | cool | 0.35 |
| Grilos | 110 | 50 | 45 | cool | 0.25 |
| Folhas | 130 | 60 | 50 | cool | 0.20 |
| Sinos | 280 | 70 | 60 | cool | 0.30 |
| Gongo | 270 | 80 | 50 | cool | 0.40 |
| Tigela | 290 | 60 | 55 | cool | 0.35 |
| Fogo | 15 | 90 | 55 | warm | 0.50 |
| Lava | 25 | 85 | 45 | warm | 0.45 |

---

## 🔍 Recursos Especiais

### Camadas de Desenho
1. **Círculos concêntricos**: Gradientes com múltiplas tonalidades
2. **Pétalas**: 8 pétalas com cores alternadas
3. **Triângulos**: Decorativos com cores influenciadas
4. **Anel de brilho**: Efeito externo com glow
5. **Centro**: Múltiplas tonalidades em gradiente
6. **Pulsação**: Responde ao nível de áudio em tempo real

### Partículas Dinâmicas
- Criadas baseado no nível de áudio
- Cores baseadas em elementos ativos
- Movimento com gravidade suave
- Fade-out suave ao desaparecer

### Indicadores
- 🔥 **Quente**: Mostrado quando há elementos quentes ativos
- ❄️ **Frio**: Mostrado quando há elementos frios ativos
- Ambos: Mostrados quando há mistura de temperaturas

---

## ⚙️ Performance

### Otimizações
- ✅ Canvas em vez de SVG (melhor performance)
- ✅ Partículas limitadas a 50 máximo
- ✅ Cálculos de cor em useMemo
- ✅ Limpeza de canvas com fade (não limpa completamente)
- ✅ RequestAnimationFrame para suave 60fps

### Requisitos
- Navegador moderno com suporte a Canvas
- GPU para melhor performance
- Mínimo 2GB RAM

---

## 🐛 Troubleshooting

### Problema: Cores não mudam com elementos
**Solução**: Verifique se `ambientVolumes` está sendo passado corretamente

### Problema: Partículas não aparecem
**Solução**: Verifique se `audioLevel > 0` e há elementos ativos

### Problema: Performance ruim
**Solução**: Reduza `particleCount` em `generateParticleColors()`

### Problema: Cores muito saturadas
**Solução**: Ajuste `saturation` em `ELEMENT_COLOR_INFLUENCES`

---

## 📝 Notas Importantes

1. **HSL vs RGB**: Sistema usa HSL internamente para melhor controle de cores
2. **Influência cumulativa**: Múltiplos elementos se misturam proporcionalmente
3. **Temperatura**: Determina se a mandala fica mais quente ou fria
4. **Partículas**: Sempre refletem os elementos ativos em tempo real
5. **Performance**: Otimizado para 60fps em navegadores modernos

---

## 🚀 Próximos Passos

1. ✅ Integre `MandalaAdvanced.tsx` no seu projeto
2. ✅ Teste com diferentes combinações de elementos
3. ✅ Ajuste intensidades conforme necessário
4. ✅ Customize cores para seus elementos personalizados
5. ✅ Monitore performance em dispositivos mais lentos

---

## ✨ Resultado Final

Uma mandala que:
- 🎨 Muda de cor dinamicamente baseado em sons ativos
- 🌡️ Mostra temperatura (quente/frio) visualmente
- ✨ Tem múltiplas tonalidades para profundidade
- 🎆 Partículas coloridas que respondem ao áudio
- 📱 Funciona suavemente em 60fps

Pronto para usar! 🎉

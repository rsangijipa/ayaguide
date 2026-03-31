# 🎨 Mandala Elegante - Guia de Integração

## 📋 Visão Geral

A **Mandala Elegante** é um componente visual refinado que:

✅ **Design sofisticado**: 9 camadas harmoniosamente dispostas
✅ **Reatividade elegante**: Responde suavemente aos sons
✅ **Ambiente dinâmico**: O fundo muda com os sons ativos
✅ **Contemplativo**: Convida o usuário a observar e apreciar
✅ **Influência de elementos**: Cores mudam baseado nos sons

---

## 🎯 Características

### 9 Camadas Sofisticadas

1. **Anel externo decorativo** - Responde ao áudio com pulsação suave
2. **Pétalas externas (12)** - Alternam cores primária e influenciada
3. **Anel intermediário** - Traço elegante que pulsa
4. **Pétalas intermediárias (8)** - Curvas suaves e orgânicas
5. **Anel interno** - Gradiente radial com transição suave
6. **Triângulos decorativos (6)** - Detalhes geométricos refinados
7. **Núcleo central** - Gradiente com brilho
8. **Centro com ponto de luz** - Foco visual central
9. **Aura de pulsação** - Onda de energia que expande

### Ambiente Dinâmico

- **Background radial**: Muda de cor baseado em elementos ativos
- **Aurora cônica**: Gradiente rotativo que responde aos sons
- **Drop shadow**: Brilho que pulsa com o áudio
- **Indicadores de temperatura**: Mostra quente/frio em tempo real

---

## 🔧 Como Integrar

### Passo 1: Copie o arquivo
```
components/MandalaElegant.tsx → seu projeto
```

### Passo 2: Importe no page.tsx
```typescript
import { MandalaElegant } from '@/components/MandalaElegant';
```

### Passo 3: Substitua a mandala
```typescript
// Antes:
<Mandala hue={activeChakra.hue} isPlaying={isPlaying} chakraId={activeChakra.id} />

// Depois:
<MandalaElegant
  chakraId={activeChakra.id}
  ambientVolumes={ambientVolumes}
  audioLevel={audioLevel}
  isPlaying={isPlaying}
/>
```

### Passo 4: Certifique-se de ter `audioLevel`
```typescript
const [audioLevel, setAudioLevel] = useState(0);

// Atualizar baseado no áudio
useEffect(() => {
  if (isChakraOn || Object.values(ambientVolumes).some(v => v > 0)) {
    // Calcular audioLevel (0-1) baseado na análise de frequência
    setAudioLevel(/* seu cálculo */);
  }
}, [isChakraOn, ambientVolumes]);
```

---

## 🎨 Cores e Chakras

### Paleta de Cores Elegante

| Chakra | Cor Primária | Cor Clara | Cor Escura | Acento |
|--------|-------------|----------|-----------|--------|
| **Root** | #ef4444 | #fca5a5 | #7f1d1d | #fee2e2 |
| **Sacral** | #fb923c | #fed7aa | #7c2d12 | #ffedd5 |
| **Solar** | #facc15 | #fef3c7 | #78350f | #fef9e7 |
| **Heart** | #10b981 | #a7f3d0 | #065f46 | #ecfdf5 |
| **Throat** | #3b82f6 | #bfdbfe | #1e3a8a | #eff6ff |
| **Third Eye** | #8b5cf6 | #ddd6fe | #4c1d95 | #f5f3ff |
| **Crown** | #d946ef | #f0d9ff | #6b21a8 | #faf5ff |

---

## 🌡️ Influências de Elementos

### Elementos Quentes 🔥
- **Fogo**: Vermelho vibrante (hue: 0°)
- **Lava**: Laranja quente (hue: 25°)

### Elementos Frios ❄️
- **Água**: Azul (hue: 200°)
- **Oceano**: Azul profundo (hue: 210°)
- **Cachoeira**: Azul claro (hue: 190°)
- **Chuva**: Azul cinzento (hue: 220°)
- **Trovão**: Roxo azulado (hue: 240°)
- **Tempestade**: Azul escuro (hue: 230°)
- **Vento**: Cinza neutro (hue: 0°)
- **Pássaros**: Verde (hue: 120°)
- **Floresta**: Verde escuro (hue: 100°)
- **Grilos**: Verde médio (hue: 110°)
- **Folhas**: Verde claro (hue: 130°)
- **Sinos**: Roxo claro (hue: 280°)
- **Gongo**: Roxo escuro (hue: 270°)
- **Tigela**: Roxo médio (hue: 290°)

---

## 💡 Exemplos de Uso

### Exemplo 1: Apenas Chakra (sem elementos)
```typescript
ambientVolumes = { /* todos 0 */ }
audioLevel = 0.3

// Resultado:
// - Mandala com cores do chakra
// - Pétalas pulsam suavemente
// - Fundo com acento do chakra
// - Sem indicadores de temperatura
```

### Exemplo 2: Chakra + Fogo (QUENTE)
```typescript
ambientVolumes = { fire: 0.8, /* resto 0 */ }
audioLevel = 0.5

// Resultado:
// - Mandala muda para tons quentes
// - Pétalas alternam verde + vermelho
// - Fundo fica mais quente
// - Indicador: 🔥 100%
```

### Exemplo 3: Chakra + Água (FRIO)
```typescript
ambientVolumes = { water: 0.8, /* resto 0 */ }
audioLevel = 0.5

// Resultado:
// - Mandala muda para tons frios
// - Pétalas alternam verde + azul
// - Fundo fica mais frio
// - Indicador: ❄️ 100%
```

### Exemplo 4: Chakra + Fogo + Água (MISTO)
```typescript
ambientVolumes = { fire: 0.5, water: 0.5, /* resto 0 */ }
audioLevel = 0.7

// Resultado:
// - Mandala com cores mistas
// - Pétalas têm múltiplas cores
// - Fundo dinâmico e colorido
// - Indicador: 🔥 50% + ❄️ 50%
```

---

## 🎆 Estrutura de Camadas

```
┌─────────────────────────────────────────┐
│ Camada 9: Aura de pulsação              │
│ (onda que expande com áudio)            │
├─────────────────────────────────────────┤
│ Camada 8: Centro com ponto de luz       │
│ (foco visual, pulsa com áudio)          │
├─────────────────────────────────────────┤
│ Camada 7: Núcleo central                │
│ (gradiente radial, responde ao áudio)   │
├─────────────────────────────────────────┤
│ Camada 6: Triângulos decorativos (6)    │
│ (detalhes geométricos refinados)        │
├─────────────────────────────────────────┤
│ Camada 5: Anel interno                  │
│ (gradiente suave, pulsa com áudio)      │
├─────────────────────────────────────────┤
│ Camada 4: Pétalas intermediárias (8)    │
│ (curvas suaves, respondem ao áudio)     │
├─────────────────────────────────────────┤
│ Camada 3: Anel intermediário             │
│ (traço elegante, pulsa com áudio)       │
├─────────────────────────────────────────┤
│ Camada 2: Pétalas externas (12)         │
│ (alternam cores, pulsam com áudio)      │
├─────────────────────────────────────────┤
│ Camada 1: Anel externo decorativo       │
│ (responde ao áudio com pulsação)        │
└─────────────────────────────────────────┘
```

---

## 🎯 Reatividade ao Áudio

### Opacidades Dinâmicas
```typescript
const layerOpacities = {
  outer: 0.7 + audioLevel * 0.2,    // Anel externo
  middle: 0.7 + audioLevel * 0.3,   // Anel intermediário
  inner: 0.7 + audioLevel * 0.4,    // Anel interno
  core: 0.7 + audioLevel * 0.5,     // Núcleo
};
```

### Animações Responsivas
- **Raio das pétalas**: Aumenta com audioLevel
- **Opacidade das camadas**: Aumenta com audioLevel
- **Tamanho do núcleo**: Pulsa com audioLevel
- **Drop shadow**: Intensifica com audioLevel
- **Aura de pulsação**: Expande com audioLevel

---

## 🌈 Influência de Cores

### Cálculo de Cor Influenciada
```typescript
1. Detectar elementos ativos (volume > 0)
2. Calcular intensidade quente/fria
3. Calcular matiz média dos elementos
4. Modificar cor base do chakra:
   - Matiz: +30% da influência
   - Saturação: ±10% baseado em temperatura
   - Luminosidade: ±5% baseado em temperatura
5. Aplicar cor influenciada às pétalas alternadas
```

### Fundo Dinâmico
- **Gradiente radial**: Muda de cor com influência
- **Aurora cônica**: Rotaciona baseado em matiz média
- **Backdrop blur**: Efeito de vidro fosco elegante

---

## 🎨 Customização

### Mudar Cores de um Chakra
Edite `CHAKRA_COLORS` em `MandalaElegant.tsx`:

```typescript
const CHAKRA_COLORS = {
  heart: {
    primary: '#10b981',    // Cor principal
    light: '#a7f3d0',      // Cor clara
    dark: '#065f46',       // Cor escura
    accent: '#ecfdf5',     // Acento
  },
  // ... outros chakras
};
```

### Adicionar Novo Elemento
Edite `ELEMENT_COLORS` em `MandalaElegant.tsx`:

```typescript
const ELEMENT_COLORS: Record<string, { hue: number; temp: 'warm' | 'cool' }> = {
  // ... elementos existentes ...
  
  new_element: {
    hue: 150,              // Matiz (0-360)
    temp: 'cool',          // 'warm' ou 'cool'
  },
};
```

### Ajustar Reatividade
Modifique as animações em `layerOpacities`:

```typescript
const layerOpacities = useMemo(() => {
  const base = 0.7;
  const pulse = audioLevel * 0.3;  // ← Aumentar para mais reatividade
  return {
    outer: base + pulse * 0.2,
    middle: base + pulse * 0.3,
    inner: base + pulse * 0.4,
    core: Math.min(1, base + pulse * 0.5),
  };
}, [audioLevel]);
```

---

## 🔍 Detalhes Técnicos

### SVG vs Canvas
- **SVG**: Escalável, suave, fácil de animar
- **Sem procedural**: Apenas geometria elegante
- **Gradientes**: Radiais e cônicos para profundidade
- **Filtros**: Glow e drop-shadow para brilho

### Performance
- ✅ SVG otimizado (sem elementos desnecessários)
- ✅ Animações com Framer Motion (GPU acelerado)
- ✅ Cálculos em useMemo (sem recálculos desnecessários)
- ✅ Funciona suavemente em 60fps

### Acessibilidade
- ✅ Indicadores visuais claros
- ✅ Sem dependência de som apenas
- ✅ Contraste adequado de cores
- ✅ Animações respeitam preferências

---

## 🐛 Troubleshooting

### Problema: Mandala não muda de cor
**Solução**: Verifique se `ambientVolumes` está sendo passado corretamente

### Problema: Animações lentas
**Solução**: Reduza a complexidade do SVG ou aumente o intervalo de atualização

### Problema: Cores muito saturadas
**Solução**: Ajuste os valores de saturação no cálculo de cor influenciada

### Problema: Indicadores não aparecem
**Solução**: Verifique se há elementos com volume > 0 em `ambientVolumes`

---

## 📝 Props

```typescript
interface MandalaElegantProps {
  chakraId: string;                      // ID do chakra ativo
  ambientVolumes: Record<string, number>; // Volumes dos elementos (0-1)
  audioLevel: number;                    // Nível de áudio (0-1)
  isPlaying: boolean;                    // Se está tocando
}
```

---

## ✨ Resultado Visual

Uma mandala que:
- 🎨 É bela e contemplativa
- 🌡️ Mostra temperatura visualmente
- ✨ Tem múltiplas camadas sofisticadas
- 🎆 Responde elegantemente ao áudio
- 📱 Funciona suavemente em todos os dispositivos
- 👁️ Convida o usuário a observar e apreciar

---

## 🚀 Próximos Passos

1. ✅ Integre `MandalaElegant.tsx` no seu projeto
2. ✅ Teste com diferentes chakras
3. ✅ Teste com diferentes combinações de elementos
4. ✅ Ajuste cores conforme preferência
5. ✅ Customize reatividade ao áudio

---

Pronto para usar! 🎉

# 🧘 AyaGuide | Portal de Meditação Sonora

**AyaGuide** é uma aplicação web imersiva de meditação sonora (Sacred Session Companion). A plataforma combina as frequências sagradas dos chakras com 16 sons ambientais da natureza e um sistema de geometria visual dinâmica que reage ao áudio.

## 🌟 Funcionalidades Principais

* **7 Frequências Sagradas (Chakras)**: De 396Hz (Básico) a 963Hz (Coronário), sintetizadas em tempo real.
* **16 Elementos da Natureza**: Misture sons de água, fogo, vento e floresta, além de instrumentos místicos.
* **Mandala Dinâmica Sensível ao Som**: Uma geometria central que pulsa e se altera com as ondas sonoras e a influência de elementos.
* **Aurora Cromática Ponderada**: O background altera sua cor baseado no chakra ativo e nos elementos naturais selecionados (ex: água adiciona tons azuis, fogo tons quentes).
* **Guia de Respiração Visual**: Padrão cadenciado (Inspire 4s, Retenha 4s, Expire 6s).
* **Biblioteca Sagrada**: Salve seus mixes preferidos na memória do navegador.

## 🚀 Como Executar Localmente

### Pré-requisitos

* Node.js v18 ou superior

### Passos

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicialize o servidor de desenvolvimento local:

   ```bash
   npm run dev
   ```

3. Abra `http://localhost:3000` em seu navegador. (Não é necessário configurar variáveis de ambiente `.env`).

## 🖥 Atalhos de Teclado (HUD Mode)

Durante as sessões (especialmente em Tela Cheia), você pode utilizar as teclas:

* `Space`: Tocar / Pausar a sessão.
* `M`: Mudo (Liga/desliga todo o som).
* `F`: Tela cheia (Alternar).
* `B`: Alternar Guia de Respiração.
* `Esc`: Sair do modo tela cheia.

## 📦 Deploy na Vercel

O projeto está 100% otimizado (`output: 'standalone'`) para o deploy sem complexidades no Vercel. Siga as instruções em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) para enviar para produção.

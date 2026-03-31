# Como Implantar o AyaGuide no Vercel

O projeto foi preparado e testado para implantação no Vercel. Siga os passos abaixo para colocar sua aplicação online.

## 🛠️ O que foi feito:
- **Limpeza de componentes:** Removemos arquivos duplicados e com erros sintáticos que impediam a compilação (ex: `Mandala_backup.tsx`).
- **Correções de Tipagem:** Corrigimos erros de TypeScript em `AmbienceCanvas.tsx` e `presetTemplates.ts`.
- **Validação de Build:** Executamos `npm run build` localmente e confirmamos que a aplicação compila sem erros.
- **Configuração de Pacote:** Atualizamos o nome do projeto para `ayaguide` no `package.json`.

---

## 🚀 Passo a Passo para Implantação:

### 1. Enviar para o GitHub
Se você ainda não enviou seu código para um repositório GitHub:
1. Crie um novo repositório no [GitHub](https://github.com/new).
2. No seu terminal local:
   ```bash
   git add .
   git commit -m "Preparação para deploy no Vercel"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/ayaguide.git
   git push -u origin main
   ```

### 2. Conectar ao Vercel
1. Acesse o [Vercel](https://vercel.com) e faça login.
2. Clique em **"Add New"** > **"Project"**.
3. Importe o repositório `ayaguide`.

### 3. Configurar Variáveis de Ambiente
Na tela de importação, expanda a seção **"Environment Variables"** e adicione:

| Variável | Valor |
| :--- | :--- |
| `GEMINI_API_KEY` | Sua chave de API do Google Gemini |
| `APP_URL` | A URL final do seu site (pode deixar como `https://ayaguide.vercel.app`) |

### 4. Deploy!
1. Clique em **"Deploy"**.
2. O Vercel detectará automaticamente que é um projeto Next.js e usará os scripts corretos.

---

## ⚠️ Observação sobre Next.js 15
Este projeto usa Next.js 15. O Vercel suporta nativamente todas as funcionalidades, incluindo o modo `standalone` configurado no `next.config.ts`.

Se precisar de ajuda adicional, estou aqui!

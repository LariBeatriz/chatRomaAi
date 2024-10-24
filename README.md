# Chat Application

Este é um aplicativo de chat em tempo real com integração da API OpenAI.

## Requisitos

- Node.js
- npm

## Instalação

1. Clone este repositório
2. Navegue até a pasta do projeto
3. Execute `npm install` para instalar as dependências

## Configuração

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione sua chave da API OpenAI ao arquivo `.env`:   ```
   OPENAI_API_KEY=sua_chave_api_aqui   ```

## Executando o aplicativo

Para iniciar o servidor e abrir automaticamente a página de login no navegador:

1. No terminal, navegue até a pasta do projeto
2. Execute o comando:   ```
   node servidor/server.js   ```
3. O servidor será iniciado na porta 3000 e a página de login será aberta automaticamente no seu navegador padrão

## Funcionalidades

- Login e registro de usuários
- Chat em tempo real
- Integração com a API OpenAI para respostas automáticas
- Lista de usuários online

## Estrutura do projeto

- `servidor/server.js`: Arquivo principal do servidor
- `login/index.html`: Página de login e registro
- `tela-chat/chat-socketio.html`: Interface do chat
- `tela-chat/chat.js`: Lógica do cliente para o chat

## Notas

Este projeto é apenas para fins de demonstração e não deve ser usado em produção sem implementar medidas de segurança adequadas, como autenticação segura e armazenamento criptografado de senhas.

# Portfólio Profissional

Este é um site de portfólio profissional que exibe projetos buscados diretamente do GitHub. O site apresenta um design moderno e responsivo com suporte para modos claro e escuro, além de efeitos visuais dinâmicos.

## Funcionalidades

- **Integração com GitHub**: Carrega automaticamente perfil e repositórios do usuário
- **Categorização de Projetos**: Filtra projetos por categoria (Profissionais, Open Source, Aprendizado, Pessoais)
- **Design Responsivo**: Funciona em dispositivos de todos os tamanhos
- **Alternância de Temas**: Alterna entre modos claro e escuro
- **Efeitos de Fundo Interativos**: Fundos animados aleatórios usando Vanta.js
- **Paginação**: Navegação simples entre projetos

## Tecnologias Utilizadas

- **HTML5/CSS3**: Marcação semântica moderna e estilização com variáveis CSS para temas
- **JavaScript**: JS puro para manipulação do DOM, chamadas de API e interações da interface
- **API do GitHub**: Busca dados de perfil e repositórios do usuário
- **Three.js**: Renderizador 3D utilizado pelo Vanta.js
- **Vanta.js**: Criação de fundos interativos e bonitos
- **Font Awesome**: Biblioteca de ícones para elementos da interface

## Detalhes de Implementação

- Utiliza variáveis CSS para temas consistentes e fácil alternância entre modos claro e escuro
- Implementa design responsivo usando media queries
- Busca dados da API do GitHub com tratamento de erros
- Gera cards de projetos com base nos dados dos repositórios
- Implementa paginação para melhor desempenho com grande quantidade de projetos
- Cria fundos com gradientes baseados nos nomes dos projetos para distinção visual
- Salva preferência de tema no localStorage para experiência persistente

## Personalização

O portfólio pode ser facilmente personalizado alterando a variável de nome de usuário do GitHub e ajustando os mapeamentos de categorias para projetos.
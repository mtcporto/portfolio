// Configurações
   const username = "mtcporto";
   const defaultImage = "https://placehold.co/300x180/eee/999?text=Sem+Imagem";
   const maxProjects = 100; // Aumentando o limite para pegar mais projetos
   const projectsPerPage = 6; // Projetos por página
   
   // Variáveis de estado para projetos
   let allProjects = [];
   let filteredProjects = [];
   let currentPage = 1;
   let currentCategory = 'all';
   
   // Função para sanitização básica de HTML
   function sanitizeHTML(str) {
     const temp = document.createElement('div');
     temp.textContent = str;
     return temp.innerHTML;
   }
   
   // Função para manipulação do tema
   function setupThemeToggle() {
     const themeToggle = document.getElementById('theme-toggle');
     const icon = themeToggle.querySelector('i');
     
     // Verificar preferência do usuário
     const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
     const savedTheme = localStorage.getItem('theme');
     
     if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
       document.body.classList.add('dark-mode');
       icon.classList.replace('fa-moon', 'fa-sun');
     }
     
     themeToggle.addEventListener('click', () => {
       document.body.classList.toggle('dark-mode');
       
       if (document.body.classList.contains('dark-mode')) {
         localStorage.setItem('theme', 'dark');
         icon.classList.replace('fa-moon', 'fa-sun');
       } else {
         localStorage.setItem('theme', 'light');
         icon.classList.replace('fa-sun', 'fa-moon');
       }
     });
   }
   
   // Inicializar ano atual no footer
   document.getElementById('current-year').textContent = new Date().getFullYear();
   
   // Categorias de projetos (mapeamento manual)
   const projectCategories = {
     // Institucional/profissional
     'cte-telas': ['institucional'],
     'frostmap': ['institucional'],
     'assinaturadigital': ['institucional'],
     'cem': ['institucional'],
     'juridico': ['institucional'],
     'cert': ['institucional'],
     'alertas': ['institucional'],
     'whatnow': ['institucional'],

     // Cotidiano (pode acumular com vivajoaopessoa)
     'bares': ['cotidiano', 'vivajoaopessoa'],
     'clima': ['cotidiano', 'vivajoaopessoa'],
     'cinema': ['cotidiano', 'vivajoaopessoa'],
     'shows': ['cotidiano', 'vivajoaopessoa'],
     'noticias': ['cotidiano', 'vivajoaopessoa'],
     'noticiaspb': ['cotidiano', 'vivajoaopessoa'],
     'mares': ['cotidiano', 'vivajoaopessoa'],
     'artistas': ['cotidiano', 'vivajoaopessoa'],
     'qualidade': ['cotidiano'],
     'news': ['cotidiano'],
     'tides': ['cotidiano', 'opensource'],
     'bangue': ['cotidiano'],

     // Learning (aprendizado/experimentação)
     'pokedex': ['learning', 'nerd'],
     'dnd': ['learning', 'nerd'],
     'rickyandmorty': ['learning', 'nerd'],
     'wow': ['learning', 'nerd'],
     'chat-gemini': ['learning', 'ia', 'opensource'],
     'detect': ['learning', 'ia', 'opensource'],
     'facerec': ['learning', 'ia', 'opensource'],
     'opencv': ['learning', 'ia', 'opensource'],
     'tts-wsapi': ['learning'],
     'videos': ['learning', 'opensource'],
     'filmes': ['learning'],
     'calls': ['learning'],
     'chat': ['learning', 'opensource'],

     // Open Source 
     'spotifylike': ['opensource'],

     // Pessoal
     'portfolio': ['pessoal'],
   };
   
   // Atualize a função loadUserProfile para incluir o LinkedIn
   async function loadUserProfile() {
     try {
       const response = await fetch(`https://api.github.com/users/${username}`);
       if (!response.ok) throw new Error('Erro ao carregar perfil');
       
       const user = await response.json();
       const profileDiv = document.getElementById("profile");
       
       const socialLinks = [];
       if (user.html_url) socialLinks.push(`<a href="${user.html_url}" class="social-btn" target="_blank" rel="noopener"><i class="fab fa-github"></i>GitHub</a>`);
       if (user.blog) socialLinks.push(`<a href="${sanitizeHTML(user.blog)}" class="social-btn" target="_blank" rel="noopener"><i class="fas fa-globe"></i>Website</a>`);
       
       // Adicionar LinkedIn
       socialLinks.push(`<a href="https://www.linkedin.com/in/marco-tulio-porto-5671a323/" class="social-btn" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i>LinkedIn</a>`);
       
       profileDiv.innerHTML = `
         <img src="${user.avatar_url}" alt="${sanitizeHTML(user.name || user.login)}" class="profile-img" loading="lazy" />
         <h1 class="profile-title">${sanitizeHTML(user.name || user.login)}</h1>
         <p class="profile-bio">${sanitizeHTML(user.bio || "Desenvolvedor de Software")}</p>
         
         <div class="profile-meta">
           ${user.company ? `<span class="profile-meta-item"><i class="fas fa-building"></i>${sanitizeHTML(user.company)}</span>` : ''}
           ${user.location ? `<span class="profile-meta-item"><i class="fas fa-map-marker-alt"></i>${sanitizeHTML(user.location)}</span>` : ''}
           ${user.email ? `<span class="profile-meta-item"><i class="fas fa-envelope"></i>${sanitizeHTML(user.email)}</span>` : ''}
         </div>
         
         <div class="profile-links">
           ${socialLinks.join('')}
         </div>
       `;
     } catch (error) {
       console.error('Erro ao carregar perfil:', error);
       document.getElementById("profile").innerHTML = `
         <p>Não foi possível carregar o perfil. Tente novamente mais tarde.</p>
       `;
     }
   }
   
   // Carregar projetos
   async function loadProjects() {
     const projectsGrid = document.getElementById("projects-grid");
     const projectCount = document.getElementById("project-count");
     
     try {
       const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${maxProjects}`);
       if (!response.ok) throw new Error('Erro ao carregar repositórios');
       
       let repos = await response.json();
       
       // Log detalhado para ajudar na depuração
       console.log("--------- DEPURAÇÃO DE CATEGORIAS ---------");
       console.log("Todos os repositórios carregados:");
       repos.forEach(repo => {
         const repoName = repo.name.toLowerCase();
         const categories = projectCategories[repoName] || ['pessoal (padrão)'];
         console.log(`${repo.name} (${repoName}): ${categories.join(', ')}`);
       });
       console.log("------------------------------------------");
       
       // Registre todos os nomes de repositórios para depuração
       console.log("Repositórios carregados da API GitHub:", repos.map(repo => repo.name));
       
       // Lista de projetos a serem ignorados
       const ignoreList = ['LocalAI', 'xtwsd', 'oplayer', 'player']; // Adicionado 'player' à lista de ignorados
       
       // Filtrar repos
       allProjects = repos.filter(repo => {
         return !ignoreList.includes(repo.name.toLowerCase()) && !repo.fork;
       });
       
       // Atualizar contador de projetos
       projectCount.textContent = `${allProjects.length} projetos e contando...`;
       
       if (allProjects.length === 0) {
         projectsGrid.innerHTML = '<p class="text-center">Nenhum projeto encontrado.</p>';
         return;
       }
       
       // Configurar eventos para categorias
       setupCategoryFilters();
       
       // Inicialmente, mostrar todos os projetos
       filterProjects('all');
       
     } catch (error) {
       console.error('Erro ao carregar projetos:', error);
       projectsGrid.innerHTML = `
         <p>Não foi possível carregar os projetos. Tente novamente mais tarde.</p>
       `;
     }
   }

   // Configurar filtros de categoria
   function setupCategoryFilters() {
     const categoryBtns = document.querySelectorAll('.category-btn');
     categoryBtns.forEach(btn => {
       btn.addEventListener('click', () => {
         const category = btn.dataset.category;
         
         // Atualizar botão ativo
         categoryBtns.forEach(b => b.classList.remove('active'));
         btn.classList.add('active');
         
         // Filtrar projetos
         filterProjects(category);
       });
     });
   }

// Filtrar projetos por categoria
function filterProjects(category) {
  currentCategory = category;
  currentPage = 1;
  
  // Filtrar projetos pela categoria
  if (category === 'all') {
    filteredProjects = [...allProjects];
  } else {
    filteredProjects = allProjects.filter(repo => {
      // Debug para identificar problemas
      const repoLowerName = repo.name.toLowerCase();
      const hasCategoryMapping = !!projectCategories[repoLowerName];
      
      if (!hasCategoryMapping && category === 'pessoal') {
        console.log(`Repositório sem mapeamento (considerado 'pessoal'): ${repo.name}`);
        return true;
      }
      
      // Verificar se o projeto tem categorias definidas
      const projectCats = projectCategories[repoLowerName];
      if (projectCats) {
        // Debug
        if (projectCats.includes(category)) {
          console.log(`Repositório "${repo.name}" corresponde à categoria "${category}"`);
        } else {
          console.log(`Repositório "${repo.name}" NÃO corresponde à categoria "${category}" (tem categorias: ${projectCats.join(', ')})`);
        }
        
        // Verificar se a categoria atual está entre as categorias do projeto
        return projectCats.includes(category);
      } else {
        // Se não tiver categorias definidas, é considerado 'pessoal' por padrão
        return category === 'pessoal';
      }
    });
  }
  
  // Atualizar a mensagem de contagem de projetos por categoria
  const categoryText = category === 'all' ? 'Todos os projetos' : 
    categoryNames[category] || category;
  document.getElementById("project-count").textContent = 
    `${filteredProjects.length} projeto${filteredProjects.length !== 1 ? 's' : ''} na categoria "${categoryText}"`;
  
  // Renderizar resultados
  renderProjects();
  renderPagination();
}
  
  // Adicionar um objeto de nomes amigáveis para categorias no escopo global
  const categoryNames = {
    'all': 'Todos',
    'institucional': 'Institucional',
    'cotidiano': 'Cotidiano',
    'vivajoaopessoa': 'Viva João Pessoa',
    'learning': 'Aprendizado',
    'nerd': 'Nerd/Fun',
    'opensource': 'Open Source',
    'ia': 'IA',
    'pessoal': 'Pessoal'
  };

  // Objeto com ícones para cada categoria (mover para escopo global para evitar duplicação)
  const categoryIcons = {
    'institucional': 'fas fa-briefcase',
    'cotidiano': 'fas fa-coffee',
    'vivajoaopessoa': 'fas fa-map-marker-alt',
    'learning': 'fas fa-graduation-cap',
    'nerd': 'fas fa-gamepad',
    'opensource': 'fas fa-code-branch',
    'ia': 'fas fa-robot',
    'pessoal': 'fas fa-user'
  };

   // Renderizar projetos atuais
   function renderProjects() {
     const projectsGrid = document.getElementById("projects-grid");
     projectsGrid.innerHTML = '';
     
     // Calcular projetos da página atual
     const startIndex = (currentPage - 1) * projectsPerPage;
     const endIndex = Math.min(startIndex + projectsPerPage, filteredProjects.length);
     const currentPageProjects = filteredProjects.slice(startIndex, endIndex);
     
     if (currentPageProjects.length === 0) {
       projectsGrid.innerHTML = '<p class="text-center">Nenhum projeto encontrado nesta categoria.</p>';
       return;
     }
     
     // Função para gerar cor baseada no nome do repositório
     function generateColor(name) {
       let hash = 0;
       for (let i = 0; i < name.length; i++) {
         hash = name.charCodeAt(i) + ((hash << 5) - hash);
       }
       const c = (hash & 0x00FFFFFF)
         .toString(16)
         .toUpperCase()
         .padStart(6, '0');
       return `#${c}`;
     }

     // Função para determinar cor de texto contrastante
     function getContrastColor(hexcolor) {
       // Converte hex para RGB
       hexcolor = hexcolor.replace("#", "");
       const r = parseInt(hexcolor.substr(0, 2), 16);
       const g = parseInt(hexcolor.substr(2, 2), 16);
       const b = parseInt(hexcolor.substr(4, 2), 16);
       // Calcula luminosidade
       const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
       return luminance > 0.5 ? '#000000' : '#FFFFFF';
     }
     
     // Renderizar projetos
     currentPageProjects.forEach(repo => {
       const vercelLink = repo.homepage && repo.homepage.includes("vercel.app") ? repo.homepage : null;
       
       // Determinar categorias do projeto (versão corrigida)
       const repoLowerName = repo.name.toLowerCase();
       const projectCats = projectCategories[repoLowerName] || ['pessoal'];

       // Inicializar a variável categoryLabels para este projeto
       let categoryLabels = '';

       // Criar badges para as categorias (limite a 3 para não sobrecarregar o visual)
       const categoriesToShow = projectCats.slice(0, 3);
       categoriesToShow.forEach((cat, index) => {
         // Usar os objetos do escopo global
         const icon = categoryIcons[cat] || 'fas fa-tag';
         const name = categoryNames[cat] || cat;
         categoryLabels += `
           <span class="category-badge" style="
             background: var(--primary); 
             color: white; 
             padding: 2px 8px; 
             border-radius: 12px; 
             font-size: 0.8rem;
             margin-right: 5px;
             margin-bottom: 5px;
             display: inline-block;">
             <i class="${icon}"></i> ${name}
           </span>
         `;
       });

       // Exibir indicador se houver mais categorias
       if (projectCats.length > 3) {
         categoryLabels += `
           <span class="category-badge" style="
             background: var(--bg-card); 
             border: 1px solid var(--border);
             color: var(--text-light); 
             padding: 2px 8px; 
             border-radius: 12px; 
             font-size: 0.8rem;
             display: inline-block;">
             +${projectCats.length - 3}
           </span>
         `;
       }
       
       // Gera uma cor baseada no nome do repositório
       const bgColor = generateColor(repo.name);
       const textColor = getContrastColor(bgColor);
       
       const projectCard = document.createElement('div');
       projectCard.className = 'project-card';
       projectCard.dataset.categories = projectCats.join(' ');

       // Usa as iniciais do projeto
       const nameInitials = repo.name
         .split('-')
         .map(word => word[0])
         .join('')
         .toUpperCase()
         .substring(0, 3);
       
       const generatedImage = `
         <div class="project-img" style="background-color: ${bgColor}; display: flex; align-items: center; justify-content: center; position: relative;">
           <span style="color: ${textColor}; font-size: 3rem; font-weight: bold;">
             ${nameInitials}
           </span>
           <span style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">
             <i class="${categoryIcons[projectCats[0]]}"></i> ${categoryNames[projectCats[0]]}
           </span>
         </div>
       `;
       
       projectCard.innerHTML = `
         ${generatedImage}
         <div class="project-content">
           <a href="${repo.html_url}" class="project-title" target="_blank" rel="noopener">
             ${sanitizeHTML(repo.name)}
           </a>
           <div class="project-categories-container" style="margin-bottom: 10px;">
             ${categoryLabels}
           </div>
           <p class="project-desc">${sanitizeHTML(repo.description || "Sem descrição disponível.")}</p>
           <div class="project-footer">
             <a href="${repo.html_url}" class="project-btn outline-btn" target="_blank" rel="noopener">
               <i class="fab fa-github"></i> Código
             </a>
             ${vercelLink ? 
               `<a href="${vercelLink}" class="project-btn primary-btn" target="_blank" rel="noopener">
                 <i class="fas fa-external-link-alt"></i> Ver Demo
               </a>` : 
               ''}
           </div>
         </div>
       `;
       projectsGrid.appendChild(projectCard);
     });
   }

   // Renderizar paginação
   function renderPagination() {
     const pagination = document.getElementById('pagination');
     pagination.innerHTML = '';
     
     // Calcular número de páginas
     const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
     
     if (totalPages <= 1) {
       pagination.innerHTML = '';
       return;
     }
     
     // Botão anterior
     const prevBtn = document.createElement('button');
     prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
     prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
     prevBtn.disabled = currentPage === 1;
     prevBtn.addEventListener('click', () => {
       if (currentPage > 1) {
         currentPage--;
         renderProjects();
         renderPagination();
         window.scrollTo(0, document.querySelector('.projects').offsetTop - 100);
       }
     });
     pagination.appendChild(prevBtn);
     
     // Botões de página
     const maxVisiblePages = 5;
     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
     
     if (endPage - startPage + 1 < maxVisiblePages) {
       startPage = Math.max(1, endPage - maxVisiblePages + 1);
     }
     
     for (let i = startPage; i <= endPage; i++) {
       const pageBtn = document.createElement('button');
       pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
       pageBtn.textContent = i;
       pageBtn.addEventListener('click', () => {
         currentPage = i;
         renderProjects();
         renderPagination();
         window.scrollTo(0, document.querySelector('.projects').offsetTop - 100);
       });
       pagination.appendChild(pageBtn);
     }
     
     // Botão próximo
     const nextBtn = document.createElement('button');
     nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
     nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
     nextBtn.disabled = currentPage === totalPages;
     nextBtn.addEventListener('click', () => {
       if (currentPage < totalPages) {
         currentPage++;
         renderProjects();
         renderPagination();
         window.scrollTo(0, document.querySelector('.projects').offsetTop - 100);
       }
     });
     pagination.appendChild(nextBtn);
   }
   
   // Inicialização
   document.addEventListener('DOMContentLoaded', () => {
     setupThemeToggle();
     
     // Carregar perfil e depois iniciar o Vanta
     loadUserProfile().then(() => {
       setupVantaBackground();
     });
     
     loadProjects();
     
     // Adicionar rolagem suave para links internos
     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
       anchor.addEventListener('click', function (e) {
         e.preventDefault();
         
         const targetId = this.getAttribute('href');
         const targetElement = document.querySelector(targetId);
         
         if (targetElement) {
           window.scrollTo({
             top: targetElement.offsetTop - 80,
             behavior: 'smooth'
           });
         }
       });
     });
   });

// Atualize a função setupVantaBackground para melhorar a legibilidade
function setupVantaBackground() {
 // Verifica se o VANTA e THREE estão disponíveis
 if (typeof VANTA === 'undefined' || typeof THREE === 'undefined') {
   console.error('VANTA ou THREE não estão carregados corretamente.');
   return;
 }
 
 try {
   // Sempre usar a cor escura de fundo para o efeito independente do tema
   // Isso garantirá melhor legibilidade do texto
   const darkBgColor = "#111827"; // Cor escura fixa, mesmo valor de --bg-light no modo dark
   
   // Obter cores do tema para os efeitos
   const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
   const primaryDarkColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-dark').trim();
   
   // Escolhe um efeito aleatoriamente
   const effects = ['BIRDS', 'WAVES', 'DOTS', 'NET', 'RINGS'];
   const randomEffect = effects[Math.floor(Math.random() * effects.length)];
   
   // Configura as opções comuns
   const commonOptions = {
     el: '#hero',
     mouseControls: true,
     touchControls: true,
     gyroControls: false,
     minHeight: 200.00,
     minWidth: 200.00,
     scale: 1.00,
     scaleMobile: 1.00,
     backgroundColor: darkBgColor, // Sempre usar cor escura de fundo
   };
   
   let vantaEffect;
   
   // Configura opções específicas para cada efeito com cores contrastantes
   switch(randomEffect) {
     case 'BIRDS':
       vantaEffect = VANTA.BIRDS({
         ...commonOptions,
         color1: "#60a5fa", // Azul mais claro para contrastar com fundo escuro
         color2: "#93c5fd", // Azul ainda mais claro
         colorMode: "variance",
         birdSize: 1.50,
         wingSpan: 40.00,
         separation: 100.00,
         quantity: 3.00
       });
       break;
       
     case 'WAVES':
       vantaEffect = VANTA.WAVES({
         ...commonOptions,
         color: "#60a5fa", // Azul mais claro
         shininess: 40.00,
         waveHeight: 15.00,
         waveSpeed: 0.75,
         zoom: 0.90
       });
       break;
       
     case 'DOTS':
       vantaEffect = VANTA.DOTS({
         ...commonOptions,
         color: "#60a5fa", // Azul mais claro
         color2: "#93c5fd", // Azul ainda mais claro
         size: 4.00,
         spacing: 35.00,
         showLines: true
       });
       break;
       
     case 'NET':
       vantaEffect = VANTA.NET({
         ...commonOptions,
         color: "#60a5fa", // Azul mais claro
         backgroundColor: darkBgColor,
         points: 10,
         maxDistance: 20.00,
         spacing: 16.00
       });
       break;
       
     case 'RINGS':
       vantaEffect = VANTA.RINGS({
         ...commonOptions,
         color: "#60a5fa", // Azul mais claro
         backgroundColor: darkBgColor,
         backgroundAlpha: 1.0 // 100% opaco para garantir o fundo escuro
       });
       break;
   }
   
   console.log(`Efeito Vanta escolhido: ${randomEffect}`);
   
   // Não precisamos mais atualizar a cor de fundo quando o tema mudar,
   // pois agora vamos manter o fundo escuro sempre
   const themeToggle = document.getElementById('theme-toggle');
   themeToggle.addEventListener('click', () => {
     // Não é mais necessário alterar o backgroundColor, mas podemos ajustar outras propriedades
     // se necessário com base no tema
   });
   
   // Para ter certeza que o texto será legível, vamos aumentar o contraste dele
   // adicionando uma sombra mais visível
   const profileTitle = document.querySelector('.profile-title');
   const profileBio = document.querySelector('.profile-bio');
   
   if (profileTitle) {
     profileTitle.style.textShadow = '0 2px 10px rgba(0,0,0,0.8)';
     profileTitle.style.color = '#ffffff'; // Forçar branco para melhor contraste
   }
   
   if (profileBio) {
     profileBio.style.textShadow = '0 2px 8px rgba(0,0,0,0.8)';
     profileBio.style.color = '#f9fafb'; // Forçar cinza muito claro para melhor contraste
   }
 } catch (error) {
   console.error('Erro ao inicializar o efeito Vanta:', error);
   document.getElementById('hero').classList.add('fallback-background');
 }
}
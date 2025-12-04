# Catálogo de Stacks para Hospedagem Compartilhada (PHP)

Este catálogo organiza os **planos de entrega** pensando em ambientes como cPanel, Locaweb, Hostgator, Hostinger (shared hosting), onde PHP + MySQL + Apache/Nginx são o padrão e o suporte a Node.js é limitado.

Cada plano pode ser usado em conjunto com o **Playbook de Desenvolvimento com IA** e os especialistas do guia.

---

## Plano 1 – Landing Page Essencial

**Tipo de produto:** landing page simples para validação de oferta.  
**Complexidade:** baixa.

### Stack técnico
- **Frontend:** HTML5 + CSS3 + JavaScript (Alpine.js opcional para interatividade leve).  
- **Estilo:** Tailwind CSS (compilado localmente em um único `.css`).  
- **Backend (formulários):** script PHP simples (`mail.php` com PHPMailer ou similar) para envio de e-mail, sem banco de dados.  
- **Deploy:** upload via FTP/SFTP ou automação (GitHub Actions → FTP Deploy).

### Notas
- Substitui funções serverless (Vercel etc.) por **PHP clássico**.  
- É ideal para aplicar o Playbook em escala reduzida, focando:  
  - Gestão de Produto (mensagem de valor)  
  - UX (estrutura da página)  
  - Desenvolvimento/Vibe Coding (HTML/CSS/JS + script PHP).

---

## Plano 2 – Landing Page Pro (Next.js Estático + PHP API)

**Tipo de produto:** landing moderna com interatividade rica, mas servida como site estático.  
**Complexidade:** média.

### Stack técnico
- **Frontend:** Next.js 14+ (App Router) configurado com `output: 'export'`.  
- **Estilo:** Tailwind CSS + shadcn/ui.  
- **Backend (formulários):** API PHP externa (`api/contact.php`) recebendo POST do formulário React.  
- **Deploy:** gerar pasta `out` (HTML/CSS/JS estáticos) e subir para `public_html`.

### Notas
- Do ponto de vista da hospedagem, é **só um site estático + um PHP** para formulário.  
- IA pode ajudar fortemente em:
  - UX/copy da landing  
  - design dos componentes React  
  - contrato da API (`contact.php`).

---

## Plano 3 – Site Institucional (CMS Flat-File ou PHP Leve)

**Tipo de produto:** site institucional com conteúdo gerenciável.  
**Complexidade:** média.

### Stack técnico
- **Opção A (flat-file):** Grav CMS ou Kirby CMS (PHP, sem banco de dados).  
- **Opção B (Laravel-based):** Statamic (modo Solo/Free), usando armazenamento em arquivos.  
- **Deploy:** upload de arquivos PHP para a hospedagem.

### Notas
- Cliente ganha **painel administrativo** sem precisar de um MySQL pesado.  
- Boa combinação com o Playbook nas etapas de:
  - Modelagem e Arquitetura de Domínio (páginas, posts, coleções)  
  - Desenvolvimento/Vibe Coding (temas, templates)  
  - Testes (links, SEO, erros de navegação).

---

## Plano 4 – Site Institucional Profissional (Laravel Puro)

**Tipo de produto:** site institucional sob medida, com mais lógica e segurança.  
**Complexidade:** média/alta.

### Stack técnico
- **Framework:** Laravel 10/11.  
- **Frontend:** Blade Templates + Alpine.js + Tailwind CSS.  
- **Otimização:** cache de resposta (por exemplo, Spatie Response Cache) para aproximar de performance estática.  
- **Deploy:** deploy Laravel padrão, apontando a pasta `public`.

### Notas
- Cliente não tem acesso direto à estrutura de templates (Blade); você controla o que é dinâmico.  
- Excelente para aplicar o Playbook:  
  - Requisitos (quais seções são gerenciáveis)  
  - Modelagem (páginas, blocos, SEO, formulários)  
  - Vibe Coding (controllers, services, policies)  
  - Testes de feature (Laravel). 

---

## Plano 5 – Site Premium (Laravel + Filament CMS)

**Tipo de produto:** site com painel administrativo premium e altamente customizável.  
**Complexidade:** alta.

### Stack técnico
- **Core:** Laravel 10/11.  
- **Painel Administrativo:** FilamentPHP v3.  
- **Frontend:** Blade com componentes Livewire (parte pública) **ou** frontend separado (ex.: Astro) consumindo APIs Laravel.  
- **Banco de Dados:** MySQL/MariaDB.

### Notas
- Ideal para quem quer fugir da "cara de WordPress".  
- IA pode auxiliar em:
  - definição de entidades/recursos (Filament Resources)  
  - geração de formulários, tabelas, filtros  
  - regras de permissão, roles, policies  
  - migrações e seeders.

---

## Plano 6 – Sistema Personalizado (Laravel Fullstack)

**Tipo de produto:** sistemas sob medida (CRM, ERPs leves, dashboards, etc.).  
**Complexidade:** alta.

### Stack técnico
- **Backend:** Laravel 11.  
- **Frontend:**
  - Inertia.js (Vue ou React) **ou**  
  - Livewire 3 (fullstack Laravel).
- **Infraestrutura:** MySQL; Redis se a hospedagem permitir (senão, drivers baseados em banco/arquivo para cache/filas).  
- **Real-time:** Laravel Reverb (se houver suporte a WebSockets) ou serviços externos (ex.: Pusher).

### Notas
- É o melhor candidato para **exemplos completos do Playbook**, pois exige:
  - requisitos sólidos  
  - modelagem de domínio rica  
  - decisões arquiteturais claras  
  - estratégia de testes mais robusta.

---

## Relação com o Playbook de Desenvolvimento com IA

Para qualquer plano:

- Use o **Playbook** para guiar o processo (Visão → Requisitos → Modelagem → Execução → Testes → Evolução).  
- Use os **Especialistas** conforme o tipo de projeto:
  - Landing simples: Gestão de Produto, UX, Desenvolvimento/Vibe Coding.  
  - CMS/Institucional: adicionar Modelagem de Domínio, Arquitetura, Segurança.  
  - Sistemas personalizados: todos os especialistas, com mais peso em Requisitos, Modelagem, Arquitetura, Testes e Plano de Execução.

Nos próximos passos, você pode adicionar **exemplos práticos** por plano mostrando:

- 1 user story  
- sequência de prompts  
- esqueleto de código  
- esqueleto de testes.

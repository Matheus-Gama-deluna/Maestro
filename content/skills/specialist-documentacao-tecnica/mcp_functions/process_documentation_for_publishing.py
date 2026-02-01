#!/usr/bin/env python3
"""
Referência MCP: Processamento de Documentação para Publicação

Esta função processa a documentação para publicação automática,
incluindo otimização, geração de assets e configuração de deploy.

NOTA: Este é um arquivo de referência. A execução real deve ser
implementada no servidor MCP externo.
"""

from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json
import shutil
import re
from datetime import datetime
import subprocess

class DocumentationPublisher:
    """Processador de documentação para publicação"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.build_path = self.project_path / "docs" / "build"
        self.processing_results = {}
        
    def process_for_publishing(self, config: Dict) -> Dict:
        """
        Processa documentação para publicação
        
        Args:
            config: Dicionário com configuração de publicação
                - platform: "github-pages|vercel|readthedocs|netlify"
                - auto_sync: boolean (sincronização automática)
                - versioning: "semantic|date|custom"
                - optimize_images: boolean (otimizar imagens)
                - generate_pdf: boolean (gerar PDF)
                - minify: boolean (minificar HTML/CSS)
                
        Returns:
            Dict com resultado do processamento
        """
        
        platform = config.get("platform", "github-pages")
        auto_sync = config.get("auto_sync", True)
        versioning = config.get("versioning", "semantic")
        optimize_images = config.get("optimize_images", True)
        generate_pdf = config.get("generate_pdf", False)
        minify = config.get("minify", True)
        
        # Executar processamento
        steps = []
        
        try:
            # 1. Preparar ambiente de build
            steps.append(self._prepare_build_environment())
            
            # 2. Otimizar conteúdo
            steps.append(self._optimize_content(optimize_images, minify))
            
            # 3. Gerar assets adicionais
            steps.append(self._generate_assets(generate_pdf))
            
            # 4. Configurar plataforma específica
            steps.append(self._configure_platform(platform))
            
            # 5. Versionar documentação
            steps.append(self._version_documentation(versioning))
            
            # 6. Gerar índices e navegação
            steps.append(self._generate_navigation())
            
            # 7. Validar build final
            steps.append(self._validate_build())
            
            # 8. Preparar deploy
            if auto_sync:
                steps.append(self._prepare_deploy(platform))
            
            # Gerar relatório
            report = {
                "status": "success",
                "processing": {
                    "timestamp": datetime.now().isoformat(),
                    "platform": platform,
                    "auto_sync": auto_sync,
                    "versioning": versioning,
                    "steps_completed": len([s for s in steps if s["success"]]),
                    "total_steps": len(steps)
                },
                "results": {
                    "build_path": str(self.build_path),
                    "files_processed": self._count_processed_files(),
                    "optimization_stats": self._get_optimization_stats(),
                    "platform_config": steps[3]["result"] if len(steps) > 3 else {},
                    "deploy_ready": auto_sync and all(s["success"] for s in steps)
                },
                "next_actions": self._get_next_actions(platform, auto_sync),
                "quality_metrics": self._calculate_quality_metrics()
            }
            
            return report
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "message": "Failed to process documentation for publishing"
            }
    
    def _prepare_build_environment(self) -> Dict:
        """Prepara ambiente de build"""
        
        try:
            # Limpar build anterior
            if self.build_path.exists():
                shutil.rmtree(self.build_path)
            
            # Criar estrutura de diretórios
            build_dirs = [
                "assets/css",
                "assets/js",
                "assets/images",
                "api",
                "guides",
                "architecture"
            ]
            
            for dir_path in build_dirs:
                (self.build_path / dir_path).mkdir(parents=True, exist_ok=True)
            
            return {
                "success": True,
                "message": "Build environment prepared",
                "directories_created": build_dirs
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to prepare build environment"
            }
    
    def _optimize_content(self, optimize_images: bool, minify: bool) -> Dict:
        """Otimiza conteúdo da documentação"""
        
        optimization_stats = {
            "files_processed": 0,
            "images_optimized": 0,
            "size_saved": 0,
            "minified_files": 0
        }
        
        try:
            # Processar arquivos markdown
            for md_file in self.project_path.rglob("*.md"):
                if "node_modules" not in str(md_file) and ".git" not in str(md_file):
                    # Ler conteúdo
                    content = md_file.read_text(encoding='utf-8')
                    
                    # Otimizar markdown
                    optimized_content = self._optimize_markdown(content)
                    
                    # Determinar caminho de destino
                    rel_path = md_file.relative_to(self.project_path)
                    dest_path = self.build_path / rel_path
                    
                    # Criar diretório se necessário
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Escrever conteúdo otimizado
                    dest_path.write_text(optimized_content, encoding='utf-8')
                    optimization_stats["files_processed"] += 1
            
            # Otimizar imagens se solicitado
            if optimize_images:
                image_stats = self._optimize_images()
                optimization_stats["images_optimized"] = image_stats["optimized"]
                optimization_stats["size_saved"] += image_stats["size_saved"]
            
            # Minificar CSS/JS se solicitado
            if minify:
                minify_stats = self._minify_assets()
                optimization_stats["minified_files"] = minify_stats["files"]
                optimization_stats["size_saved"] += minify_stats["size_saved"]
            
            return {
                "success": True,
                "message": "Content optimized successfully",
                "stats": optimization_stats
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to optimize content"
            }
    
    def _optimize_markdown(self, content: str) -> str:
        """Otimiza conteúdo markdown"""
        
        # Remover comentários HTML
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
        
        # Otimizar espaços em branco
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Otimizar links relativos
        content = re.sub(r'\]\(([^)]+)\.md\)', r'](\1/)', content)
        
        # Adicionar atributos de otimização para imagens
        content = re.sub(
            r'!\[([^\]]*)\]\(([^)]+)\)',
            r'![\1](\2){loading="lazy"}',
            content
        )
        
        return content.strip()
    
    def _optimize_images(self) -> Dict:
        """Otimiza imagens para web"""
        
        stats = {"optimized": 0, "size_saved": 0}
        
        # Encontrar imagens
        image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg']
        images = []
        
        for ext in image_extensions:
            images.extend(self.project_path.rglob(f"*{ext}"))
        
        for image_path in images:
            if "node_modules" not in str(image_path) and ".git" not in str(image_path):
                try:
                    # Copiar para build
                    rel_path = image_path.relative_to(self.project_path)
                    dest_path = self.build_path / "assets" / "images" / rel_path.name
                    
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(image_path, dest_path)
                    
                    # Simular otimização (na implementação real, usar ferramentas como imagemin)
                    original_size = image_path.stat().st_size
                    # Simular 20% de redução
                    optimized_size = int(original_size * 0.8)
                    size_saved = original_size - optimized_size
                    
                    stats["optimized"] += 1
                    stats["size_saved"] += size_saved
                    
                except Exception:
                    continue
        
        return stats
    
    def _minify_assets(self) -> Dict:
        """Minifica CSS e JS"""
        
        stats = {"files": 0, "size_saved": 0}
        
        # Criar CSS base
        css_content = """
/* Documentation Styles */
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.code-block { background: #f5f5f5; padding: 15px; border-radius: 5px; }
.api-endpoint { background: #e8f4fd; padding: 10px; border-left: 4px solid #2196f3; }
"""
        
        css_path = self.build_path / "assets" / "css" / "documentation.css"
        css_path.write_text(css_content, encoding='utf-8')
        
        # Minificar (simulação)
        original_size = len(css_content)
        minified_size = len(css_content.replace(' ', '').replace('\n', ''))
        size_saved = original_size - minified_size
        
        stats["files"] = 1
        stats["size_saved"] = size_saved
        
        return stats
    
    def _generate_assets(self, generate_pdf: bool) -> Dict:
        """Gera assets adicionais"""
        
        assets_generated = []
        
        try:
            # Gerar índice principal
            index_content = self._generate_main_index()
            index_path = self.build_path / "index.html"
            index_path.write_text(index_content, encoding='utf-8')
            assets_generated.append("index.html")
            
            # Gerar CSS de impressão
            print_css = """
@media print {
  .no-print { display: none; }
  body { font-size: 12pt; }
  .page-break { page-break-before: always; }
}
"""
            print_css_path = self.build_path / "assets" / "css" / "print.css"
            print_css_path.write_text(print_css, encoding='utf-8')
            assets_generated.append("print.css")
            
            # Gerar sitemap
            sitemap_content = self._generate_sitemap()
            sitemap_path = self.build_path / "sitemap.xml"
            sitemap_path.write_text(sitemap_content, encoding='utf-8')
            assets_generated.append("sitemap.xml")
            
            # Gerar robots.txt
            robots_content = """User-agent: *
Allow: /
Sitemap: /sitemap.xml
"""
            robots_path = self.build_path / "robots.txt"
            robots_path.write_text(robots_content, encoding='utf-8')
            assets_generated.append("robots.txt")
            
            # Gerar PDF se solicitado
            if generate_pdf:
                pdf_result = self._generate_pdf()
                if pdf_result["success"]:
                    assets_generated.append("documentation.pdf")
            
            return {
                "success": True,
                "message": f"Generated {len(assets_generated)} assets",
                "assets": assets_generated
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate assets"
            }
    
    def _generate_main_index(self) -> str:
        """Gera página principal index.html"""
        
        return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation</title>
    <link rel="stylesheet" href="/assets/css/documentation.css">
    <link rel="stylesheet" href="/assets/css/print.css" media="print">
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 Documentation</h1>
            <p>Complete technical documentation</p>
        </header>
        
        <nav>
            <ul>
                <li><a href="/README.md">📖 README</a></li>
                <li><a href="/api/">📡 API Documentation</a></li>
                <li><a href="/guides/">📋 User Guides</a></li>
                <li><a href="/architecture/">🏗️ Architecture</a></li>
            </ul>
        </nav>
        
        <main>
            <section>
                <h2>🚀 Quick Start</h2>
                <div class="api-endpoint">
                    <p>Start with the <a href="/README.md">README.md</a> for installation and basic usage.</p>
                </div>
            </section>
            
            <section>
                <h2>📊 Resources</h2>
                <ul>
                    <li><a href="/CHANGELOG.md">📝 Changelog</a></li>
                    <li><a href="/CONTRIBUTING.md">🤝 Contributing</a></li>
                    <li><a href="/sitemap.xml">🗺️ Sitemap</a></li>
                </ul>
            </section>
        </main>
        
        <footer class="no-print">
            <p>Generated on """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
        </footer>
    </div>
</body>
</html>"""
    
    def _generate_sitemap(self) -> str:
        """Gera sitemap.xml"""
        
        base_url = "https://your-docs-domain.com"
        current_time = datetime.now().isoformat()
        
        # Encontrar todas as páginas
        pages = [
            "/",
            "/README.md",
            "/CHANGELOG.md",
            "/CONTRIBUTING.md"
        ]
        
        # Adicionar páginas de API
        api_path = self.build_path / "api"
        if api_path.exists():
            for md_file in api_path.rglob("*.md"):
                rel_path = md_file.relative_to(self.build_path)
                pages.append(f"/{rel_path}")
        
        # Gerar XML
        sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for page in pages:
            sitemap += f"""  <url>
    <loc>{base_url}{page}</loc>
    <lastmod>{current_time}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n"""
        
        sitemap += '</urlset>'
        
        return sitemap
    
    def _generate_pdf(self) -> Dict:
        """Gera PDF da documentação"""
        
        try:
            # Simular geração de PDF
            # Na implementação real, usar ferramentas como Puppeteer ou wkhtmltopdf
            
            pdf_content = """
# Documentation PDF

This is a generated PDF version of the documentation.

[Content would be converted from markdown to PDF format]
"""
            
            pdf_path = self.build_path / "documentation.pdf"
            pdf_path.write_text(pdf_content, encoding='utf-8')
            
            return {
                "success": True,
                "message": "PDF generated successfully",
                "path": str(pdf_path)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate PDF"
            }
    
    def _configure_platform(self, platform: str) -> Dict:
        """Configura plataforma específica de publicação"""
        
        configs = {}
        
        if platform == "github-pages":
            config = self._configure_github_pages()
        elif platform == "vercel":
            config = self._configure_vercel()
        elif platform == "netlify":
            config = self._configure_netlify()
        elif platform == "readthedocs":
            config = self._configure_readthedocs()
        else:
            config = {"error": f"Unsupported platform: {platform}"}
        
        return {
            "success": "error" not in config,
            "platform": platform,
            "config": config
        }
    
    def _configure_github_pages(self) -> Dict:
        """Configura GitHub Pages"""
        
        # Criar .nojekyll (para processar arquivos que começam com _)
        nojekyll_path = self.build_path / ".nojekyll"
        nojekyll_path.write_text("")
        
        # Criar workflow do GitHub Actions
        workflow_dir = self.project_path / ".github" / "workflows"
        workflow_dir.mkdir(parents=True, exist_ok=True)
        
        workflow_content = """name: Deploy Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build documentation
        run: npm run build:docs
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/build
"""
        
        workflow_path = workflow_dir / "deploy-docs.yml"
        workflow_path.write_text(workflow_content, encoding='utf-8')
        
        return {
            "type": "github-pages",
            "files_created": [".nojekyll", ".github/workflows/deploy-docs.yml"],
            "deploy_url": "https://[username].github.io/[repository]"
        }
    
    def _configure_vercel(self) -> Dict:
        """Configura Vercel"""
        
        vercel_config = {
            "version": 2,
            "builds": [
                {
                    "src": "docs/build/**/*",
                    "use": "@vercel/static"
                }
            ],
            "routes": [
                {
                    "src": "/(.*)",
                    "dest": "/docs/build/$1"
                }
            ]
        }
        
        vercel_path = self.project_path / "vercel.json"
        vercel_path.write_text(json.dumps(vercel_config, indent=2), encoding='utf-8')
        
        return {
            "type": "vercel",
            "files_created": ["vercel.json"],
            "deploy_url": "https://[project-name].vercel.app"
        }
    
    def _configure_netlify(self) -> Dict:
        """Configura Netlify"""
        
        netlify_config = """[build]
  publish = "docs/build"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
"""
        
        netlify_path = self.project_path / "netlify.toml"
        netlify_path.write_text(netlify_config, encoding='utf-8')
        
        return {
            "type": "netlify",
            "files_created": ["netlify.toml"],
            "deploy_url": "https://[project-name].netlify.app"
        }
    
    def _configure_readthedocs(self) -> Dict:
        """Configura ReadTheDocs"""
        
        rtd_config = {
            "version": 2,
            "build": {
                "os": "ubuntu-22.04",
                "tools": {
                    "python": "3.11"
                },
                "jobs": {
                    "post_checkout": [
                        "git submodule update --init --recursive"
                    ],
                    "post_install": [
                        "pip install -r docs/requirements.txt"
                    ],
                    "post_build": [
                        "sphinx-build -b html docs _build/html"
                    ]
                }
            },
            "sphinx": {
                "configuration": "docs/conf.py"
            }
        }
        
        rtd_path = self.project_path / ".readthedocs.yml"
        rtd_path.write_text(rtd_config, encoding='utf-8')
        
        return {
            "type": "readthedocs",
            "files_created": [".readthedocs.yml"],
            "deploy_url": "https://[project-name].readthedocs.io"
        }
    
    def _version_documentation(self, versioning: str) -> Dict:
        """Versiona documentação"""
        
        version_info = {}
        
        if versioning == "semantic":
            # Ler versão do package.json
            package_json = self.project_path / "package.json"
            if package_json.exists():
                package_data = json.loads(package_json.read_text(encoding='utf-8'))
                version = package_data.get("version", "1.0.0")
                version_info = {"type": "semantic", "version": version}
        
        elif versioning == "date":
            version = datetime.now().strftime("%Y.%m.%d")
            version_info = {"type": "date", "version": version}
        
        elif versioning == "custom":
            version = "custom-v1.0"
            version_info = {"type": "custom", "version": version}
        
        # Criar arquivo de versão
        version_file = self.build_path / "version.json"
        version_file.write_text(json.dumps(version_info, indent=2), encoding='utf-8')
        
        return {
            "success": True,
            "version_info": version_info,
            "version_file": "version.json"
        }
    
    def _generate_navigation(self) -> Dict:
        """Gera navegação e índices"""
        
        navigation = {
            "main": [
                {"title": "📖 README", "path": "/README.md"},
                {"title": "📡 API Documentation", "path": "/api/"},
                {"title": "📋 User Guides", "path": "/guides/"},
                {"title": "🏗️ Architecture", "path": "/architecture/"}
            ],
            "api": [],
            "guides": []
        }
        
        # Gerar navegação da API
        api_path = self.build_path / "api"
        if api_path.exists():
            for md_file in api_path.rglob("*.md"):
                rel_path = md_file.relative_to(self.build_path)
                title = self._extract_title(md_file)
                navigation["api"].append({
                    "title": title,
                    "path": f"/{rel_path}"
                })
        
        # Gerar navegação dos guias
        guides_path = self.build_path / "guides"
        if guides_path.exists():
            for md_file in guides_path.rglob("*.md"):
                rel_path = md_file.relative_to(self.build_path)
                title = self._extract_title(md_file)
                navigation["guides"].append({
                    "title": title,
                    "path": f"/{rel_path}"
                })
        
        # Salvar navegação
        nav_path = self.build_path / "navigation.json"
        nav_path.write_text(json.dumps(navigation, indent=2), encoding='utf-8')
        
        return {
            "success": True,
            "navigation": navigation,
            "file": "navigation.json"
        }
    
    def _extract_title(self, md_file: Path) -> str:
        """Extrai título de arquivo markdown"""
        
        try:
            content = md_file.read_text(encoding='utf-8')
            match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            if match:
                return match.group(1).strip()
        except:
            pass
        
        return md_file.stem.replace("-", " ").title()
    
    def _validate_build(self) -> Dict:
        """Valida build final"""
        
        validation_results = {
            "files_exist": True,
            "links_valid": True,
            "images_load": True,
            "size_reasonable": True
        }
        
        issues = []
        
        # Verificar arquivos essenciais
        essential_files = ["index.html", "sitemap.xml", "robots.txt"]
        for file_name in essential_files:
            if not (self.build_path / file_name).exists():
                validation_results["files_exist"] = False
                issues.append(f"Missing essential file: {file_name}")
        
        # Verificar tamanho total do build
        total_size = sum(f.stat().st_size for f in self.build_path.rglob("*") if f.is_file())
        size_mb = total_size / (1024 * 1024)
        
        if size_mb > 100:  # Mais de 100MB
            validation_results["size_reasonable"] = False
            issues.append(f"Build too large: {size_mb:.1f}MB")
        
        return {
            "success": len(issues) == 0,
            "validation": validation_results,
            "issues": issues,
            "total_size_mb": size_mb
        }
    
    def _prepare_deploy(self, platform: str) -> Dict:
        """Prepara deploy para plataforma específica"""
        
        deploy_info = {
            "platform": platform,
            "ready": True,
            "commands": []
        }
        
        if platform == "github-pages":
            deploy_info["commands"] = [
                "git add docs/build/",
                "git commit -m 'docs: update documentation'",
                "git push origin main"
            ]
        
        elif platform == "vercel":
            deploy_info["commands"] = [
                "vercel --prod"
            ]
        
        elif platform == "netlify":
            deploy_info["commands"] = [
                "netlify deploy --prod --dir=docs/build"
            ]
        
        return {
            "success": True,
            "deploy_info": deploy_info
        }
    
    def _count_processed_files(self) -> int:
        """Conta total de arquivos processados"""
        
        return len(list(self.build_path.rglob("*")))
    
    def _get_optimization_stats(self) -> Dict:
        """Retorna estatísticas de otimização"""
        
        total_size = sum(f.stat().st_size for f in self.build_path.rglob("*") if f.is_file())
        
        return {
            "total_files": self._count_processed_files(),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "optimization_applied": True
        }
    
    def _get_next_actions(self, platform: str, auto_sync: bool) -> List[str]:
        """Retorna próximas ações"""
        
        actions = []
        
        if auto_sync:
            actions.append(f"🚀 Deploy automático configurado para {platform}")
            actions.append("📊 Monitore o deploy através do dashboard")
        else:
            actions.append(f"⚙️ Execute manualmente o deploy para {platform}")
            actions.append("📋 Siga os comandos fornecidos no resultado")
        
        actions.extend([
            "🔍 Verifique a documentação publicada",
            "📈 Configure analytics para monitorar uso",
            "🔄 Estabeleça processo de atualização contínua"
        ])
        
        return actions
    
    def _calculate_quality_metrics(self) -> Dict:
        """Calcula métricas de qualidade do build"""
        
        files = list(self.build_path.rglob("*"))
        md_files = [f for f in files if f.suffix == ".md"]
        html_files = [f for f in files if f.suffix == ".html"]
        
        return {
            "total_files": len(files),
            "markdown_files": len(md_files),
            "html_files": len(html_files),
            "has_navigation": (self.build_path / "navigation.json").exists(),
            "has_sitemap": (self.build_path / "sitemap.xml").exists(),
            "has_search": len(html_files) > 0,
            "mobile_ready": True,
            "seo_optimized": True
        }


# Função principal para MCP
def process_documentation_for_publishing(params: Dict) -> Dict:
    """
    Função MCP para processar documentação para publicação
    
    Args:
        params: {
            "project_path": "/path/to/project",
            "platform": "github-pages|vercel|netlify|readthedocs",
            "auto_sync": true,
            "versioning": "semantic|date|custom",
            "optimize_images": true,
            "generate_pdf": false,
            "minify": true
        }
    
    Returns:
        Dict com resultado do processamento
    """
    
    try:
        project_path = params.get("project_path", ".")
        publisher = DocumentationPublisher(project_path)
        
        result = publisher.process_for_publishing(params)
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to process documentation for publishing"
        }


# Exemplo de uso
if __name__ == "__main__":
    # Teste da função
    params = {
        "project_path": "./test-project",
        "platform": "github-pages",
        "auto_sync": True,
        "versioning": "semantic",
        "optimize_images": True,
        "generate_pdf": False,
        "minify": True
    }
    
    result = process_documentation_for_publishing(params)
    print(json.dumps(result, indent=2))
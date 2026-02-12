"""
Kalu Document Generator
========================

Gera relatórios profissionais em PDF, Word e Excel
"""

import json
from datetime import datetime
from typing import Dict, Any
import os

def generate_markdown_report(data: Dict[str, Any], task_title: str) -> str:
    """
    Gera relatório em Markdown (base para conversão)
    
    Args:
        data: Dicionário com dados da análise
        task_title: Título da tarefa
        
    Returns:
        str: Conteúdo em markdown
    """
    md = f"""# {task_title}

**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M')}  
**Gerado por:** Kalu AI Assistant ⚡

---

"""
    
    # Se for JSON, extrair e formatar
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except:
            # Se não for JSON válido, retornar como texto simples
            md += f"## Resultado\n\n{data}\n"
            return md
    
    # Processar estrutura (exemplo: análise de concorrentes)
    if "analise_concorrentes" in data:
        analise = data["analise_concorrentes"]
        
        md += f"## 📊 Informações Gerais\n\n"
        md += f"- **Mercado:** {analise.get('mercado', 'N/A')}\n"
        md += f"- **Segmento:** {analise.get('segmento', 'N/A')}\n"
        md += f"- **Data da Análise:** {analise.get('data', 'N/A')}\n\n"
        
        # Concorrentes Locais
        if "concorrentes_locais" in analise:
            md += "## 🏢 Concorrentes Locais\n\n"
            for c in analise["concorrentes_locais"]:
                md += f"### {c.get('nome', 'N/A')}\n\n"
                md += f"- **Tipo:** {c.get('tipo', 'N/A')}\n"
                md += f"- **Público:** {c.get('publico', 'N/A')}\n"
                md += f"- **Faixa de Preço:** {c.get('faixa_preco', 'N/A')}\n"
                md += f"- **Diferencial:** {c.get('diferencial', 'N/A')}\n\n"
        
        # Concorrentes Internacionais
        if "concorrentes_internacionais" in analise:
            md += "## 🌍 Concorrentes Internacionais\n\n"
            for c in analise["concorrentes_internacionais"]:
                md += f"### {c.get('nome', 'N/A')}\n\n"
                md += f"- **Tipo:** {c.get('tipo', 'N/A')}\n"
                md += f"- **Diferencial:** {c.get('diferencial', 'N/A')}\n\n"
        
        # Análise de Preços
        if "analise_precos" in analise:
            md += "## 💰 Análise de Preços\n\n"
            precos = analise["analise_precos"]
            if "mercado_local" in precos:
                mercado = precos["mercado_local"]
                md += "**Mercado Local:**\n\n"
                for faixa, valor in mercado.items():
                    md += f"- **{faixa.capitalize()}:** {valor}\n"
                md += "\n"
            if "observacoes" in precos:
                md += f"**Observações:** {precos['observacoes']}\n\n"
        
        # Público-Alvo
        if "publico_alvo_identificado" in analise:
            md += "## 🎯 Público-Alvo Identificado\n\n"
            publico = analise["publico_alvo_identificado"]
            md += f"- **Primário:** {publico.get('primario', 'N/A')}\n"
            md += f"- **Secundário:** {publico.get('secundario', 'N/A')}\n"
            if "valores" in publico:
                md += f"- **Valores:** {', '.join(publico['valores'])}\n"
            md += "\n"
        
        # Oportunidades
        if "oportunidades_linha_corpo" in analise:
            md += "## ✅ Oportunidades\n\n"
            for op in analise["oportunidades_linha_corpo"]:
                md += f"### {op.get('area', 'N/A')}\n"
                md += f"{op.get('detalhe', 'N/A')}\n\n"
        
        # Ameaças
        if "ameacas" in analise:
            md += "## ⚠️ Ameaças e Mitigação\n\n"
            for am in analise["ameacas"]:
                md += f"- **Ameaça:** {am.get('ameaca', 'N/A')}\n"
                md += f"  - **Mitigação:** {am.get('mitigacao', 'N/A')}\n\n"
        
        # Recomendações
        if "recomendacoes" in analise:
            md += "## 📋 Recomendações\n\n"
            for rec in analise["recomendacoes"]:
                prioridade = rec.get('prioridade', 'Média')
                emoji = "🔴" if prioridade == "Alta" else "🟡" if prioridade == "Média" else "🟢"
                md += f"### {emoji} {rec.get('acao', 'N/A')}\n"
                md += f"- **Prioridade:** {prioridade}\n"
                md += f"- **Justificativa:** {rec.get('justificativa', 'N/A')}\n\n"
        
        # Faixa de Preço Sugerida
        if "faixa_preco_sugerida" in analise:
            md += "## 💵 Faixa de Preço Sugerida\n\n"
            precos = analise["faixa_preco_sugerida"]
            for tipo, valor in precos.items():
                if tipo != "justificativa":
                    md += f"- **{tipo.capitalize()}:** {valor}\n"
            if "justificativa" in precos:
                md += f"\n**Justificativa:** {precos['justificativa']}\n\n"
        
        # Conclusão
        if "conclusao" in analise:
            md += "## 🎯 Conclusão\n\n"
            md += f"{analise['conclusao']}\n\n"
        
        # Próximos Passos
        if "proximos_passos" in analise:
            md += "## 📌 Próximos Passos\n\n"
            for i, passo in enumerate(analise["proximos_passos"], 1):
                md += f"{i}. {passo}\n"
    
    else:
        # Se não for estrutura conhecida, formatar genericamente
        md += "## 📄 Resultado\n\n"
        md += "```json\n"
        md += json.dumps(data, indent=2, ensure_ascii=False)
        md += "\n```\n"
    
    md += "\n---\n\n"
    md += "*Relatório gerado automaticamente por Kalu AI Assistant*\n"
    
    return md


def save_markdown_report(markdown: str, filename: str, output_dir: str = "/tmp") -> str:
    """
    Salva relatório markdown em ficheiro
    
    Args:
        markdown: Conteúdo em markdown
        filename: Nome do ficheiro (sem extensão)
        output_dir: Directório de output
        
    Returns:
        str: Caminho do ficheiro salvo
    """
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{filename}.md")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    return filepath


def generate_html_content_only(markdown: str) -> str:
    """
    Converte markdown para HTML (apenas conteúdo, sem <html><head>)
    
    Args:
        markdown: Conteúdo em markdown
        
    Returns:
        str: HTML puro (sem tags html/head/body)
    """
    html = markdown
    
    # Conversões básicas de markdown para HTML
    # Títulos
    import re
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    
    # Negrito
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    
    # Itálico
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Listas
    html = re.sub(r'^\- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'((?:<li>.*?</li>\n)+)', r'<ul>\1</ul>', html)
    
    # Parágrafos (texto entre linhas vazias)
    html = re.sub(r'\n\n(.+?)\n\n', r'\n\n<p>\1</p>\n\n', html)
    
    # Horizontal rule
    html = html.replace('---', '<hr>')
    
    # Limpar quebras de linha múltiplas
    html = re.sub(r'\n{3,}', '\n\n', html)
    
    return html

def generate_html_report(markdown: str) -> str:
    """
    Converte markdown para HTML com estilo
    
    Args:
        markdown: Conteúdo em markdown
        
    Returns:
        str: HTML estilizado
    """
    # Conversões básicas de markdown para HTML
    html = markdown
    
    # Títulos
    html = html.replace('# ', '<h1>').replace('\n', '</h1>\n', 1)
    html = html.replace('## ', '<h2>').replace('\n', '</h2>\n')
    html = html.replace('### ', '<h3>').replace('\n', '</h3>\n')
    
    # Negrito
    import re
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    
    # Listas
    html = re.sub(r'^\- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'((?:<li>.*</li>\n)+)', r'<ul>\1</ul>', html)
    
    # Parágrafos
    html = re.sub(r'\n\n(.+?)\n\n', r'\n\n<p>\1</p>\n\n', html)
    
    # Template HTML completo
    html_template = f"""<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Kalu</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }}
        h1 {{
            color: #1f77b4;
            border-bottom: 3px solid #1f77b4;
            padding-bottom: 0.5rem;
        }}
        h2 {{
            color: #2c3e50;
            margin-top: 2rem;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.3rem;
        }}
        h3 {{
            color: #34495e;
            margin-top: 1.5rem;
        }}
        ul {{
            margin: 1rem 0;
        }}
        li {{
            margin: 0.5rem 0;
        }}
        strong {{
            color: #2c3e50;
        }}
        p {{
            margin: 1rem 0;
        }}
        hr {{
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 2rem 0;
        }}
        .footer {{
            margin-top: 3rem;
            text-align: center;
            color: #95a5a6;
            font-size: 0.9rem;
        }}
    </style>
</head>
<body>
    {html}
    <div class="footer">
        <p><em>Relatório gerado automaticamente por Kalu AI Assistant ⚡</em></p>
    </div>
</body>
</html>"""
    
    return html_template


def save_html_report(html: str, filename: str, output_dir: str = "/tmp") -> str:
    """
    Salva relatório HTML
    
    Args:
        html: Conteúdo HTML
        filename: Nome do ficheiro (sem extensão)
        output_dir: Directório de output
        
    Returns:
        str: Caminho do ficheiro salvo
    """
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{filename}.html")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return filepath


def generate_report(data: Dict[str, Any], task_title: str, output_format: str = "markdown", 
                   filename: str = None, output_dir: str = "/tmp", content_only: bool = False) -> str:
    """
    Gera relatório no formato especificado
    
    Args:
        data: Dados para o relatório
        task_title: Título da tarefa
        output_format: Formato (markdown, html, pdf, docx, xlsx)
        filename: Nome do ficheiro (gerado automaticamente se None)
        output_dir: Directório de output
        
    Returns:
        str: Caminho do ficheiro gerado
    """
    if filename is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"relatorio_kalu_{timestamp}"
    
    # Gerar markdown base
    markdown = generate_markdown_report(data, task_title)
    
    if output_format == "markdown":
        return save_markdown_report(markdown, filename, output_dir)
    
    elif output_format == "html":
        if content_only:
            # Retorna apenas conteúdo HTML (sem html/head/body tags)
            html_content = generate_html_content_only(markdown)
            return html_content  # Retorna string, não salva em ficheiro
        else:
            html = generate_html_report(markdown)
            return save_html_report(html, filename, output_dir)
    
    elif output_format == "pdf":
        # HTML primeiro, depois converter para PDF
        html = generate_html_report(markdown)
        html_path = save_html_report(html, filename, output_dir)
        
        # TODO: Adicionar conversão HTML -> PDF (requer wkhtmltopdf ou similar)
        # Por enquanto retorna HTML
        return html_path
    
    elif output_format == "docx":
        # TODO: Implementar geração de Word (.docx)
        # Por enquanto retorna markdown
        return save_markdown_report(markdown, filename, output_dir)
    
    elif output_format == "xlsx":
        # TODO: Implementar geração de Excel (.xlsx)
        # Por enquanto retorna markdown
        return save_markdown_report(markdown, filename, output_dir)
    
    else:
        raise ValueError(f"Formato não suportado: {output_format}")


if __name__ == "__main__":
    # Teste
    sample_data = {
        "analise_concorrentes": {
            "data": "2026-02-12",
            "mercado": "Angola - Luanda",
            "conclusao": "Teste de relatório"
        }
    }
    
    filepath = generate_report(sample_data, "Teste Relatório", "html")
    print(f"Relatório gerado: {filepath}")

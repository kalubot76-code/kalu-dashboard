"""
Kalu Dashboard Integration
===========================

Script de exemplo para o Kalu verificar e processar tarefas do dashboard.
Usar no HEARTBEAT ou como módulo standalone.
"""

import requests
from typing import List, Dict, Optional
from datetime import datetime
import json

# Configuração
API_URL = "https://kalu-dashboard-api.onrender.com"  # Ajustar conforme deployment


class KaluDashboard:
    """Cliente para interagir com Kalu Dashboard API"""
    
    def __init__(self, api_url: str = API_URL):
        self.api_url = api_url.rstrip('/')
        
    def get_pending_tasks(self) -> List[Dict]:
        """
        Obtém tarefas pendentes assignadas ao Kalu
        
        Returns:
            List[Dict]: Lista de tarefas pendentes
        """
        try:
            response = requests.get(f"{self.api_url}/tasks/pending", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Erro ao obter tarefas: {e}")
            return []
    
    def add_task_result(
        self,
        task_id: int,
        resultado: str,
        resultado_tipo: str = "text",
        resultado_url: Optional[str] = None
    ) -> bool:
        """
        Adiciona resultado de uma tarefa
        
        Args:
            task_id: ID da tarefa
            resultado: Conteúdo do resultado (JSON string, texto, etc)
            resultado_tipo: Tipo do resultado (json, text, file, image)
            resultado_url: URL opcional para ficheiro externo
            
        Returns:
            bool: True se sucesso, False caso contrário
        """
        try:
            payload = {
                "resultado": resultado,
                "resultado_tipo": resultado_tipo
            }
            if resultado_url:
                payload["resultado_url"] = resultado_url
            
            response = requests.post(
                f"{self.api_url}/tasks/{task_id}/result",
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            print(f"✅ Resultado adicionado à tarefa #{task_id}")
            return True
        except Exception as e:
            print(f"❌ Erro ao adicionar resultado: {e}")
            return False
    
    def process_task(self, task: Dict) -> Optional[Dict]:
        """
        Processa uma tarefa (implementar lógica específica)
        
        Args:
            task: Dicionário com dados da tarefa
            
        Returns:
            Dict: Resultado do processamento, ou None se falhar
        """
        print(f"\n🔄 Processando tarefa #{task['id']}: {task['titulo']}")
        print(f"   Empresa: {task['empresa']}")
        print(f"   Prioridade: {task['prioridade']}")
        print(f"   Descrição: {task.get('descricao', 'N/A')}")
        
        # TODO: Implementar lógica de processamento baseada no tipo de tarefa
        # Exemplo:
        
        if "relatório" in task['titulo'].lower():
            return self._generate_report(task)
        elif "json" in task['titulo'].lower():
            return self._generate_json(task)
        elif "documento" in task['titulo'].lower():
            return self._generate_document(task)
        else:
            return {
                "status": "processado",
                "mensagem": "Tarefa processada com sucesso",
                "timestamp": datetime.now().isoformat()
            }
    
    def _generate_report(self, task: Dict) -> Dict:
        """Gera relatório (exemplo)"""
        return {
            "tipo": "relatório",
            "empresa": task['empresa'],
            "dados": {
                "total_items": 42,
                "status": "completo"
            },
            "gerado_em": datetime.now().isoformat()
        }
    
    def _generate_json(self, task: Dict) -> Dict:
        """Gera JSON (exemplo)"""
        return {
            "task_id": task['id'],
            "empresa": task['empresa'],
            "resultado": "JSON gerado com sucesso"
        }
    
    def _generate_document(self, task: Dict) -> Dict:
        """Gera documento (exemplo)"""
        return {
            "tipo": "documento",
            "formato": "markdown",
            "conteudo": f"# {task['titulo']}\n\nDocumento gerado automaticamente."
        }


def heartbeat_check():
    """
    Função para ser chamada no heartbeat do Kalu
    Verifica tarefas pendentes e processa as de alta prioridade
    """
    print("\n⚡ Kalu Dashboard Heartbeat")
    print("=" * 50)
    
    dashboard = KaluDashboard()
    
    # Obter tarefas pendentes
    tasks = dashboard.get_pending_tasks()
    
    if not tasks:
        print("✅ Sem tarefas pendentes")
        return
    
    print(f"📋 {len(tasks)} tarefa(s) pendente(s)\n")
    
    # Processar tarefas de alta prioridade primeiro
    high_priority = [t for t in tasks if t['prioridade'] == 'Alta']
    
    for task in high_priority:
        try:
            # Processar tarefa
            result = dashboard.process_task(task)
            
            if result:
                # Converter resultado para JSON string
                result_json = json.dumps(result, ensure_ascii=False, indent=2)
                
                # Adicionar resultado à tarefa
                success = dashboard.add_task_result(
                    task_id=task['id'],
                    resultado=result_json,
                    resultado_tipo="json"
                )
                
                if success:
                    print(f"✅ Tarefa #{task['id']} concluída")
                else:
                    print(f"⚠️ Tarefa #{task['id']} processada mas resultado não guardado")
        except Exception as e:
            print(f"❌ Erro ao processar tarefa #{task['id']}: {e}")
    
    # Listar tarefas de prioridade média/baixa (só notificar)
    other_tasks = [t for t in tasks if t['prioridade'] != 'Alta']
    if other_tasks:
        print(f"\n📌 {len(other_tasks)} tarefa(s) de prioridade média/baixa pendente(s)")
        for task in other_tasks[:3]:  # Mostrar só as 3 primeiras
            print(f"   - {task['titulo']} ({task['empresa']})")
    
    print("\n" + "=" * 50)


def example_usage():
    """Exemplo de uso directo"""
    dashboard = KaluDashboard()
    
    # Listar tarefas pendentes
    tasks = dashboard.get_pending_tasks()
    print(f"Tarefas pendentes: {len(tasks)}")
    
    # Processar primeira tarefa (se existir)
    if tasks:
        task = tasks[0]
        result = dashboard.process_task(task)
        
        if result:
            # Adicionar resultado
            dashboard.add_task_result(
                task_id=task['id'],
                resultado=json.dumps(result),
                resultado_tipo="json"
            )


if __name__ == "__main__":
    # Executar heartbeat check
    heartbeat_check()
    
    # Ou usar directamente:
    # example_usage()

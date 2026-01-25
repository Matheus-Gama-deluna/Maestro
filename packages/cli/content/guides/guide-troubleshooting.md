# 🔧 Guia de Troubleshooting

> Resolva problemas comuns e estados de bloqueio no Maestro FS.

---

## 🛑 Gate Bloqueado (Score < 70)

Se o workflow `/02-avancar-fase` te bloqueou, mas você **precisa** avançar (ex: é um projeto legado ou você validou manualmente de outra forma):

### A Solução "Limpa"
1.  Leia o relatório de erro.
2.  Corrija os arquivos (ex: adicione os cabeçalhos faltantes).
3.  Tente novamente.

### A Solução "Force" (Manual)
O Maestro FS previne avanços sujos via comando, então você deve editar o estado manualmente:

1.  Abra `.maestro/estado.json`.
2.  Localize e **remova** os campos de bloqueio:
    *   `score_bloqueado`
    *   `motivo_bloqueio`
    *   `aguardando_aprovacao`
3.  Salve o arquivo.
4.  Execute `/02-avancar-fase` novamente.

---

## ⚠️ Estado Dessincronizado

Se a IA diz que você está na Fase 3, mas você já terminou a Fase 5:

1.  Abra `.maestro/estado.json`.
2.  Edite `fase_atual` para o número correto.
3.  Verifique se o array `entregaveis` contém os caminhos dos arquivos das fases anteriores.

---

## 📄 Arquivos Faltando

Se um comando falhar dizendo `File not found: rules/structure-rules.md`:
1.  Execute `/09-atualizar-mapa` para garantir que o sistema conhece a estrutura.
2.  Se o arquivo realmente sumiu, copie do template original em `packages/cli/content/rules/`.

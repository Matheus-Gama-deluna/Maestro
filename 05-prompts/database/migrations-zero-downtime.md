# Prompt: Database Migrations Zero-Downtime

> **Prioridade**: 🟠 ALTA  
> **Aplicável a**: Sistemas em produção com tráfego contínuo

---

## Contexto

Migrations tradicionais podem causar downtime ou erros quando aplicadas em sistemas ativos. Este prompt ajuda a planejar migrations seguras.

---

## Prompt Base: Planejar Migration

```text
Atue como DBA especialista em migrations zero-downtime.

Preciso fazer a seguinte alteração no banco de dados:
[DESCREVA A ALTERAÇÃO: ex. renomear coluna, alterar tipo, adicionar índice]

Contexto:
- Banco: [PostgreSQL/MySQL/SQL Server]
- Tamanho da tabela: [ex. 5 milhões de registros]
- Tráfego: [ex. 100 writes/min]
- Deploy: [blue-green/rolling/single server]

Gere um plano de migration com:

1. **Análise de Risco**
   - A operação bloqueia a tabela?
   - Tempo estimado de execução
   - Impacto em queries ativas

2. **Estratégia de Migration**
   - Quantos deploys são necessários?
   - Ordem das alterações
   - Scripts SQL para cada step

3. **Backward Compatibility**
   - Como manter código antigo funcionando?
   - Triggers ou dual-write necessários?

4. **Rollback Plan**
   - Como reverter cada step?
   - Dados perdidos em rollback?

5. **Monitoramento**
   - O que observar durante a migration?
   - Alertas a configurar

Siga o padrão Expand-Contract quando aplicável.
```

---

## Prompt: Migrar Coluna com Dados

```text
Tenho uma coluna que precisa ser transformada:
- Tabela: [NOME]
- Coluna atual: [NOME, TIPO]
- Transformação: [ex. split em duas colunas, mudar encoding, converter unidade]
- Registros: [QUANTIDADE]

Stack: [DESCREVA ORM/Framework]

Gere:
1. Scripts SQL para cada fase (expand, migrate, contract)
2. Job de backfill com batches
3. Código para dual-write durante transição
4. Verificações de integridade após migration
```

---

## Prompt: Adicionar Índice em Tabela Grande

```text
Preciso adicionar um índice para melhorar performance:
- Tabela: [NOME], [X milhões de registros]
- Índice: [COLUNAS, TIPO]
- Banco: [PostgreSQL/MySQL]
- Tolerância a downtime: [zero/alguns segundos]

Gere:
1. Comando para criar índice sem bloquear (CONCURRENTLY, ONLINE)
2. Estimativa de tempo baseada no tamanho
3. Monitoramento durante criação
4. Verificação de que o índice está sendo usado
5. Plano B se a criação falhar
```

---

## Prompt: Revisar Migration Existente

```text
Tenho este script de migration:
[COLE O SCRIPT]

Contexto:
- Ambiente: produção com [X] req/s
- Deploy: [TIPO]
- Banco: [TIPO E VERSÃO]

Analise:
1. Há operações que bloqueiam tabelas?
2. É backward compatible?
3. O rollback é possível?
4. Há riscos de perda de dados?

Sugira versão zero-downtime se necessário.
```

---

## Exemplo: Migration Segura Completa

### Cenário: Renomear `name` para `full_name`

```sql
-- DEPLOY 1: Expand
-- Adiciona nova coluna
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Cria trigger para sincronizar
CREATE OR REPLACE FUNCTION sync_user_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.full_name IS NULL THEN
        NEW.full_name := NEW.name;
    END IF;
    IF NEW.name IS NULL THEN
        NEW.name := NEW.full_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_name
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_user_name();
```

```python
# DEPLOY 1: Código dual-write
class User:
    def save(self):
        self.full_name = self.name  # Sync
        db.save(self)
```

```sql
-- DEPLOY 1: Backfill (pode rodar após deploy)
UPDATE users SET full_name = name WHERE full_name IS NULL;
-- Em batches para tabelas grandes:
-- UPDATE users SET full_name = name WHERE full_name IS NULL LIMIT 10000;
```

```python
# DEPLOY 2: Código usa nova coluna
class User:
    @property
    def display_name(self):
        return self.full_name  # Usa nova coluna
```

```sql
-- DEPLOY 3: Contract (após confirmar que nenhum código antigo está ativo)
DROP TRIGGER trg_sync_user_name ON users;
DROP FUNCTION sync_user_name();
ALTER TABLE users DROP COLUMN name;
```

---

## Checklist

- [ ] Testei em staging com dados similares a produção
- [ ] Medi tempo de execução em tabela grande
- [ ] Documentei cada step e ordem de execução
- [ ] Preparei scripts de rollback
- [ ] Informei time sobre janela de migration
- [ ] Backup recente existe e foi testado
- [ ] Monitoramento configurado

---

## Referências

Consulte: [Guia de Migrations Zero-Downtime](../03-guias/Guia%20de%20Migrations%20Zero-Downtime.md)

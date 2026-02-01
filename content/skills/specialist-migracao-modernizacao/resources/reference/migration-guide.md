# Guia - Migração

## Estratégias

### Strangler Fig
Substituir gradualmente funcionalidades do sistema legado

### Big Bang
Migração completa de uma vez (alto risco)

### Parallel Run
Executar ambos sistemas em paralelo

## Fases Típicas
1. Análise do sistema legado
2. Criação do plano de migração
3. Setup do novo ambiente
4. Migração incremental
5. Testes de regressão
6. Cutover
7. Descomissionamento do legado

## Riscos Comuns
- Perda de dados
- Downtime prolongado
- Funcionalidades quebradas
- Performance degradada

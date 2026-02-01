# Task: Migração para Arquitetura de Skills

## 🧠 Phase 1: Planning & Design
- [x] Analyze current file structure (`specialists`, `prompts`, `workflows`) <!-- id: 0 -->
- [x] Create Execution Plan (`docs/PLAN_SKILLS_MIGRATION_EXECUTION.md`) <!-- id: 1 -->
- [ ] Design Flow Adaptation (`docs/ARCHITECTURE_FLOW_ADAPTATION.md`) <!-- id: 2 -->
- [ ] Define "Universal Skill Adapter" specs <!-- id: 3 -->

## 🏗️ Phase 2: Infrastructure
- [ ] Update `packages/cli/content/guides/fases-mapeamento.md` with Skills column <!-- id: 4 -->
- [ ] Create directory structure `packages/cli/content/skills/` <!-- id: 5 -->
- [ ] Create `packages/cli/content/skills/README.md` (documentation) <!-- id: 6 -->

## 📦 Phase 3: Content Migration (Pilot Skills)
- [ ] **Skill: Product Management** <!-- id: 7 -->
    - [ ] Create folder `skills/product-management`
    - [ ] Migrate `PRD.md` template
    - [ ] Migrate Discovery prompts
    - [ ] Create `gate-rules.md` for Gate 1
- [ ] **Skill: Frontend Engineering** <!-- id: 8 -->
    - [ ] Create folder `skills/frontend-engineering`
    - [ ] Migrate stack guides
    - [ ] Create `gate-rules.md`
- [ ] **Skill: Security Engineering** <!-- id: 9 -->
    - [ ] Create folder `skills/security-engineering`
    - [ ] Migrate `checklist-seguranca.md`

## 🔄 Phase 4: Workflow Refactoring
- [ ] Update `/02-avancar-fase.md` to use Dynamic Skill Loader <!-- id: 10 -->
- [ ] Update `/04-implementar-historia.md` to detect Frontend/Backend skill <!-- id: 11 -->

## ✅ Phase 5: Verification
- [ ] Dry Run: Simulate a project lifecycle with new files <!-- id: 12 -->
- [ ] Verify if "Universal Adapter" works for IDEs <!-- id: 13 -->

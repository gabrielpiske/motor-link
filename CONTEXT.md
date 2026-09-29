# CONTEXT.md — Motor-Link

## 1. Visão Geral do Projeto
O **Motor-Link** é uma plataforma educacional e interativa desenvolvida para a **Unidade Curricular de Eletrônica de Potência e Comandos Elétricos (SENAI)**. 

O projeto combina uma **aplicação web moderna (Next.js + TypeScript + Firebase)** hospedada na nuvem (Vercel) com uma **bancada física real** composta por:
* Arduino Uno;
* Módulo relé de 1 canal (contatos COM, NO/NA, NC/NF);
* Circuito de comando industrial em 24VDC (sinalizadores, botões, botoeiras);
* Circuito de força em 220VAC trifásico (contatores e motor elétrico trifásico de indução).

Além de atuar como **IHM (Interface Homem-Máquina) Didática** para controle e supervisão, a plataforma é um **ambiente de ensino**, trazendo teoria interativa, diagramas animados do circuito e desafios conceituais.

---

## 2. Pilares da Plataforma

### 2.1. Controle e Supervisão em Tempo Real (IHM Didática)
* O aluno acessa a plataforma em seu smartphone (ou tablet/PC) através da URL pública na Vercel.
* Ao acionar comandos (Partida Direta, Parada, Emergência), a ação é sincronizada instantaneamente via Firebase até a bancada física conectada ao computador do professor.
* Feedback visual e sonoro em tempo real do estado da máquina.

### 2.2. Ensino e Educação de Conteúdo (Trilha Pedagógica)
* **Diagrama Interativo do Circuito:** Animação esquemática demonstrando o fluxo da corrente (Nível Lógico 5V ➔ Isolação Galvânica do Relé ➔ Comando 24V ➔ Bobina do Contator ➔ Rede Trifásica 220V ➔ Motor).
* **Fundamentos de Eletrônica de Potência:**
  - Funcionamento de relés eletromecânicos e contatores (bobina, campo magnético, arco voltaico, contatos principais e auxiliares).
  - Isolação galvânica por optoacoplador e proteção contra surtos (diodo flyback/roda-livre).
  - Leitura e interpretação de diagramas unifilares e multifilares.
* **Segurança e Intertravamento Industrial:** Ensino das normas de segurança (NR-10 e NR-12), importância do botão de emergência físico/lógico e circuitos de retenção (selo).

---

## 3. Topologia e Arquitetura de Comunicação (Cloud ↔ Hardware)

Como a aplicação estará hospedada na nuvem (Vercel) e o Arduino Uno não possui conexão de rede própria, a comunicação ocorre através da seguinte cadeia:

```
[Smartphone do Aluno] ── (HTTPS / WSS) ──┐
[Notebook dos Alunos] ── (HTTPS / WSS) ──┼──► [Next.js App na Vercel]
                                         │            │
                                         │     (Leitura / Escrita)
                                         │            ▼
                                         └──► [Firebase (Firestore / RTDB)]
                                                      ▲
                                                      │ (Sync em Tempo Real)
                                                      ▼
                                       [Local Bridge / Host no Notebook]
                                                      │
                                                      │ (Serial COM via USB)
                                                      ▼
                                              [Arduino Uno (5V)]
                                                      │ (Pino Digital)
                                                      ▼
                                            [Módulo Relé (1 Canal)]
                                                 [COM | NO | NC]
                                                      │ (Chaveamento 24V)
                                                      ▼
                                           [Painel de Comando 24V]
                                           ├── Sinalizador Luminoso
                                           └── Bobina do Contator (K1)
                                                      │ (Potência 220V 3F)
                                                      ▼
                                            [Motor Trifásico]
```

### Abordagens para a Ponte Local (Bridge):
1. **Bridge Via Web Serial API (Nativa no Navegador):**
   - O professor abre a página `/admin` ou `/painel-bancada` no Google Chrome/Edge no seu notebook e clica em *"Conectar Arduino"*.
   - O próprio navegador se conecta à porta COM via Web Serial API e sincroniza os estados com o Firebase, **sem necessidade de instalar nenhum executável adicional** na máquina.
2. **Bridge Via Daemon Node.js Local:**
   - Um script de terminal leve em Node.js com a biblioteca `serialport` escutando o Firebase e repassando para a porta COM configurada.

---

## 4. Hardware e Ligações Elétricas

### 4.1. Arduino Uno e Módulo Relé (1 Canal)
* **Alimentação:** 5V e GND vindos do Arduino Uno.
* **Sinal de Controle (IN):** Conectado a um pino digital do Arduino (ex: `D7`).
* **Lógica do Relé:** Ativação em nível baixo (Active LOW) ou nível alto (Active HIGH) configurável.

### 4.2. Lado de Potência do Relé (Isolação Galvânica)
* **COM (Comum):** Recebe o +24VDC da fonte de comando do painel elétrico.
* **NO (Normally Open / Normalmente Aberto):** Vai para a bobina do contator (A1 do K1) ou lâmpada de sinalização "Motor Ligado".
* **NC (Normally Closed / Normalmente Fechado):** Pode ser conectado à sinaleira "Motor Desligado" (opcional).
* O retorno da bobina (A2 do K1) é ligado ao 0V (GND) da fonte de 24V.

### 4.3. Circuito Trifásico (220VAC)
* Os contatos de força do contator K1 (1-L1, 3-L2, 5-L3 e 2-T1, 4-T2, 6-T3) chaveiam a alimentação trifásica 220V que chega até o motor de indução, garantindo isolamento total do circuito digital e de comando.

---

## 5. Stack Tecnológica
* **Frontend & Backend (Full-stack):** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (para animações didáticas do circuito).
* **Banco de Dados & Tempo Real:** Firebase (Firestore para conteúdo didático/usuários e Realtime Database para sincronização de baixa latência dos comandos da bancada).
* **Deploy:** Vercel (CI/CD integrado com o GitHub).
* **Firmware:** Arduino C/C++ (protocolo serial estruturado com watchdog de segurança).

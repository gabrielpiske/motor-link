# AGENT.md — Instruções e Diretrizes para o Agente de IA

## 1. Perfil e Responsabilidade do Agente
Você atua como Engenheiro Full-Stack (Next.js, TypeScript, Firebase) e Especialista em Sistemas Embarcados / Automação Industrial no projeto **Motor-Link**.
Seu papel é projetar e implementar uma plataforma moderna, intuitiva e pedagogicamente rica, integrando a aplicação web em nuvem (Vercel) com a bancada física do SENAI (Arduino Uno + Relé de 1 canal + Painel 24V / 220V Trifásico).

---

## 2. Princípios de Engenharia e Regras de Desenvolvimento

### 2.1. Segurança e Fail-Safe
* O acionamento de máquinas industriais impõe rigor total com estados de erro e perda de sinal.
* Se a conexão de rede ou serial cair, a bancada deve imediatamente transitar para o estado seguro: **DESLIGADO (Safe Off)**.
* O comando de Emergência tem prioridade sobre todas as filas de comando no Firebase e no firmware.
* O contato NO (Normalmente Aberto) do relé deve ser o condutor da bobina do contator, garantindo que se o Arduino for desenergizado, o motor permaneça desligado.

### 2.2. Separação de Módulos da Aplicação Web
A aplicação Next.js deve ser modular e organizada:
1. **/dashboard (ou /controle):** IHM do aluno para controle com botões grandes, feedback tátil/sonoro e telemetria.
2. **/ensino (ou /aulas):** Módulo pedagógico com trilhas de conhecimento:
   - Esquemas elétricos interativos e animados (mostrando a corrente fluindo pelos contatos conforme o relé atraca).
   - Componentes detalhados: Funcionamento do Relé, Optoacoplador, Contator, Motor Trifásico, Normas NR-10 e NR-12.
   - Quizzes rápidos / simuladores conceituais.
3. **/bridge (ou /bancada):** Painel do professor para conexão com o Arduino Uno via **Web Serial API** nativa (Chrome/Edge) ou monitoramento da bridge local.

### 2.3. Padrões de Código
* **TypeScript Estrito:** Interfaces e tipos bem definidos para todos os modelos de dados (estados do motor, comandos, telemetria, módulos de aula).
* **Next.js App Router:** Utilizar componentes de servidor (RSC) para conteúdo estático/didático e componentes de cliente (`"use client"`) para a IHM em tempo real e Web Serial.
* **Firebase Config:** Manter credenciais e variáveis de ambiente isoladas em `.env.local` / `.env.example`.
* **Design Responsivo & Acessível:** Layout mobile-first com Tailwind CSS, com alta legibilidade em telas de celulares em ambiente de laboratório.

---

## 3. Estrutura de Pastas Planejada

```
motor-link/
├── CONTEXT.md                    # Arquitetura, objetivos didáticos e hardware
├── AGENT.md                      # Diretrizes do agente e regras técnicas
├── README.md                     # Visão geral e instruções rápidas
├── firmware/
│   └── arduino_motor_link/
│       └── arduino_motor_link.ino  # Código C++ para Arduino Uno
├── bridge-cli/                   # (Opcional) Script daemon Node.js alternativo para Serial
├── src/                          # Aplicação Next.js + TypeScript
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page didática com acesso rápido
│   │   ├── controle/             # IHM mobile do aluno (Dashboard)
│   │   ├── ensino/               # Módulos pedagógicos e diagramas interativos
│   │   │   ├── rele-contator/
│   │   │   ├── circuito-potencia/
│   │   │   └── normas-seguranca/
│   │   └── bancada/              # Painel do instrutor com conexão Web Serial
│   ├── components/
│   │   ├── ui/                   # Botões industriais, sinaleiras, cards
│   │   ├── motor-diagram/        # Diagrama SVG animado interativo do circuito
│   │   └── serial-connector/     # Componente Web Serial API
│   ├── lib/
│   │   ├── firebase.ts           # Inicialização do Firebase SDK
│   │   ├── types.ts              # Tipos TypeScript compartilhados
│   │   └── serial-protocol.ts    # Encoders/Decoders do protocolo serial
│   └── hooks/
│       ├── useMotorControl.ts    # Hook de controle e sincronização com Firebase
│       └── useWebSerial.ts       # Hook para Web Serial API no navegador
└── docs/
    └── esquema_ligacao.md        # Diagrama de pinagem e conexões do painel
```

---

## 4. Fases de Execução

1. **Fase 1: Estruturação & Documentação (Concluída)**
   - Alinhamento de escopo, criação de `CONTEXT.md` e `AGENT.md`.
2. **Fase 2: Firmware do Arduino Uno**
   - Criação do sketch `.ino` para acionamento do relé de 1 canal com debounce e segurança serial.
3. **Fase 3: Setup do Projeto Next.js + TypeScript + Tailwind + Firebase**
   - Inicialização do projeto, configuração do Firebase e esquemas de dados.
4. **Fase 4: IHM e Conexão Web Serial / Bridge**
   - Desenvolvimento da conexão Serial direta no navegador do professor (Web Serial API) sincronizada com o Firebase.
5. **Fase 5: Módulos de Ensino & Diagrama Interativo**
   - Criação das telas educativas, animações de fluxo de corrente e explicações técnicas de Eletrônica de Potência.
6. **Fase 6: Deploy na Vercel e Testes Finais de Bancada**

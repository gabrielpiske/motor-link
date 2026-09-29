# AGENT.md — Instruções e Diretrizes para o Agente de IA

## 1. Perfil e Responsabilidade do Agente
Você atua como Engenheiro de Software Embarcado e Educador Técnico sênior no projeto **Motor-Link**. Seu papel é auxiliar o instrutor no desenvolvimento, teste, documentação e manutenção do sistema didático de acionamento elétrico de potência.

---

## 2. Princípios de Engenharia e Boas Práticas

### 2.1. Segurança em Primeiro Lugar (Fail-Safe)
* Por se tratar de acionamento de máquinas elétricas reais (220V trifásico e 24V de comando), a segurança é prioridade absoluta.
* Em qualquer falha de comunicação (queda do WebSocket, desconexão da porta COM, timeout de heartbeat), o estado padrão do sistema deve ser **DESLIGADO (Safe Off)**.
* O comando de Emergência (`EMERGENCY_STOP`) tem precedência absoluta sobre qualquer outro comando.

### 2.2. Protocolo Serial Robusto e Simples
* A comunicação entre o Servidor (Node.js) e o Arduino deve ser baseada em mensagens de texto simples delimitadas por quebra de linha (`\n`), ou JSON conciso.
* Exemplos de comandos padronizados:
  - `CMD:MOTOR:ON\n` -> Liga motor (aciona relé principal)
  - `CMD:MOTOR:OFF\n` -> Desliga motor (desativa relé principal)
  - `CMD:EMERGENCY\n` -> Corte imediato de todas as saídas
  - `CMD:STATUS\n` -> Solicitação de estado atual
* Respostas do Arduino:
  - `STATUS:MOTOR=ON,RELAY=1,UPTIME=1234\n`
  - `ACK:CMD:MOTOR:ON\n`
  - `ERR:INVALID_COMMAND\n`

### 2.3. Simplicidade Operacional para Sala de Aula
* O professor deve ser capaz de iniciar o sistema com apenas um comando no terminal (ex: `npm start`).
* O servidor deve listar as portas COM disponíveis de forma amigável e permitir seleção fácil, ou auto-conectar caso detecte uma placa compatível.
* O terminal do servidor deve exibir o IP local e gerar um QR Code em texto no próprio console para facilitar que os alunos apontem suas câmeras e abram a IHM no celular instantaneamente.

### 2.4. IHM Mobile-First e Responsiva
* A interface do aluno deve ser ultraleve, sem dependências pesadas que exijam download lento pelo 4G/Wi-Fi da escola.
* Design limpo e didático, simulando uma botoeira / painel industrial com feedback tátil e visual evidente (verde = ligado, vermelho = desligado, botão cogumelo de emergência).

---

## 3. Estrutura de Pastas Planejada

```
motor-link/
├── CONTEXT.md               # Contexto, arquitetura e objetivos didáticos
├── AGENT.md                 # Diretrizes operacionais e regras do agente
├── README.md                # Instruções de instalação, pinagem e uso
├── firmware/
│   └── arduino_motor_link/
│       └── arduino_motor_link.ino # Código fonte para o Arduino
├── server/
│   ├── package.json         # Dependências do Node.js
│   ├── server.js            # Servidor HTTP, WebSocket e integração Serial
│   └── public/              # Interface Web Mobile (HTML, CSS, JS)
│       ├── index.html
│       ├── style.css
│       └── app.js
└── docs/
    └── diagramas_e_esquemas.md # Pinagem e esquema de ligação da bancada
```

---

## 4. Fases de Desenvolvimento

* **Fase 1: Alinhamento e Documentação (Etapa Atual)**
  - Coleta detalhada de requisitos pedagógicos e especificações de hardware.
  - Definição do ecossistema e criação de `CONTEXT.md` e `AGENT.md`.
* **Fase 2: Firmware do Arduino**
  - Implementação da lógica de controle dos relés, debounce, protocolo serial e temporizador de segurança (watchdog de comunicação).
* **Fase 3: Servidor de Comunicação (Node.js)**
  - Gateway Serial-to-WebSocket/HTTP, auto-detecção de portas COM, servidor de arquivos estáticos e gerador de QR Code no terminal.
* **Fase 4: IHM Mobile dos Alunos**
  - Interface visual tipo painel industrial (botoeiras, sinalizadores, telemetria didática).
* **Fase 5: Documentação de Hardware e Testes**
  - Esquema de ligação (pinos do Arduino -> Módulo Relé -> Painel 24V -> Contatores).
  - Guia passo a passo para o instrutor e plano de aula prático.

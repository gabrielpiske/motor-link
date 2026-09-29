# CONTEXT.md — Motor-Link

## 1. Visão Geral do Projeto
O **Motor-Link** é um ecossistema didático para a **Unidade Curricular de Eletrônica de Potência e Comandos Elétricos (SENAI)**. O propósito é permitir que os alunos compreendam visual e praticamente a cadeia de acionamento eletroeletrônico de potência, desde o nível lógico de controle até o comando de máquinas elétricas industriais.

Através do projeto, os alunos utilizam seus próprios smartphones como uma **IHM (Interface Homem-Máquina) Didática**, controlando o acionamento e monitorando o status de contatores, sinalizadores e motores trifásicos, sem necessidade de estarem conectados fisicamente por fios à bancada.

---

## 2. Cenário e Desafio Técnico
* **Desafio:** O microcontrolador Arduino disponível não possui módulo de rede sem fio dedicado (como ESP8266, ESP32, Ethernet Shield ou Bluetooth).
* **Solução de Arquitetura:** Utilizar um computador/notebook conectado ao Arduino via cabo USB (porta Serial COM). O computador opera como um **Gateway/Servidor Local**, que se comunica via serial com o Arduino e disponibiliza uma interface web responsiva na rede local (Wi-Fi do laboratório ou Hotspot do notebook). Os celulares dos alunos conectam-se a esse servidor local via navegador web (por IP ou QR Code).

---

## 3. Arquitetura do Sistema e Níveis de Isolação

A cadeia de acionamento do projeto reflete fielmente as boas práticas industriais de isolação de circuitos:

```
[Smartphone do Aluno] 
       │ (Wi-Fi / HTTP & WebSockets)
       ▼
[Notebook Servidor (Gateway)] 
       │ (Cabo USB / Comunicação Serial COM)
       ▼
[Arduino (Controle - 5V TTL)]
       │ (Sinais lógicos digitais)
       ▼
[Módulo Relé com Optoacoplador] ─── (Isolação Galvânica)
       │ (Chaveamento em 24VDC)
       ▼
[Painel de Comando Elétrico (24VDC)]
       ├── Lamparinas / Sinaleiras de Status
       └── Bobinas dos Contatores (ex: K1, K2)
              │
              ▼ (Chaveamento de Potência)
       [Rede Trifásica 220VAC] ───► [Motor de Indução Trifásico]
```

### Detalhamento das Camadas:
1. **Nível de Aplicação / IHM Mobile:**
   - Interface Web (PWA / Mobile-first) aberta no navegador do celular.
   - Botões virtuais: Partida (Liga), Parada (Desliga), Parada de Emergência.
   - Indicadores visuais: status do motor (Ligado/Desligado), sinalização de falha, indicador de conexão com a bancada.

2. **Nível de Gateway / Servidor (Notebook do Instrutor):**
   - Servidor local construído em Node.js (versão instalada: v22).
   - Comunicação bidirecional em tempo real com os celulares via WebSockets/HTTP.
   - Comunicação serial com o Arduino via porta COM (utilizando biblioteca de porta serial, ex: `serialport`).
   - Painel do Instrutor no próprio notebook: visualização em tempo real das portas disponíveis, logs de eventos e comandos enviados pelos alunos.

3. **Nível de Microcontrolador (Arduino):**
   - Responsável pelo acionamento direto dos pinos de I/O digitais.
   - Protocolo de comunicação simples e resiliente via Serial (baud rate padrão, comandos estruturados como `CMD:START`, `CMD:STOP`, `CMD:EMERGENCY`, `GET_STATUS`).
   - Mecanismo de segurança (Watchdog / fail-safe em caso de perda de comunicação serial).

4. **Nível de Interface e Isolação (24VDC):**
   - Módulo de relés de estado sólido ou eletromecânico com isolação óptica (optoacoplador).
   - O Arduino aciona a bobina do relé em 5V; os contatos secos do relé chaveiam o circuito de 24V do painel elétrico.

5. **Nível de Potência (220VAC Trifásico):**
   - O circuito de 24V aciona a bobina do contator eletromagnético.
   - O contator fecha os contatos principais de potência alimentando o motor elétrico trifásico de 220V com segurança.

---

## 4. Requisitos e Diretrizes Pedagógicas
* **Interatividade Didática:** Permitir que o aluno visualize a causa e efeito imediato (acionar na tela do celular -> ouvir o clique do relé -> ver o sinalizador do painel acender -> ouvir o contator atracar -> partida do motor).
* **Segurança Operacional:**
  - Botão de Emergência físico prioritário sempre ativo na bancada.
  - Botão de Emergência virtual na IHM que tem prioridade máxima no software.
  - Estados padrão seguros (Normalmente Aberto / desenergizado em caso de desconexão).
* **Acessibilidade em Sala:** Acesso facilitado para os alunos via QR Code impresso ou projetado, apontando para o IP do notebook do professor na rede.

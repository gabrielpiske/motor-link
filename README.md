# Motor-Link ⚡📱

Plataforma educacional interativa de acionamento elétrico de potência e controle remoto para a **Unidade Curricular de Eletrônica de Potência (SENAI)**.

A plataforma integra uma aplicação web em nuvem desenvolvida em **Next.js + TypeScript + Firebase** (deploy na **Vercel**) com uma bancada física real acionada por um **Arduino Uno** e **Módulo Relé de 1 Canal** (COM, NO/NA, NC/NF), chaveando um comando industrial de 24V e força trifásica 220V para motores elétricos.

---

## 🎯 Objetivos Principais
1. **IHM Didática Mobile:** Painel de controle no celular do aluno para partida, parada e monitoramento em tempo real.
2. **Ambiente Pedagógico de Ensino:** Aulas interativas, diagramas elétricos animados com fluxo de corrente e fundamentos de Eletrônica de Potência (relés, contatores, isolação galvânica, normas de segurança).
3. **Ponte Nuvem ↔ Bancada:** Sincronização em tempo real via Firebase com conexão USB/COM no Arduino Uno (suporte a Web Serial API nativa no navegador).

---

## 📚 Documentos de Referência
* [CONTEXT.md](file:///c:/Users/gabri/Documents/Github/Git%20-%20SENAI/motor-link/CONTEXT.md): Visão geral do projeto, arquitetura detalhada, níveis de isolação e requisitos pedagógicos.
* [AGENT.md](file:///c:/Users/gabri/Documents/Github/Git%20-%20SENAI/motor-link/AGENT.md): Diretrizes de desenvolvimento, estrutura do projeto, segurança industrial e roteiro de fases.


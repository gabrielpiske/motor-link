# Firmware Motor-Link (Arduino Uno)

Código C++ para o **Arduino Uno** responsável pelo acionamento do módulo relé de 1 canal e interface com a bancada didática do SENAI.

---

## 🔌 Esquema de Ligação (Hardware)

### 1. Arduino Uno ➔ Módulo Relé (Lado de Controle)
| Módulo Relé (1 Canal) | Arduino Uno | Descrição |
| :--- | :--- | :--- |
| **VCC** | **5V** | Alimentação positiva da bobina do relé |
| **GND** | **GND** | Terra de referência |
| **IN** | **Pino Digital D7** | Sinal de acionamento do relé |

> **Nota sobre o LED onboard:** O pino D13 (LED embutido na placa) acende sempre que o motor estiver ligado, permitindo testar o código mesmo sem o módulo relé conectado.

---

### 2. Módulo Relé ➔ Painel de Comando (Lado de Potência 24V)
O lado de saída do relé possui 3 bornes que operam como uma chave com isolação galvânica:

* **COM (Comum):** Conectar ao **+24VDC** da fonte de alimentação de comando.
* **NO (Normally Open / NA):** Conectar à **bobina A1 do contator K1** (ou lâmpada sinaleira verde "Motor Ligado").
* **NC (Normally Closed / NF):** Opcional — pode ser conectado à sinaleira vermelha "Motor Desligado".

> O terminal **A2 do contator K1** deve ser conectado diretamente ao **0V (GND)** da fonte de 24V.

---

## ⚙️ Como Gravar e Testar no Arduino IDE

1. Abra a IDE do Arduino.
2. Abra o arquivo [`arduino_motor_link.ino`](file:///c:/Users/gabri/Documents/Github/Git%20-%20SENAI/motor-link/firmware/arduino_motor_link/arduino_motor_link.ino).
3. Selecione a placa: **Ferramentas > Placa > Arduino AVR Boards > Arduino Uno**.
4. Selecione a porta serial: **Ferramentas > Porta > COMx**.
5. Clique em **Carregar (Upload)** (Ctrl + U).

---

## 🧪 Testes no Monitor Serial (Serial Monitor)

1. Abra o **Monitor Serial** (Ctrl + Shift + M).
2. Configure a velocidade para **115200 baud**.
3. Configure o final de linha para **Ambos NL & CR** (New line & Carriage return).

### Comandos de Teste:
| Comando Enviado | Resposta Esperada | Ação no Hardware |
| :--- | :--- | :--- |
| `ON` ou `CMD:MOTOR:ON` | `STATUS:MOTOR=ON` | Relé atraca, LED 13 acende |
| `OFF` ou `CMD:MOTOR:OFF` | `STATUS:MOTOR=OFF` | Relé desatraca, LED 13 apaga |
| `EMERGENCY` | `ALERT:EMERGENCY_ACTIVATED` | Desliga o motor imediatamente e bloqueia novos acionamentos |
| `ON` (com emergência ativa) | `ERR:EMERGENCIA_BLOQUEADA` | Não liga o motor |
| `RESET` | `INFO:EMERGENCY_RESET` | Desbloqueia o sistema após a emergência |
| `STATUS` | `STATUS:MOTOR=OFF,EMERGENCY=CLEAR,UPTIME=...` | Retorna telemetria atual |
| `PING` | `PONG` | Teste de conectividade / keep-alive |

/*
 * Motor-Link — Firmware para Arduino Uno
 * Unidade Curricular: Eletrônica de Potência (SENAI)
 * 
 * Descrição:
 * Controle seguro de módulo relé de 1 canal para acionamento de comando 24V
 * e contator de motor trifásico 220V, com comunicação serial bidirecional
 * compatível com Web Serial API (Navegador) e Node.js.
 */

// ==========================================
// CONFIGURAÇÕES DE HARDWARE & PINAGEM
// ==========================================
const uint8_t PIN_RELE         = 7;   // Pino digital que aciona o módulo relé (IN)
const uint8_t PIN_LED_STATUS   = 13;  // LED embutido do Arduino (espelha status)
const uint32_t SERIAL_BAUD     = 115200; // Taxa de transmissão recomendada

// A maioria dos módulos relé didáticos/industriais é "Active LOW" (aciona com 0V/LOW)
// Se o seu módulo acionar com 5V/HIGH, altere para:
//   #define RELAY_ACTIVE   HIGH
//   #define RELAY_INACTIVE LOW
#define RELAY_ACTIVE   LOW
#define RELAY_INACTIVE HIGH

// ==========================================
// VARIÁVEIS DE ESTADO
// ==========================================
bool isMotorLigado = false;
bool isEmergenciaAtiva = false;

// Buffer de leitura serial
String inputString = "";
bool stringComplete = false;

// ==========================================
// FUNÇÕES DE CONTROLE DE HARDWARE
// ==========================================

void setMotor(bool ligar) {
  if (isEmergenciaAtiva && ligar) {
    Serial.println(F("ERR:EMERGENCIA_BLOQUEADA"));
    return;
  }

  isMotorLigado = ligar;
  
  if (isMotorLigado) {
    digitalWrite(PIN_RELE, RELAY_ACTIVE);
    digitalWrite(PIN_LED_STATUS, HIGH);
    Serial.println(F("STATUS:MOTOR=ON"));
  } else {
    digitalWrite(PIN_RELE, RELAY_INACTIVE);
    digitalWrite(PIN_LED_STATUS, LOW);
    Serial.println(F("STATUS:MOTOR=OFF"));
  }
}

void acionarEmergencia() {
  isEmergenciaAtiva = true;
  setMotor(false); // Desliga imediatamente
  Serial.println(F("ALERT:EMERGENCY_ACTIVATED"));
}

void resetarEmergencia() {
  isEmergenciaAtiva = false;
  Serial.println(F("INFO:EMERGENCY_RESET"));
}

void enviarStatus() {
  Serial.print(F("STATUS:MOTOR="));
  Serial.print(isMotorLigado ? F("ON") : F("OFF"));
  Serial.print(F(",EMERGENCY="));
  Serial.print(isEmergenciaAtiva ? F("ACTIVE") : F("CLEAR"));
  Serial.print(F(",UPTIME="));
  Serial.println(millis());
}

// ==========================================
// PROCESSAMENTO DO PROTOCOLO SERIAL
// ==========================================

void processarComando(String cmd) {
  cmd.trim();
  cmd.toUpperCase();

  if (cmd.length() == 0) return;

  if (cmd == F("CMD:MOTOR:ON") || cmd == F("ON") || cmd == F("LIGAR")) {
    setMotor(true);
  } 
  else if (cmd == F("CMD:MOTOR:OFF") || cmd == F("OFF") || cmd == F("DESLIGAR")) {
    setMotor(false);
  } 
  else if (cmd == F("CMD:EMERGENCY") || cmd == F("EMERGENCIA") || cmd == F("STOP")) {
    acionarEmergencia();
  } 
  else if (cmd == F("CMD:RESET_EMERGENCY") || cmd == F("RESET")) {
    resetarEmergencia();
  } 
  else if (cmd == F("CMD:STATUS") || cmd == F("STATUS")) {
    enviarStatus();
  } 
  else if (cmd == F("PING")) {
    Serial.println(F("PONG"));
  } 
  else {
    Serial.print(F("ERR:UNKNOWN_COMMAND:"));
    Serial.println(cmd);
  }
}

// ==========================================
// SETUP & LOOP PRINCIPAL
// ==========================================

void setup() {
  // Inicializa o pino do relé no estado DESLIGADO ANTES de definir como OUTPUT
  // para evitar pulsos espúrios na inicialização
  digitalWrite(PIN_RELE, RELAY_INACTIVE);
  pinMode(PIN_RELE, OUTPUT);

  pinMode(PIN_LED_STATUS, OUTPUT);
  digitalWrite(PIN_LED_STATUS, LOW);

  // Inicializa a comunicação serial
  Serial.begin(SERIAL_BAUD);
  inputString.reserve(64);

  // Mensagem inicial de inicialização pronta
  Serial.println();
  Serial.println(F("========================================"));
  Serial.println(F("MOTOR-LINK — SENAI ELETRONICA DE POTENCIA"));
  Serial.println(F("ARDUINO UNO + RELE 1 CANAL PRONTO"));
  Serial.println(F("========================================"));
  Serial.println(F("EVENT:SYSTEM_READY"));
  enviarStatus();
}

void loop() {
  // Leitura da porta serial
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n' || inChar == '\r') {
      if (inputString.length() > 0) {
        stringComplete = true;
      }
    } else {
      inputString += inChar;
    }
  }

  // Se uma linha completa foi recebida
  if (stringComplete) {
    processarComando(inputString);
    inputString = "";
    stringComplete = false;
  }
}

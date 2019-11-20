#include <Stepper.h>
#include <EEPROM.h>

//** Variáveis globais **

const int passosPorRevolucao = 2038;  // número de passos por revolução

const int velocidade_rotacao = 4;  // velocidade em RPM - Rotação
const int velocidade_altura = 4; // velocidade em RPM - Altura

// Pin 4 -> In1, Pin6 -> In3, Pin5 -> In2, Pin7 -> In4
Stepper stepper_rotacao(passosPorRevolucao, 4, 6, 5, 7); // Objeto Stepper - rotacionar lança
// Pin 8 -> In1, Pin10 -> In3, Pin9 -> In2, Pin11 -> In4
Stepper stepper_altura(passosPorRevolucao, 8, 10, 9, 11); // Objeto Stepper - alterar altura

const int pino_eletroima =  53; // Pino digital conectado ao eletroímã

int angulo_atual = 0;
int altura_atual = 100;

const int endereco_angulo = 0;
const int endereco_altura = 1;

//** Variáveis globais FIM **

int obterAcao(byte comando) {
  return comando & 0x03;
}

int obterValor(byte comando, byte valor) {
  int sinal = comando & 0x04;
  return (sinal ? -1 : 1) * (int)valor;
}

void enviarResposta(int acao, bool sucesso, int valor) {
  byte bytes_resposta[2];
  int primeiro_byte = 0;
  
  switch(acao) {
    case 0 : primeiro_byte += 0; // Para legibilidade
      break;
    case 1 : primeiro_byte += 1;
      break;
    case 2 : primeiro_byte += 2;
      break;
    case 3 : primeiro_byte += 3;
      break;
  }

  if (valor < 0) {
    primeiro_byte += 4;
    valor = valor * (-1);
  }

  if (!sucesso) {
    primeiro_byte += 8;
  }

  bytes_resposta[0] = (byte)primeiro_byte;
  bytes_resposta[1] = (byte)valor;

  Serial.write(bytes_resposta, 2);
}

void inicializarGuindaste() {
  // Obtém os valores de ângulo e altura salvos na memória
  angulo_atual = (int)EEPROM.read(endereco_angulo);
  enviarResposta(1, true, angulo_atual);
  altura_atual = (int)EEPROM.read(endereco_altura);
  enviarResposta(2, true, altura_atual);
}

void rotacionarLanca(Stepper motor_rotacao, int angulo) {

  int angulo_novo = angulo;

  // Valor mínimo
  if (angulo_novo < -180) {
    angulo_novo = -180;
  }

  // Valor máximo
  if (angulo_novo > 180) {
    angulo_novo = 180;
  }
  
  // Define sentido de rotação
  int sentido = 1; // Sentido horário
  if (angulo_novo < angulo_atual) {
    sentido = -1; // Sentido anti-horário
  }

  // Define diferença angular entre a posição atual e a nova
  int delta_angular = 0;
  if (sentido == 1) {
    delta_angular = angulo_novo - angulo_atual;
  }
  else {
    delta_angular = angulo_atual - angulo_novo;
  }

  // Define número de passos
  int num_passos = ((delta_angular / 360.0) * passosPorRevolucao) * sentido;

  motor_rotacao.step(num_passos);

  // Atualiza ângulo atual
  angulo_atual = angulo_novo; // Se tívessemos um sensor de posição usaríamos o valor retornado por ele

  // Salva na memória
  EEPROM.update(endereco_angulo, (byte)angulo_atual);
  
  // Verifica se o ângulo atual é igual ao desejado/recebido
  bool sucesso = true;
  if (angulo_atual != angulo) {
    sucesso = false;
  }

  enviarResposta(1, sucesso, angulo_atual);
}

void liberarRetrairCabo(Stepper motor_altura, int altura) {

  int altura_nova = altura;

  // Valor mínimo
  if (altura_nova < 0) {
    altura_nova = 0;
  }

  // Valor máximo
  if (altura_nova > 100) {
    altura_nova = 100;
  }

  // Define sentido de rotação do motor
  int sentido = 1; // Sentido horário
  if (altura_nova < altura_atual) {
    sentido = -1; // Sentido anti-horário
  }

  // Define diferença de altura entre a posição atual e a nova
  int delta_altura = 0;
  if (sentido == 1) {
    delta_altura = altura_nova - altura_atual;
  }
  else {
    delta_altura = altura_atual - altura_nova;
  }

  // Define número de passos
  int num_passos = ((delta_altura / 100.0) * passosPorRevolucao) * sentido; // TODO: Verificar quanto o motor deve girar para um delta de x de altura

  motor_altura.step(num_passos);

  // Atualiza altura atual
  altura_atual = altura_nova; // Se tívessemos um sensor de distância usaríamos o valor retornado por ele

  // Salva na memória
  EEPROM.update(endereco_altura, (byte)altura_atual);
  
  // Verifica se a altura atual é igual a desejada/recebida
  bool sucesso = true;
  if (altura_atual != altura) {
    sucesso = false;
  }
  
  enviarResposta(2, sucesso, altura_atual);
}

void acionarEletroima(int pino, int estado) {
  
  if (estado == 1) {
    digitalWrite(pino, HIGH);
  }
  else {
    digitalWrite(pino, LOW);
  }
  
  // Verifica estado
  bool sucesso = true;
  int estado_atual = digitalRead(pino);
  if (estado_atual != estado) {
    sucesso = false;
  }

  enviarResposta(3, sucesso, estado_atual);
}


void setup() {
  Serial.begin(9600);

  stepper_rotacao.setSpeed(velocidade_rotacao); // Define velocidade do motor de rotação
  stepper_altura.setSpeed(velocidade_altura); // Define velocidade do motor de altura
  
  pinMode(pino_eletroima, OUTPUT); // Define pino do eletroímã como saída
}


void loop() {
  if (Serial.available() >= 2) {  

    byte bytes_recebidos[2];
    Serial.readBytes(bytes_recebidos, 2);

    int acao = obterAcao(bytes_recebidos[0]);
    int valor = obterValor(bytes_recebidos[0], bytes_recebidos[1]);

    switch(acao) {
      case 0 : inicializarGuindaste();
        break;
      case 1 : rotacionarLanca(stepper_rotacao, valor);
        break;
      case 2 : liberarRetrairCabo(stepper_altura, valor);
        break;
      case 3 : acionarEletroima(pino_eletroima, valor);
        break;
    }
  }
  delay(100);
}

#include <Servo.h>

int obterAcao(byte comando) {
  return comando & 0x03;
}

int obterValor(byte comando, byte valor) {
  int sinal = comando & 0x04;
  return (sinal ? -1 : 1) * (int)valor;
}

void enviarResposta(int acao, bool sucesso, int valor) {
  byte bytes_resposta[2];
  int primeiro_byte = 128;
  
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
  
}

void rotacionarLanca(Servo motor_rotacao, int angulo) {
  int pos = motor_rotacao.read();

  // Converte ângulo recebido para posição do servo
  // ângulo: -180 a 180; posição: 0 a 180
  int pos_nova = (angulo + 180) / 2;

  // Valor mínimo
  if (pos_nova < 0) {
    pos_nova = 0;
  }

  // Valor máximo
  if (pos_nova > 180) {
    pos_nova = 180;
  }

  // Define tamanho do passo e intervalo entre eles - velocidade de rotação
  int passo = 1;
  int intervalo = 50;

  if (pos > pos_nova) {
    passo = passo * (-1);
  }

  int pos_atual = pos;

  while (pos_atual != pos_nova) {
    pos_atual += passo;
    motor_rotacao.write(pos_atual); 
    delay(intervalo);
  }

  pos = motor_rotacao.read();

  // Converte posição do servo para ângulo atual 
  int angulo_atual = pos;
  angulo_atual = angulo_atual * 2 -180;

  enviarResposta(1, true, angulo_atual);
}

void liberarRetrairCabo(Servo motor_altura, int altura) {
  int pos = motor_altura.read();

  // Converte altura recebida para posição do servo
  // altura: 0 a 100; posição: 0 a 180
  int pos_nova = altura * 180 / 100;

  // Valor mínimo
  if (pos_nova < 0) {
    pos_nova = 0;
  }

  // Valor máximo
  if (pos_nova > 180) {
    pos_nova = 180;
  }

  // Define tamanho do passo e intervalo entre eles - velocidade de rotação
  int passo = 1;
  int intervalo = 50;

  if (pos > pos_nova) {
    passo = passo * (-1);
  }

  int pos_atual = pos;

  while (pos_atual != pos_nova) {
    pos_atual += passo;
    motor_altura.write(pos_atual); 
    delay(intervalo);
  }

  pos = motor_altura.read();

  // Converte posição do servo para altura atual 
  int altura_atual = pos;
  altura_atual = altura_atual * 100 / 180;

  enviarResposta(2, true, altura_atual);
}

void acionarEletroima(int pino, int estado) {
  if (estado == 1) {
    digitalWrite(pino, HIGH);
  }
  else {
    digitalWrite(pino, LOW);
  }

  enviarResposta(3, true, digitalRead(pino));
}

Servo servo_rotacao, servo_altura;  // Objetos Servo - rotacionar e alterar altura
const int pino_eletroima =  53; // Pino digital conectado ao eletroímã

void setup() {
  Serial.begin(9600);
  
  servo_rotacao.attach(9);  // Servo conectado ao pino 9
  servo_rotacao.write(90);  // Define posição inicial do servo de rotação
  
  servo_altura.attach(8); // Servo conectado ao pino 8
  servo_altura.write(90); // Define posição inicial do servo de altura
  
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
      case 1 : rotacionarLanca(servo_rotacao, valor);
        break;
      case 2 : liberarRetrairCabo(servo_altura, valor);
        break;
      case 3 : acionarEletroima(pino_eletroima, valor);
        break;
    }
  }
  delay(100);
}

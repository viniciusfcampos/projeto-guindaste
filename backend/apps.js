const serialport = require('serialport');
const portName = process.argv[2];
const serialService = new serialport(portName, {
    baudRate: 9600,
    parser: new serialport.parsers.Readline('\r\n')
});

const app = require('express')();
const http = require('http');
const server = http.createServer(app);

server.listen(8000, () => console.log('server listens on port 8000'));
const io = require('socket.io')(http);
io.listen(server);

io.on('connection', socket => {
  console.log('Client connected!');
  socket.on('rotacao', data => enviarRespostaControlador(0x01, data));
  socket.on('altura', data => enviarRespostaControlador(0x02, data));
  socket.on('eletroima', data => enviarRespostaControlador(0x03, data));
});

const enviarRespostaControlador = (acao, valor) => {
  const valorAbsoluto = Math.abs(valor);
  const sinal = valor < 0 ? 0x04 : 0x00;
  const byteComando = sinal + acao;
  const mensagem = Buffer.from([byteComando, valorAbsoluto]);
  serialService.write(mensagem);
  console.log('[Enviado controlador]', byteComando, valorAbsoluto);
};

serialService.on('data', data => {
  console.log('[Recebido controlador]', data[0], data[1]);
  const codigo = data[1] & 0x03;
  const status = data[1] & 0x08;
  console.log(obterComando(codigo), status);
  io.emit(obterComando(codigo), status);
});

const obterComando = (codigo) => {
  switch(codigo) {
    case 0x00:
      return 'iniciar';
    case 0x01:
      return 'rotacao';
    case 0x02:
      return 'altura';
    case 0x03:
      return 'eletroima';
  }
}
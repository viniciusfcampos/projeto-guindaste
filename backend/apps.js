const serialport = require('serialport');
const portName = process.argv[2];
const serialService = new serialport(portName, {
    baudRate: 9600,
    parser: new serialport.parsers.Readline('\r\n')
});

const app = require('express')();
const http = require('http');
const server = http.createServer(app);
let buffer = [];

server.listen(8000, () => console.log('server listens on port 8000'));
const io = require('socket.io')(http);
io.listen(server);

serialService.on('data', data => {
  data.forEach(d => buffer.push(d));

  console.log('[Data controlador]', buffer);
  if (buffer.length !== 2)
    return;
  
  const codigo = buffer[0] & 0x03;
  const sinal = (buffer[0] & 0x04) === 0x04 ? -1 : 1;
  const valor = sinal * buffer[1];
  console.log('[Recebido controlador]', obterComando(codigo), valor);
  io.emit(obterComando(codigo), valor);
  buffer = [];
});

io.on('connection', socket => {
  console.log('Client connected!');
  socket.on('iniciar', () => enviarMensagemControlador(0x00));
  socket.on('rotacao', data => enviarMensagemControlador(0x01, data));
  socket.on('altura', data => enviarMensagemControlador(0x02, data));
  socket.on('eletroima', data => enviarMensagemControlador(0x03, data));
});

const enviarMensagemControlador = (acao, valor = 0) => {
  const valorAbsoluto = Math.abs(valor);
  const sinal = valor < 0 ? 0x04 : 0x00;
  const byteComando = sinal + acao;
  const mensagem = Buffer.from([byteComando, valorAbsoluto]);
  serialService.write(mensagem);
  console.log('[Enviado controlador]', byteComando, valorAbsoluto);
};

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
var express = require('express');
var bodyParser = require('body-parser');
var serialport = require('serialport');
var portName = process.argv[2];

var app = express();
app.use(bodyParser.json());

var serialService = new serialport(portName, {
    baudRate: 9600,
    parser: new serialport.parsers.Readline('\r\n')
});

var formatarResposta = (acao, valor) => {
  const valorAbsoluto = Math.abs(valor);
  const sinal = valor < 0 ? 0x04 : 0x00;
  const byteComando = sinal + acao;
  console.log('[Enviado]', byteComando, valorAbsoluto);
  return Buffer.from([byteComando, valorAbsoluto]);
};

app.post('/rotacao', (req, res)  => {
  const rotacao = formatarResposta(0x01, req.query.valor);
  serialService.write(rotacao);
  res.sendStatus(200);
});

app.post('/altura', (req, res)  => {
  const altura = formatarResposta(0x02, req.query.valor);
  serialService.write(altura);
  res.sendStatus(200);
});

app.post('/eletroima', (req, res)  => {
  const eletroima = formatarResposta(0x03, req.query.acionar == 'true' ? 1 : 0);
  serialService.write(eletroima);
  res.sendStatus(200);
});

app.listen(8000, ()  => {
  console.log('Servidor rodando na porta 8000.');
});

serialService.on('data', data => console.log('[Recebido]', data[0], data[1]));
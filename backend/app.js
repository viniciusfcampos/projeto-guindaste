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

var formatarResposta = (codigo, numero) => codigo + ("0000" + numero).slice(-4);

app.post('/rotacao', function (req, res) {
  const rotacao = formatarResposta('R', req.query.valor);
  serialService.write(rotacao);
  res.sendStatus(200);
});

app.post('/altura', function (req, res) {
  const altura = formatarResposta('A', req.query.valor);
  serialService.write(altura);
  res.sendStatus(200);
});

app.post('/eletroima', function (req, res) {
  const eletroima = formatarResposta('E', req.query.acionar);
  serialService.write(eletroima);
  res.sendStatus(200);
});

app.listen(8000, function () {
  console.log('Servidor rodando na porta 8000.');
});
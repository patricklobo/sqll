#!/usr/bin/env node
var ola = require('../lib/index'),
program = require('commander');

program
.description('Programa para receber e mostra nome')
.option('-n, --nome <nome>', 'Nome')
.parse(process.argv);

ola(program.nome);
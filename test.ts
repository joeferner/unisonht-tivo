const repl = require('repl');
const Tivo = require('.').default;
var tivo = new Tivo({address: '192.168.0.60'});

const r = repl.start('> ');
r.context.tivo = tivo;

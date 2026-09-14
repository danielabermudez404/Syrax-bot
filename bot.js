const net = require('net');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Syrax_ bot activo'));
app.listen(PORT, () => console.log(`Web puerto ${PORT}`));

const client = new net.Socket();
const HOST = 'irc.chatzona.org';
const PORT_IRC = 6667;
const NICK_INIT = 'Syrax_';
const NICK_FINAL = 'Universo_Latino';

client.connect(PORT_IRC, HOST, () => {
    console.log('Conectado a TCP 6667');
    client.write(`NICK ${NICK_INIT}\r\n`);
    client.write(`USER ${NICK_INIT} 8 * :Syrax Bot\r\n`);
});

client.on('data', (data) => {
    const text = data.toString();
    text.split('\r\n').forEach((line) => {
        if (!line) return;
        console.log('<<', line);
        if (line.startsWith('PING')) {
            client.write(`PONG ${line.split(' ')[1]}\r\n`);
        }
        if (line.includes(' 001 ')) {
            console.log('Registrado. Cambiando nick y entrando...');
            setTimeout(() => client.write(`NICK ${NICK_FINAL}\r\n`), 1500);
            setTimeout(() => client.write(`PRIVMSG NickServ :IDENTIFY universo\r\n`), 3500);
            setTimeout(() => client.write(`JOIN #universo_latino\r\n`), 5500);
        }
    });
});

client.on('error', (err) => console.error('Error TCP:', err));
client.on('close', () => console.log('Socket cerrado'));
     

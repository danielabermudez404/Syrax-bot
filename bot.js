const net = require('net');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('universo_latino bot activo'));
app.listen(PORT, () => console.log(`Web puerto ${PORT}`));

const client = new net.Socket();
const HOST = 'irc.chatzona.org';
const PORT_IRC = 6667;
const BOT_NICK = 'universo_latino';
const BOT_PASS = 'universo';
const CHANNEL = '#universo_latino';

client.connect(PORT_IRC, HOST, () => {
    console.log('Conectado a irc.chatzona.org:6667');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 8 * :Bot Universo Latino\r\n`);
});

let identified = false;

client.on('data', (data) => {
    const text = data.toString();
    text.split('\r\n').forEach((line) => {
        if (!line) return;
        console.log('<<', line);
        
        if (line.startsWith('PING')) {
            client.write(`PONG ${line.split(' ')[1]}\r\n`);
        }
        
        // Al recibir 001 (bienvenida) o aviso de nick protegido
        if ((line.includes(' 001 ') || line.includes('registrado y protegido')) && !identified) {
            identified = true;
            setTimeout(() => {
                console.log('Enviando IDENTIFY a NickServ...');
                client.write(`PRIVMSG NickServ :IDENTIFY ${BOT_PASS}\r\n`);
            }, 600);

            setTimeout(() => {
                console.log(`Uniéndome a ${CHANNEL}...`);
                client.write(`JOIN ${CHANNEL}\r\n`);
            }, 2000);
        }
    });
});

client.on('error', (err) => console.error('Error TCP:', err));
client.on('close', () => {
    console.log('Socket cerrado, reconectando en 5s...');
    identified = false;
    setTimeout(() => client.connect(PORT_IRC, HOST), 5000);
});
         

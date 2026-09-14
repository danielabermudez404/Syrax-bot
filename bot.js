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
    console.log('Conectado a TCP 6667');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 8 * :Bot Universo Latino\r\n`);
});

client.on('data', (data) => {
    const text = data.toString();
    text.split('\r\n').forEach((line) => {
        if (!line) return;
        console.log('<<', line);
        
        if (line.startsWith('PING')) {
            client.write(`PONG ${line.split(' ')[1]}\r\n`);
        }
        
        // Detecta aviso de NickServ o registro al entrar
        if (line.includes(' 001 ') || line.includes('identificado') || line.includes('REGISTRA') || line.includes('IDENTIFY')) {
            setTimeout(() => {
                console.log('Enviando IDENTIFY a NickServ...');
                client.write(`PRIVMSG NickServ :IDENTIFY ${BOT_PASS}\r\n`);
            }, 1000);

            setTimeout(() => {
                console.log(`Uniéndome a ${CHANNEL}...`);
                client.write(`JOIN ${CHANNEL}\r\n`);
            }, 3000);
        }
    });
});

client.on('error', (err) => console.error('Error TCP:', err));
client.on('close', () => console.log('Socket cerrado'));

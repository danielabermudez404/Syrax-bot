const { Client } = require('irc-framework');
const express = require('express');

// 1. Servidor Web Express (Obligatorio para que Render mantenga el Web Service gratis)
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Syrax_ IRC Bot is active and running 24/7!');
});

app.listen(port, () => {
    console.log(`Servidor web escuchando en el puerto ${port}`);
});

// 2. Conexión a la Red de IRC
const client = new Client();

client.connect({
    host: 'irc.chatzona.org',
    port: 6667,
    nick: 'Syrax_',
    username: 'Syrax',
    gecos: 'Bot oficial de #universo_latino'
});

// Variables de estado para los juegos
let bombaActiva = false;
let bombaChan = '';
let bombaPortador = '';
let bombaTimer = null;

let copasServidas = false;
let copasRestantes = 0;

let dueloActivo = false;
let dueloRetador = '';
let dueloRetado = '';
let dueloEnCurso = false;
let dueloChan = '';
let dueloTimer = null;

client.on('registered', () => {
    console.log('¡Syrax_ conectado con éxito a ChatZona!');
    client.join('#universo_latino');
    
    // Anuncio periódico cada 30 minutos (1800000 ms)
    setInterval(() => {
        client.say('#universo_latino', '¡Hola a todos/as soy Syrax_ el bot de #universo_latino 🧩 si tienes dudas del canal consulta con la admin Caraxs 🐉 ¡Gracias! 🎶');
    }, 1800000);
});

// Eventos de entrada al canal (Join)
client.on('join', (event) => {
    if (event.channel !== '#universo_latino') return;

    if (event.nick === client.user.nick) {
        client.say(event.channel, 'Hola a todos/as soy Syrax_ el bot de #universo_latino 🧩 si tienes dudas del canal consulta con la admin Caraxs 🐉 ¡Gracias! 🎶');
    } else {
        if (event.nick.toLowerCase().includes('carax')) {
            client.say(event.channel, `¡Bienvenida ${event.nick} !🐉 admin de #universo_latino 🧩`);
        } else {
            // Dar voz (+v) si el bot tiene permisos
            client.raw(`MODE ${event.channel} +v ${event.nick}`);
            client.say(event.channel, `¡Bienvenido ${event.nick} ! a #universo_latino 🧩✨`);
        }
    }
});

// Manejo de comandos y texto en el canal
client.on('message', (event) => {
    if (event.channel !== '#universo_latino') return;
    const text = event.message.trim();
    const args = text.split(' ');
    const command = args[0].toLowerCase();
    const nick = event.nick;

    // Saludos y estado
    if (text.toLowerCase().includes('como estas syrax') || text.toLowerCase().includes('como esta syrax')) {
        client.say(event.target, 'Super bien 🐉✨');
    } else if (command === 'hola' && args[1] && args[1].toLowerCase() === 'syrax') {
        client.say(event.target, `Hola ${nick}`);
    }

    // Ayuda
    if (command === '!ayuda' || command === '!help') {
        client.say(event.target, '📜 Juegos y Comandos - Syrax_ 💣');
        client.say(event.target, '🔹 !bomba / !pasar [nick] - Juego de la bomba.');
        client.say(event.target, '🔹 !ruleta - Ruleta rusa.');
        client.say(event.target, '🔹 !copa / !beber - Juego del veneno.');
        client.say(event.target, '🔹 !duelo [nick] / !aceptar / !disparar - Duelo en la arena.');
        client.say(event.target, '🔹 !cofre - Abre el cofre del tesoro.');
    }

    // --- JUEGO DE LA BOMBA ---
    if (command === '!bomba') {
        if (bombaActiva) {
            client.say(event.target, 'Ya hay una bomba activa. ¡Pásala con !pasar <nick>!');
            return;
        }
        bombaActiva = true;
        bombaChan = event.target;
        bombaPortador = nick;
        const tiempoMs = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;

        client.say(event.target, `💣 ¡ ${nick} ha activado una bomba! Explotará en cualquier momento...`);
        client.say(event.target, `💣 La bomba la tiene ${nick}. Usa !pasar <nick> para dársela a otro.`);

        bombaTimer = setTimeout(() => {
            if (bombaActiva) {
                client.say(bombaChan, `💥 ¡BOOOOOOM! 💥 ¡GAME OVER! 💀 ${bombaPortador}`);
                bombaActiva = false;
            }
        }, tiempoMs);
    }

    if (command === '!pasar') {
        if (!bombaActiva || nick !== bombaPortador) return;
        const nuevoPortador = args[1];
        if (!nuevoPortador) return;
        if (nuevoPortador === client.user.nick) {
            client.say(event.target, '¡No me la puedes pasar a mí! Pasásela a otro.');
            return;
        }
        bombaPortador = nuevoPortador;
        client.say(event.target, `💣 ¡ ${nick} le pasó la bomba a ${nuevoPortador} ! 🔥`);
    }

    // --- RULETA RUSA ---
    if (command === '!ruleta') {
        const disparo = Math.floor(Math.random() * 6) + 1;
        client.say(event.target, `🔫 ${nick} coloca el revólver en su cabeza, gira el tambor y jala del gatillo...`);
        setTimeout(() => {
            if (disparo === 1) {
                client.say(event.target, `💥 ¡BANG! 💥 ¡GAME OVER! 💀 ${nick}`);
            } else {
                client.say(event.target, `📄 * * C L I C K * * 📄 ¡Tuviste suerte, ${nick}! El tambor estaba vacío. 🍀`);
            }
        }, 2000);
    }

    // --- JUEGO DE LAS COPAS ---
    if (command === '!copa') {
        if (copasServidas) {
            client.say(event.target, '🍷 Ya hay copas servidas en la mesa. Usa !beber para tomar una.');
            return;
        }
        copasServidas = true;
        copasRestantes = 4;
        client.say(event.target, '🍷 Syrax_ ha servido 4 copas en la mesa. ¡Solo 1 contiene veneno mortal! ☠️ Usa !beber para probar tu suerte.');
    }

    if (command === '!beber') {
        if (!copasServidas) {
            client.say(event.target, '⚠️ No hay copas servidas. Usa !copa para servir una ronda en la mesa.');
            return;
        }
        client.say(event.target, `🍷 ${nick} toma una copa de la mesa y se la bebe de un trago...`);
        const suerte = Math.floor(Math.random() * copasRestantes) + 1;

        setTimeout(() => {
            if (suerte === 1) {
                client.say(event.target, `☠️ ¡Era veneno mortal! 🤢 ¡GAME OVER! 💀 ${nick}`);
                copasServidas = false;
                copasRestantes = 0;
            } else {
                copasRestantes--;
                if (copasRestantes > 1) {
                    client.say(event.target, `🍷 Era buen vino. Te salvaste, ${nick}. Quedan ${copasRestantes} copas en la mesa... 🐍`);
                } else {
                    client.say(event.target, `🍷 Era buen vino. Te salvaste, ${nick}. ¡La última copa que quedaba era el veneno y la mesa ha sido limpiada! 🧹`);
                    copasServidas = false;
                    copasRestantes = 0;
                }
            }
        }, 2000);
    }

    // --- DUELO ---
    if (command === '!duelo') {
        if (!args[1]) {
            client.say(event.target, '⚠️ Debes especificar a quién desafiar. Ejemplo: !duelo NickDelRival');
            return;
        }
        if (dueloActivo) {
            client.say(event.target, '⚠️ Ya hay un duelo en curso en la arena. ¡Esperen a que termine!');
            return;
        }
        const rival = args[1];
        if (rival.toLowerCase() === nick.toLowerCase()) {
            client.say(event.target, `⚠️ ${nick}, no puedes batallarte a ti mismo... ¡busca a un rival en la sala!`);
            return;
        }

        dueloActivo = true;
        dueloRetador = nick;
        dueloRetado = rival;
        dueloChan = event.target;

        client.say(event.target, `⚔️  ${nick}  ha desafiado a  ${rival}  a un duelo en la arena.`);
        client.say(event.target, `⏳  ${rival} , tienes 15 segundos para escribir !aceptar o quedarás como un cobarde... 🐔`);

        dueloTimer = setTimeout(() => {
            if (dueloActivo && !dueloEnCurso) {
                client.say(dueloChan, `🐔  ${dueloRetado}  no respondió a tiempo y huyó del duelo... ¡Cobarde!`);
                dueloActivo = false;
                dueloRetador = '';
                dueloRetado = '';
            }
        }, 15000);
    }

    if (command === '!aceptar') {
        if (!dueloActivo || nick.toLowerCase() !== dueloRetado.toLowerCase()) return;
        clearTimeout(dueloTimer);
        dueloEnCurso = true;

        client.say(event.target, `⚔️ ¡  ${dueloRetado}  HA ACEPTADO EL DUELO! Ambos están en la arena frente a frente...`);
        client.say(event.target, '🚨 ¡EL PRIMERO EN ESCRIBIR !disparar GANA EL DUELO! 🔫');
    }

    if (command === '!disparar') {
        if (!dueloEnCurso) return;
        if (nick.toLowerCase() !== dueloRetador.toLowerCase() && nick.toLowerCase() !== dueloRetado.toLowerCase()) return;

        const ganador = nick;
        const perdedor = (ganador.toLowerCase() === dueloRetador.toLowerCase()) ? dueloRetado : dueloRetador;

        client.say(event.target, `💥  ${ganador}  fue más rápido con el gatillo y le atravesó el pecho a  ${perdedor} ... 🎯`);
        client.say(event.target, `💥 ¡GAME OVER! 💀  ${perdedor}  (Gana  ${ganador} 🏆)`);

        dueloActivo = false;
        dueloRetador = '';
        dueloRetado = '';
        dueloEnCurso = false;
    }

    // --- COFRE ---
    if (command === '!cofre') {
        client.say(event.target, `🧰  ${nick}  se acerca lentamente al cofre e intenta abrir la cerradura...`);
        const azar = Math.floor(Math.random() * 100) + 1;

        setTimeout(() => {
            if (azar <= 30) {
                client.say(event.target, `🧟‍♂️ ¡EL COFRE ERA UN MIMETO TRAMPOSO! Te devoró de un bocado... 💥 ¡GAME OVER! 💀  ${nick} `);
            } else {
                const oro = Math.floor(Math.random() * (1000 - 50 + 1)) + 50;
                client.say(event.target, `🪙 ¡ C L I C K ! El cofre se abrió y  ${nick}  encontró  ${oro}  monedas de oro. 🏆`);
            }
        }, 2000);
    }

    // --- OPERADOR (OP / DEOP) ---
    if (command === '!op' && nick === 'Caraxs') {
        client.raw(`MODE #universo_latino +o ${nick}`);
    }
    if (command === '!deop' && nick === 'Caraxs') {
        client.raw(`MODE #universo_latino -o ${nick}`);
    }
});

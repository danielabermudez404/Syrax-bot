const irc = require('irc');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Servidor Express para mantener vivo el bot en Render con UptimeRobot
app.get('/', (req, res) => {
    res.send('Syrax_ bot está activo y funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor web corriendo en el puerto ${PORT}`);
});

// Configuración de la conexión de Syrax_ a la red de IRC
const client = new irc.Client('irc.chatzona.org', 'Syrax_', {
    channels: ['#universo_latino'],
    userName: 'Syrax',
    realName: 'Syrax Bot de Juegos',
    port: 6667,
    secure: false,
});

// Variables de estado para los juegos
let bombaActiva = false;
let bombaChan = '';
let bombaPortador = '';
let bombaTimer = null;

let copasServidas = false;
let copasRestantes = 4;

let dueloActivo = false;
let dueloRetador = '';
let dueloRetado = '';
let dueloCanal = '';
let dueloEnCurso = false;
let dueloTimer = null;
let anuncioTimer = null;

// Evento cuando se conecta al servidor
client.addListener('registered', function(message) {
    console.log('Syrax_ se ha conectado exitosamente al servidor de IRC.');
    setTimeout(() => {
        client.join('#universo_latino');
    }, 3000);
});

// Evento cuando Syrax_ entra a un canal
client.addListener('join#universo_latino', function(nick, message) {
    if (nick === client.nick) {
        client.say('#universo_latino', 'Hola a todos/as soy Syrax_ el bot de #universo_latino 🧩 si tienes dudas del canal consulta con la admin Caraxs 🐉 ¡Gracias! 🎶');
        
        // Anuncio periódico cada 15 min (900,000 ms)
        if (anuncioTimer) clearInterval(anuncioTimer);
        anuncioTimer = setInterval(() => {
            client.say('#universo_latino', '¡ATENCIÓN! 🤖 #universo_latino Andamos buscando @ responsables , si hay alguien interesado, comuniquese con la admin Caraxs 🐉 !Gracias¡');
        }, 900000);
    } else {
        // Bienvenida a otros usuarios
        if (nick.toLowerCase().includes('carax')) {
            client.say('#universo_latino', `¡ Bienvenida ${nick} !🐉 admin de #universo_latino 🧩`);
        } else {
            client.send('MODE', '#universo_latino', '+v', nick);
            client.say('#universo_latino', `¡Bienvenido ${nick} ! a #universo_latino 🧩✨`);
        }
    }
});

// Evento cuando alguien sale del canal o se desconecta
client.addListener('part', function(channel, nick, reason, message) {
    if (nick === client.nick && channel === '#universo_latino') {
        if (anuncioTimer) clearInterval(anuncioTimer);
    }
});

// Manejador principal de mensajes de texto en el canal
client.addListener('message#universo_latino', function (from, message) {
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();
    const nick = from;

    // Saludos y conversación básica
    const lowerMsg = message.toLowerCase();
    if ((lowerMsg.includes('como') && lowerMsg.includes('esta') && lowerMsg.includes('syrax')) || 
        (lowerMsg.includes('como') && lowerMsg.includes('estas') && lowerMsg.includes('syrax'))) {
        client.say('#universo_latino', 'Super bien 🐉✨');
    } else if (lowerMsg.startsWith('hola syrax')) {
        client.say('#universo_latino', `Hola ${nick}`);
    }

    // --- COMANDOS DE OPERADOR ---
    if (command === '!op' && nick === 'Caraxs') {
        client.send('MODE', '#universo_latino', '+o', nick);
    }
    if (command === '!deop' && nick === 'Caraxs') {
        client.send('MODE', '#universo_latino', '-o', nick);
    }

    // --- JUEGO: BOMBA ---
    if (command === '!bomba') {
        if (bombaActiva) {
            client.say('#universo_latino', 'Ya hay una bomba activa. ¡Pásala con !pasar <nick>!');
            return;
        }
        bombaActiva = true;
        bombaChan = '#universo_latino';
        bombaPortador = nick;

        const tiempoSec = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
        client.say('#universo_latino', `💣 ¡ ${nick} ha activado una bomba! Explotará en cualquier momento...`);
        client.say('#universo_latino', `💣 La bomba la tiene ${nick}. Usa !pasar <nick> para dársela a otro.`);

        if (bombaTimer) clearTimeout(bombaTimer);
        bombaTimer = setTimeout(() => {
            if (bombaActiva) {
                client.say(bombaChan, `💥 ¡BOOOOOOM! 💥 ¡GAME OVER! 💀 ${bombaPortador}`);
                bombaActiva = false;
                bombaPortador = '';
            }
        }, tiempoSec * 1000);
    }

    if (command === '!pasar') {
        if (!bombaActiva) return;
        if (nick !== bombaPortador) {
            client.say('#universo_latino', `${nick}, ¡tú no tienes la bomba!`);
            return;
        }
        const nuevoPortador = args[1];
        if (!nuevoPortador) return;
        if (nuevoPortador === client.nick) {
            client.say('#universo_latino', '¡No me la puedes pasar a mí! Pasásela a otro.');
            return;
        }
        bombaPortador = nuevoPortador;
        client.say('#universo_latino', `💣 ¡ ${nick} le pasó la bomba a ${nuevoPortador}! 🔥`);
    }

    // --- AYUDA ---
    if (command === '!ayuda' || command === '!help') {
        client.say('#universo_latino', '📜 Juego de la Bomba - Syrax_ 💣');
        client.say('#universo_latino', '🔹 !bomba - Activa la bomba en el canal.');
        client.say('#universo_latino', '🔹 !pasar [nick] - Le pasa la bomba a otro usuario.');
    }

    // --- RULETA RUSA ---
    if (command === '!ruleta') {
        const disparo = Math.floor(Math.random() * 6) + 1;
        client.say('#universo_latino', `🔫 ${nick} coloca el revólver en su cabeza, gira el tambor y jala del gatillo...`);
        setTimeout(() => {
            if (disparo === 1) {
                client.say('#universo_latino', `💥 ¡BANG! 💥 ¡GAME OVER! 💀 ${nick}`);
            } else {
                client.say('#universo_latino', `📄 * * C L I C K * * 📄 ¡Tuviste suerte, ${nick}! El tambor estaba vacío. 🍀`);
            }
        }, 2000);
    }

    // --- JUEGO: COPAS ---
    if (command === '!copa') {
        if (copasServidas) {
            client.say('#universo_latino', '🍷 Ya hay copas servidas en la mesa. Usa !beber para tomar una.');
            return;
        }
        copasServidas = true;
        copasRestantes = 4;
        client.say('#universo_latino', '🍷 Syrax_ ha servido 4 copas en la mesa. ¡Solo 1 contiene veneno mortal! ☠️ Usa !beber para probar tu suerte.');
    }

    if (command === '!beber') {
        if (!copasServidas) {
            client.say('#universo_latino', '⚠️ No hay copas servidas. Usa !copa para servir una ronda en la mesa.');
            return;
        }
        client.say('#universo_latino', `🍷 ${nick} toma una copa de la mesa y se la bebe de un trago...`);
        const suerte = Math.floor(Math.random() * copasRestantes) + 1;

        setTimeout(() => {
            if (suerte === 1) {
                client.say('#universo_latino', `☠️ ¡Era veneno mortal! 🤢 ¡GAME OVER! 💀 ${nick}`);
                copasServidas = false;
                copasRestantes = 4;
            } else {
                copasRestantes--;
                if (copasRestantes > 1) {
                    client.say('#universo_latino', `🍷 Era buen vino. Te salvaste, ${nick}. Quedan ${copasRestantes} copas en la mesa... 🐍`);
                } else {
                    client.say('#universo_latino', `🍷 Era buen vino. Te salvaste, ${nick}. ¡La última copa que quedaba era el veneno y la mesa ha sido limpiada! 🧹`);
                    copasServidas = false;
                    copasRestantes = 4;
                }
            }
        }, 2000);
    }

    // --- DUELO ---
    if (command === '!duelo') {
        if (!args[1]) {
            client.say('#universo_latino', '⚠️ Debes especificar a quién desafiar. Ejemplo: !duelo NickDelRival');
            return;
        }
        if (dueloActivo) {
            client.say('#universo_latino', '⚠️ Ya hay un duelo en curso en la arena. ¡Esperen a que termine!');
            return;
        }
        const rival = args[1];
        if (rival.toLowerCase() === nick.toLowerCase()) {
            client.say('#universo_latino', `⚠️ ${nick}, no puedes batallarte a ti mismo... ¡busca a un rival en la sala!`);
            return;
        }

        dueloActivo = true;
        dueloRetador = nick;
        dueloRetado = rival;
        dueloCanal = '#universo_latino';

        client.say('#universo_latino', `⚔️ ${nick} ha desafiado a ${rival} a un duelo en la arena.`);
        client.say('#universo_latino', `⏳ ${rival}, tienes 15 segundos para escribir !aceptar o quedarás como un cobarde... 🐔`);

        if (dueloTimer) clearTimeout(dueloTimer);
        dueloTimer = setTimeout(() => {
            if (dueloActivo && !dueloEnCurso) {
                client.say(dueloCanal, `🐔 ${dueloRetado} no respondió a tiempo y huyó del duelo... ¡Cobarde!`);
                dueloActivo = false;
                dueloRetador = '';
                dueloRetado = '';
                dueloCanal = '';
            }
        }, 15000);
    }

    if (command === '!aceptar') {
        if (!dueloActivo || dueloEnCurso) return;
        if (nick.toLowerCase() !== dueloRetado.toLowerCase()) return;

        if (dueloTimer) clearTimeout(dueloTimer);
        dueloEnCurso = true;

        client.say('#universo_latino', `⚔️ ¡ ${dueloRetado} HA ACEPTADO EL DUELO! Ambos están en la arena frente a frente...`);
        client.say('#universo_latino', '🚨 ¡EL PRIMERO EN ESCRIBIR !disparar GANA EL DUELO! 🔫');
    }

    if (command === '!disparar') {
        if (!dueloEnCurso) return;
        if (nick.toLowerCase() !== dueloRetador.toLowerCase() && nick.toLowerCase() !== dueloRetado.toLowerCase()) return;

        const ganador = nick;
        const perdedor = (ganador.toLowerCase() === dueloRetador.toLowerCase()) ? dueloRetado : dueloRetador;

        client.say('#universo_latino', `💥 ${ganador} fue más rápido con el gatillo y le atravesó el pecho a ${perdedor}... 🎯`);
        client.say('#universo_latino', `💥 ¡GAME OVER! 💀 ${perdedor} (Gana ${ganador} 🏆)`);

        dueloActivo = false;
        dueloRetador = '';
        dueloRetado = '';
        dueloEnCurso = false;
        dueloCanal = '';
    }

    // --- COFRE ---
    if (command === '!cofre') {
        client.say('#universo_latino', `🧰 ${nick} se acerca lentamente al cofre e intenta abrir la cerradura...`);
        const azar = Math.floor(Math.random() * 100) + 1;
        setTimeout(() => {
            if (azar <= 30) {
                client.say('#universo_latino', `🧟‍♂️ ¡EL COFRE ERA UN MIMETO TRAMPOSO! Te devoró de un bocado... 💥 ¡GAME OVER! 💀 ${nick}`);
            } else {
                const oro = Math.floor(Math.random() * (1000 - 50 + 1)) + 50;
                client.say('#universo_latino', `🪙 ¡ C L I C K ! El cofre se abrió y ${nick} encontró ${oro} monedas de oro. 🏆`);
            }
        }, 2000);
    }
});

// Manejo de errores para evitar que la aplicación colapse
client.addListener('error', function(message) {
    console.log('Error de IRC: ', message);
});
    
    


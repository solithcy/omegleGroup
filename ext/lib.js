const fetch = require('node-fetch');
const color = require('colors');
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
var messagetimeout = setTimeout(function(){}, 1);
var totaltimout = 120*1000;
const uwuifier = require('uwuify');
const uwuify = new uwuifier();
function sleep(ms){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
async function handleEvent(event){
    switch(event.event[0]){
        case "gotMessage":
            clearTimeout(messagetimeout);
            messagetimeout = setTimeout(function(){
                handleTimeout(event.id, event.server, event.clientid, event.socket);
            }, totaltimout);
            if(event.event[1].includes("Welcome to an experimental Omegle bot called OmegleGroup.")){
                await disconnect(event.id, event.server, event.clientid, event.socket);
                break;
            }
            if(event.event[1].toLowerCase().includes("f19") || event.event[1].toLowerCase().includes("kik") || event.event[1].includes("Ꭵ") || event.event[1].includes("😊") || event.event[1].includes("🙂") || event.event[1].toLowerCase().includes("hi, i'm omeglebot!")){
                console.log("Confirmed the user is a bot".red.bold);
                await sendMessage(event.id, event.server, event.clientid, "You've been kicked from OmegleGroup for potentially being a bot.");
                await disconnect(event.id, event.server, event.clientid, event.socket);
                break;
            }
            var tosend = event.event[1];
            event.socket.emit("message", tosend);
            break;
        case "typing":
            console.log(`User started typing`.magenta);
            break;
        case "stoppedTyping":
            console.log(`User stopped typing`.magenta);
            break;
        case "connected":
            clearTimeout(messagetimeout);
            messagetimeout = setTimeout(function(){
                handleTimeout(event.id, event.server, event.clientid, event.socket);
            }, totaltimout);
            console.log("User connected".green);
            await handleJoin(event.id, event.server, event.clientid, event.socket);
            break;
        case "waiting":
            console.log("Waiting for user..".yellow);
            break;
        default:
            break;
    }
}

async function handleTimeout(id, server, clientid, socket){
    console.log(`Idle timeout hit`.red.bold);
    await sendMessage(id, server, clientid, "You didn't send a message for 120 seconds so you've been kicked.");
    await disconnect(id, server, clientid, socket);
}

function sendMessage(id, server, clientid, message){
    return fetch(`${server}/send`, {
        "headers": {
            "accept": "text/javascript, text/html, application/xml, text/xml, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `msg=${encodeURIComponent(message)}&id=${encodeURIComponent(clientid)}`,
        "method": "POST",
        "mode": "cors"
    });
}

async function getStatus(){
    var status = await fetch("https://omegle.com/status");
    status = await status.json();
    return status;
}

async function eventLoop(id, server, socket){
    var status = await getStatus();
    console.log(`${status.count.toLocaleString()} people on Omegle`.magenta);
    while(true){
        console.log(`Joining room..`.yellow);
        await joinRoom(id, server, socket);
        var wait = Math.floor(10000*Math.random());
        console.log(`Sleeping for ${wait/1000}s..`.yellow);
        await sleep(wait);
    }
}

function disconnect(id, server, clientID, socket){
    socket.emit('chat_disconnect');
    return fetch(`${server}/disconnect`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `id=${encodeURIComponent(clientID)}`,
        "method": "POST",
        "mode": "cors"
    });
}

async function handleJoin(id, server, clientid, socket){
    socket.off("join");
    socket.on("join", async function(data){
        await sendMessage(id, server, clientid, `[SERVER] Stranger#${data.stranger} joined!`)
    });
    socket.off("chat_disconnect");
    socket.on("chat_disconnect", async function(data){
        await sendMessage(id, server, clientid, `[SERVER] Stranger#${data.stranger} left.`)
    });
    socket.off("message");
    socket.on("message", async function(data){
        await sendMessage(id, server, clientid, `Stranger#${data.stranger}: ${data.message}`)
    });
    socket.emit("join", async function(stats){
        console.log(stats);
        socket.stranger = stats.stranger;
        await sendMessage(id, server, clientid, `[SERVER] Hello! Welcome to an experimental Omegle bot called OmegleGroup. There are currently ${stats.connected-1} other people connected to OmegleGroup.

OmegleGroup is just like a group chat in Omegle!
If you don't send a message for 120 seconds you'll be disconnected.
Your username is Stranger#${socket.stranger}. Say hi to everyone!`);
        console.log(`Sent welcome message`.green);
    });
}
//sdgsawe
async function joinRoom(id, server, socket){
    clearTimeout(messagetimeout);
    var data = await fetch(`${server}/start?caps=recaptcha2,t&firstevents=1&spid=&randid=${id}&lang=en&topics=%5B%22music%22%5D`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "",
        "method": "POST",
        "mode": "cors"
    });
    data = await data.json();
    console.log(`Connected to room as ${data.clientID}`.green);
    for(const event of data.events){
        handleEvent({
            event: event,
            server: server,
            clientid: data.clientID,
            id: id,
            socket
        });
    }
    while(true){
        try{
            var events = await fetch(`${server}/events`, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                "referrer": "https://www.omegle.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `id=${encodeURIComponent(data.clientID)}`,
                "method": "POST",
                "mode": "cors"
            });
        }catch(e){
            console.log(`Bot disconnected`.red.bold);
            return;
        }

        events = await events.json();

        if(!events){
            console.log(`Bot disconnected`.red.bold);
            return;
        }

        for(const event of events){
            if(event[0]!="strangerDisconnected"){
                handleEvent({
                    event: event,
                    server: server,
                    clientid: data.clientID,
                    id: id,
                    socket
                });
            }else{
                console.log(`Stranger disconnected`.red.bold);
                socket.emit('chat_disconnect');
                clearTimeout(messagetimeout);
                return;
            }
        }

    }
}

module.exports = {
    eventLoop,
    handleEvent,
    joinRoom,
    getStatus
}
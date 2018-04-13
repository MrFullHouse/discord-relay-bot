"use strict";
const Discord = require("discord.js");
const client = new Discord.Client();
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const contest = require('./contest.js');
const chatFunctions = require('./chat-functions.js');
const ban = require('./ban-system.js');

http.createServer(function (req, res) {}).listen(process.env.PORT || 6000);
var db = new sqlite3.Database('database.db3');

// Loading blacklist
var blacklist = ban.loadBanList(db);

// Loading admin list
var fs = require('fs');
var adminList = fs.readFileSync('admins.txt').toString().split("\n");

var synchedChannels = [
//    'cross-chat',
//    'xmog-contest',
      'xmog-contest-test',
//    'cross-addons-ui',
];

var isAdmin = function(user) {
    return adminList.indexOf(user.id) != -1;
}

client.on('message', msg => {    
    if (client.user.id === msg.author.id) return;
    if (msg.author.bot == true) return;
    
    if (msg.content.match(/^\/crossban .*$/)) {
        if (!isAdmin(msg.author)) {
            msg.channel.send("You're not permitted to do this, bitch");
            return;
        } 
        
        try {
            ban.ban(db, msg, blacklist);
        } catch(err) {
            chatFunctions.temporaryMessage(msg.channel, err, 8000);
        }
        return;
    }
    
    if (msg.content.match(/^\/crossunban .*$/)) {
        if (!isAdmin(msg.author)) {
            msg.channel.send("You're not permitted to do this, bitch");
            return;
        }
        
        try {
            ban.unban(db, msg, blacklist);
        } catch(err) {
            chatFunctions.temporaryMessage(msg.channel, err, 8000);
        }
        return;
    }
    
    if (msg.content.match(/^\/crossbaninfo .*$/)) {
        if (!isAdmin(msg.author)) {
            msg.channel.send("You're not permitted to do this, bitch");
            return;
        }
        
        try {
            ban.baninfo(db, msg);
        } catch(err) {
            chatFunctions.temporaryMessage(msg.channel, err, 8000);
        }
        return;
    }
    
    if (msg.content.match(/^\/crossbanlist$/)) {
        if (!isAdmin(msg.author)) {
            msg.channel.send("You're not permitted to do this, bitch");
            return;
        }
        
        ban.banList(db, msg);
    }
        
    if (blacklist.indexOf(msg.author.id) > -1) return;
    
    if (msg.content.match(/^\/xmog-participants-list/)) {
        contest.getParticipantsList(db, msg);
    }
    
    if (msg.content.match(/^\/vote .*$/) && contest.isXmogContestChannel(msg.channel)) { 
        chatFunctions.temporaryMessage(msg.channel, "Голосование закрыто до 20ого апреля, 20:00 GMT+3.", 8000);
        msg.delete();
        return;
        
        try {
            contest.doVote(db, msg);
        } catch(err) {
            chatFunctions.temporaryMessage(msg.channel, err, 8000);
        }
        
        return;
    }
    
    if (contest.isXmogContestChannel(msg.channel)) {
        if (msg.author.id != 207169330549358592) {
            msg.delete();
            return;
        }
        
        try {
            contest.participantAdd(client, db, msg);
        } catch(err) {
            chatFunctions.temporaryMessage(msg.channel, err, 8000);
            msg.delete();
        }
        return;
    }
    
    if (synchedChannels.indexOf(msg.channel.name) == -1) return;

    chatFunctions.SynchMessage(client, msg);
});

client.login(process.env.BOT_TOKEN);
/*jslint es6*/
const Discord = require('discord.js');
const client = new Discord.Client();
var http = require('http');
var Router = require('router');
var finalhandler = require('finalhandler');

client.login(process.env.app_token);

var challenge_duel_pattern = /^\!challenge (.*)$/im
var accept_duel_pattern = /^\!accept (.*)$/im
var submit_declaration_pattern = /^\!declare (.*)$/im
var end_duel_pattern = /^\!endduel$/im

var duels = [];

client.on('ready', () => {
  client.user.setActivity("It's time to duel!");
});

client.on('message', (message) => {
    if (message.channel.type != 'dm') {
        if (challenge_duel_pattern.test(message.content)) {
            if (message.mentions.users.array().length > 1) {
                return;
            }
            duels.push({'challenger': message.author.id, 'challenged': message.mentions.users.first().id});
            message.react('785251135950159892');
            message.react('✅');
        }
        if (accept_duel_pattern.test(message.content)) {
            var guild = message.guild;
            guild.channels.create('duel-' + message.member.nickname + '-' + message.mentions.members.first().nickname, {
                permissionOverwrites: [
                    {
                      id: message.author.id,
                      allow: ['SEND_MESSAGES']
                    },
                    {
                        id: message.mentions.users.first().id,
                        allow: ['SEND_MESSAGES']
                    }
                ],
                parent: '784727948061442078'
            })
            .then((duel_channel) => {
                message.react('785251135950159892');
                message.react('✅');
                var active_duel = duels.find(obj => obj.challenger === message.mentions.users.first().id && obj.challenged === message.author.id);
                active_duel.channel = duel_channel.id;
                active_duel.guild = guild.id;
            });
        }
        if (end_duel_pattern.test(message.content)) {
            var active_duel = duels.find(obj => obj.channel === message.channel.id);
            delete active_duel;
        }
    } else {
        if (submit_declaration_pattern.test(message.content)) {
            var declaration = submit_declaration_pattern.exec(message.content);
            var active_duel = duels.find(obj => obj.challenger === message.author.id || obj.challenged === message.author.id && typeof obj.channel !== 'undefined');
            //This assumes that people will only be in one active duel at a time
            if (message.author.id === active_duel.challenger) {
                active_duel.challenger_message = declaration[1];
                message.react('✅');
            } else if (message.author.id === active_duel.challenged) {
                active_duel.challenged_message = declaration[1];
                message.react('✅');
            }
            if (typeof active_duel.challenger_message !== 'undefined' && typeof active_duel.challenged_message !== 'undefined') {
                var duel_channel = client.channels.fetch(active_duel.channel);
                var guild = client.guilds.fetch(active_duel.guild);
                guild.members.fetch(active_duel.challenger)
                .then((challenger_nickname) => {
                    guild.members.fetch(active_duel.challenged)
                    .then((challenged_nickname) => {
                        duel_channel.send('**' + challenged_nickname + 'Declares:** *' + challenged_message + '*');
                        duel_channel.send('**' + challenger_nickname + 'Declares:** *' + challenger_message + '*');
                        delete active_duel.challenger_message;
                        delete active_duel.challenged_message;
                    });
                });
            }
        }
    }

});

var router = Router();
router.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('duelbot\n');
});

var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
});
server.listen(process.env.PORT || 8080);
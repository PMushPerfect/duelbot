const Discord = require('discord.js');
const client = new Discord.Client();
var http = require('http');
var Router = require('router');

client.login(process.env.app_token)

var challenge_duel_pattern = /^\!challenge (.*)$/im
var accept_duel_pattern = /^\!accept (.*)$/im
var submit_declaration_pattern = /^\!declare (.*)$/im

var duels = new Array();

client.on('ready', () => {
  client.user.setActivity("It's time to duel!");
})

client.on('message', message => {
    if (message.channel.type != 'dm') {
        if (challenge_duel_pattern.test(message.content)) {
            var guild = message.guild;
            if (message.mentions.users.array().length > 1) {
                return;
            }
            duels.push({'challenger': message.author.id, 'challenged': message.mentions.users.first().id});
        }
        if (accept_duel_pattern.test(message.content)) {
            server.channels.create('duel-' + message.member.nickname + '-' + message.mentions.members.first().nickname, {
                permissionOverwrites: [
                    {
                      id: message.author.id, 
                      allow: ['SEND_MESSAGES']
                    },
                    {
                        id: message.mentions.users.first().id,
                        allow: ['SEND_MESSAGES']
                    },
                ],
            })
            .then(duel_channel => {
                var active_duel = duels.find(obj => obj.challenger === message.mentions.users.first().id && obj.challenged === message.author.id);
                active_duel.channel = duel_channel.id;
                active_duel.guild = guild.id;
            });
        }
    } else {
        if (submit_declaration_pattern.test(message.content)) {
            var declaration = submit_declaration_pattern.exec(message.content)[1];
            var active_duel = duels.find(obj => obj.challenger === message.author.id || obj.challenged === message.author.id && typeof obj.channel !== 'undefined');
            //This assumes that people will only be in one active duel at a time
            if (message.author.id === active_duel.challenger) {
                active_duel.challenger_message == declaration;
            } else if (message.author.id === active_duel.challenged) {
                active_duel.challenged_message == declaration;
            }
            if (typeof active_duel.challenger_message !== 'undefined' && typeof active_duel.challenged_message !== 'undefined') {
                var duel_channel = client.channels.get(active_duel.channel);
                var guild = client.guilds.get(active_duel.guild);
                var challenger_nickname = guild.member(active_duel.challenger);
                var challenged_nickname = guild.member(active_duel.challenged);
                duel_channel.send('**' + challenged_nickname + 'Declares:** *' + challenged_message + '*');
                duel_channel.send('**' + challenger_nickname + 'Declares:** *' + challenger_message + '*');
                delete active_duel.challenger_message;
                delete active_duel.challenged_message;
            }
        }
    }

});

var router = Router()
router.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('duelbot\n');
});

var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res))
})
server.listen(process.env.PORT || 8080);
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.app_token)

var challenge_duel_pattern = /^\!challenge (.*)$/im
var accept_duel_pattern = /^\!accept (.*)$/im

var duels = new Array();

client.on('ready', () => {
  client.user.setActivity("It's time to duel!");
})

client.on('message', message => {
    if (message.channel.type != 'dm') {
        if (challenge_duel_pattern.test(message.content)) {
            var server = message.guild;
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
            });
        }
    } else {
        // this is where we process DM submissions and then post them in the channel.
        // need a way to distinguish what duel is being submitted to,
        // sanity check that the user is a participant in the duel,
        // then if both active_duel.challenger_declaration and active_duel.challenged_declaration are set, post both in channel and clear both of those
        // this becomes way easier if we can GUARANTEE that a user will only EVER be in one duel at a time, then we just put some restrictions on who can be challenged when
    }

});
module.exports = {
    name: "pause",
    description: "pauses the bot from playing songs",
    async execute(msg, args) {

        const voiceChannel = msg.member.voice.channel;
        // const numChannel = new Discord.GuildMember();

        if (!voiceChannel) {
            return msg.channel.send("You need to be in a channel to execute this command!");
        }

        await voiceChannel.leave();
        await msg.channel.send("Adios!");
    }
}
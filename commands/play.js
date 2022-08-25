const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
    name: "play",
    description: "plays songs",
    async execute(msg, args) {
        const voiceChannel = msg.member.voice.channel;
        const perms = voiceChannel.permissionsFor(msg.client.user);

        if (!voiceChannel) {
            return msg.channel.send("You need to be in a channel to execute this command!");
        } else if (!perms.has("CONNECT") || !perms.has("SPEAK")) {
            return msg.channel.send("Insufficient permissions given to the bot!\n Please provide both CONNECT and SPEAK Permissions for the bot.")
        } else if (!args.length) {
            return msg.channel.send("You need to provide a second argument.")
        }

        const song = await songSearch(args.join(" "));

        const connectToVoice = await voiceChannel.join();
        const songSearch = async (query) => {
            const searchResult = await ytSearch(query);
            return (searchResult.videos.length > 1) ? searchResult.videos[0] : null;
        }

        if (song) {
            const streamSound = ytdl(song.url, {filter: "audioonly"});
            connectToVoice.play(streamSound, {seek: 0, volume: 1})
                .on("finish", () => {
                    voiceChannel.leave();
                });

            await msg.reply("Now Playing ${video.title}");
        } else {
            msg.channel.send("Cannot find song...")
        }


        const urlCheck = (str) => {
            let validURL = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            return validURL.test(str);
        }

        if(urlCheck(args[0])) {
            const connectToVoice = await voiceChannel.join();
            const streamSound = ytdl(song.url, {filter: "audioonly"});
            connectToVoice.play(streamSound, {seek: 0, volume: 1})
                .on("finish", () => {
                    voiceChannel.leave();
                });
            await msg.reply("Now Playing ${video.title}");
            return
        }
    }
}
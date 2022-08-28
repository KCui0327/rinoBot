const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
    name: "play",
    description: "plays songs",
    async execute(msg, args) {
        const inVoiceChannel = msg.member.voice.channel;
        const song = await findSong(args.join(" "));

        if (!inVoiceChannel) { // checks if the user is in a voice channel
            return msg.channel.send("You need to be in a voice channel!");
        } else if (!args.length) { // if user does not enter second argument
            return msg.channel.send("You need to input a second argument!");
        }

        const botConnection = await inVoiceChannel.join();

        if (checkURL(args[0]) || song) { // song is found
            const playSong = ytdl(song.url, {filter: "audioonly"}); // converts video to audio
            botConnection.play(playSong, {seek: 0, volume: 5}).on("finish", () => {
                inVoiceChannel.leave(); // leave once song is finished
            });

            await msg.reply(`Currently playing ***${song.title}***`);
        }

    }
}

// finds songs on Youtube
async function findSong(query) {
    const searchResult = await ytSearch(query); // stores search result from Youtube
    return (searchResult.videos.length > 1) ? searchResult.videos[0] : null; // returns first result if song is found
}

function checkURL(str) {
    let verifyURL = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return verifyURL.test(str);
}


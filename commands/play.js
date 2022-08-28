const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = {
    name: "play",
    description: "plays songs",
    async execute(msg, args) {
        const inVoiceChannel = msg.member.voice.channel;
        const song = await findSong(args.join(" "));
        let playSong;

        if (!inVoiceChannel) { // checks if the user is in a voice channel
            return msg.channel.send("You need to be in a voice channel!");
        } else if (!args.length) { // if user does not enter second argument
            return msg.channel.send("You need to input a second argument!");
        }

        const botConnection = await inVoiceChannel.join();

        inVoiceChannel.join().then(connection => { // deafens Discord bot
            connection.voice.setSelfDeaf(true);
        })

        if (checkURL(args[0])) { // user inputs URL
            playSong  = ytdl(args[0], {filter: 'audioonly'}); // converts Youtube URL to audio
            ytdl.getInfo(args[0]).then(info => { // gets and output song title
                msg.reply(`Currently playing ***${info.videoDetails.title}***`);
            })
        } else if (song) { // song is found
            playSong = ytdl(song.url, {filter: "audioonly"}); // converts video to audio
            await msg.reply(`Currently playing ***${song.title}***`);
        } else {
            msg.channel.send("Cannot find song...");
        }

        botConnection.play(playSong, {seek: 0, volume: 1}).on("finish", () => {
            setTimeout(inVoiceChannel.leave(), 20000); // leave once song is finished
        });


    }
}

// finds songs on Youtube
async function findSong(query) {
    const searchResult = await ytSearch(query); // stores search result from Youtube
    return (searchResult.videos.length > 1) ? searchResult.videos[0] : null; // returns first result if song is found
}

// check if URL is input
function checkURL(str) {
    let verifyURL = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return verifyURL.test(str); // returns true or false
}



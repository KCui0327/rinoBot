const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const musicList = new Map();

module.exports = {
    name: "songControl",
    description: "all execution commands of the Discord bot",
    async execute(msg, args, command) {
        const inVoiceChannel = msg.member.voice.channel;
        const listOfSongs = musicList.get(msg.guild.id);

        if (!inVoiceChannel) { // checks if the user is in a voice channel
            return msg.channel.send("You need to be in a voice channel!");
        }

        switch (command) {
            case "play":
                if (!args.length) { // if user does not enter second argument
                    return msg.channel.send("You need to input a second argument!");
                }
                const song = await findSong(args.join(" "));
                let list = {}, urlInfo;

                inVoiceChannel.join().then(connection => { // deafens Discord bot
                    connection.voice.setSelfDeaf(true);
                })

                if (checkURL(args[0])) { // user inputs URL
                    urlInfo = await ytdl.getInfo(args[0]) // gets info from URL
                    list = {title: urlInfo.videoDetails.title, url: urlInfo.videoDetails.video_url} // stores url info into list
                } else if (song) { // song is found
                    list = {title: song.title, url: song.url} // stores url info into list
                } else { // if no song is found
                    msg.channel.send("Cannot find song...");
                }

                if (!listOfSongs) {
                    const queueConstructor = {
                        voiceChannel: inVoiceChannel,
                        textChannel: msg.channel,
                        connection: null,
                        songs: []
                    }

                    musicList.set(msg.guild.id, queueConstructor);
                    queueConstructor.songs.push(list);

                    queueConstructor.connection = await inVoiceChannel.join();
                    await songPlayer(msg.guild, queueConstructor.songs[0]);

                } else {
                    listOfSongs.songs.push(list);
                    return msg.channel.send(`***${list.title}*** added to queue!`);
                }
                break;
            case "leave":
                listOfSongs.songs = [];
                listOfSongs.connection.dispatcher.end();
                msg.channel.send("Adios!");
                break;
            case "skip":
                if (!listOfSongs) {
                    return msg.channel.send("There are **no** songs in the queue!");
                } else if (listOfSongs.songs.length === 1) {
                    listOfSongs.connection.dispatcher.end();
                    return msg.channel.send("Adios!")
                }
                listOfSongs.connection.dispatcher.end();
                break;
            case "pause":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")

                } else if (listOfSongs.connection.dispatcher.paused) {
                    return msg.channel.send("The song is already paused...");
                }
                listOfSongs.connection.dispatcher.pause(true);
                msg.channel.send("Your music is paused!");
                break;
            case "resume":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")

                } else if (!listOfSongs.connection.dispatcher.paused) {
                    return msg.channel.send("The song is already playing...");
                }
                listOfSongs.connection.dispatcher.resume();
                msg.channel.send(`***${listOfSongs.songs[0].title}*** is resumed!`);
                break;
            case "list":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")
                }
                for (let i = 0; i < listOfSongs.songs.length; i++) {
                    msg.channel.send(`***${i + 1}.***  __${listOfSongs.songs[i].title}__`);
                }
                break;
            case "remove":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")
                } else if (!args.length) { // if user does not enter second argument
                    return msg.channel.send("You need to input a second argument (number from queue list)!");
                }

                let deleteNum = args - 1;

                if (deleteNum === 0) {
                    return msg.channel.send("Cannot remove the current song that is playing!");
                } else if (deleteNum > (listOfSongs.songs.length - 1)) {
                    return msg.channel.send(`There are no songs in the ***${args}*** position!`);
                }

                let nameDelete = listOfSongs.songs[deleteNum].title;
                listOfSongs.songs.splice(deleteNum, deleteNum + 1);
                msg.channel.send(`Removed ***${nameDelete}*** from the queue list`);
                break;
            case "shuffle":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")
                } else if (listOfSongs.songs.length === 1) {
                    return msg.channel.send("There is only one song! Cannot shuffle playlist with one song");
                }
                shuffleSongs(listOfSongs.songs, listOfSongs.songs.length);
                msg.channel.send("Queue is now shuffled!");
                break;
        }
    }
}

// finds songs on YouTube
async function findSong(query) {
    const searchResult = await ytSearch(query); // stores search result from Youtube
    return (searchResult.videos.length > 1) ? searchResult.videos[0] : null; // returns first result if song is found
}

// check if URL is input
function checkURL(str) {
    let verifyURL = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return verifyURL.test(str); // returns true or false
}

async function songPlayer(guild, song) {
    const songQueue = musicList.get(guild.id);

    if (!song) {
        songQueue.voiceChannel.leave();
        musicList.delete(guild.id);
        return;
    }

    const playSong = ytdl(song.url, { filter: 'audioonly' });
    songQueue.connection.play(playSong, { seek: 0, volume: 1 })
        .on('finish', () => {
            songQueue.songs.shift();
            songPlayer(guild, songQueue.songs[0]);
        });

    await songQueue.textChannel.send(`Currently playing ***${song.title}***`);
}

function shuffleSongs(listOfSongs, songsLength) {
    for (let i = songsLength - 1; i > 1; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = listOfSongs[i];
        listOfSongs[i] = listOfSongs[j];
        listOfSongs[j] = temp;
    }
}







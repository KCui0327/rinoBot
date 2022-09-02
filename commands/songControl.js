const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const musicList = new Map(); // global queue for bot

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

                if (!listOfSongs) { // establishes a global queue if one does not exist
                    const queueConstructor = {
                        voiceChannel: inVoiceChannel,
                        textChannel: msg.channel,
                        connection: null,
                        songs: []
                    }

                    musicList.set(msg.guild.id, queueConstructor);
                    queueConstructor.songs.push(list);

                    queueConstructor.connection = await inVoiceChannel.join(); // bot joins channel
                    await songPlayer(msg.guild, queueConstructor.songs[0]);

                } else {
                    listOfSongs.songs.push(list);
                    return msg.channel.send(`***${list.title}*** added to queue!`);
                }
                break;
            case "leave":
                listOfSongs.songs = []; // empties playlist
                listOfSongs.connection.dispatcher.end(); // ends connection
                msg.channel.send("Adios!");
                break;
            case "skip":
                if (!listOfSongs) {
                    return msg.channel.send("There are **no** songs in the queue!");
                } else if (listOfSongs.songs.length === 1) {
                    listOfSongs.connection.dispatcher.destroy(); // ends connection
                    return msg.channel.send("Adios!")
                }
                listOfSongs.connection.dispatcher.end(); // ends current stream dispatcher
                break;
            case "pause":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")

                } else if (listOfSongs.connection.dispatcher.paused) { // song is already paused
                    return msg.channel.send("The song is already paused...");
                }
                listOfSongs.connection.dispatcher.pause(true); // pauses current stream dispatcher with silence mode
                msg.channel.send("Your music is paused!");
                break;
            case "resume":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")

                } else if (!listOfSongs.connection.dispatcher.paused) { // song is not paused
                    return msg.channel.send("The song is already playing...");
                }
                listOfSongs.connection.dispatcher.resume(); // resumes stream dispatcher
                msg.channel.send(`***${listOfSongs.songs[0].title}*** is resumed!`);
                break;
            case "list":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")
                }
                for (let i = 0; i < listOfSongs.songs.length; i++) { // loops through the global queue
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
                listOfSongs.songs.splice(deleteNum, deleteNum + 1); // removes song and replaces with the next song
                msg.channel.send(`Removed ***${nameDelete}*** from the queue list`);
                break;
            case "shuffle":
                if (!listOfSongs) {
                    return msg.channel.send("There is no music playing!")
                } else if (listOfSongs.songs.length === 1 || listOfSongs.songs.length === 2) {
                    return msg.channel.send("There is only one or two song! Cannot shuffle playlist such little songs!");
                }
                shuffleSongs(listOfSongs.songs, listOfSongs.songs.length); // shuffles songs in queue
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

// plays songs from YouTube
async function songPlayer(guild, song) {
    const songQueue = musicList.get(guild.id);

    if (!song) { // no songs in queue
        songQueue.voiceChannel.leave();
        musicList.delete(guild.id);
        return;
    }

    const playSong = ytdl(song.url, { filter: 'audioonly' }); // searches song on Youtube and convert to MP3
    songQueue.connection.play(playSong, { seek: 0, volume: 1 })
        .on('finish', () => {
            songQueue.songs.shift(); // removes song played and shifts to the next song
            songPlayer(guild, songQueue.songs[0]); // play the next song
            //  the process repeats until all songs in queue are played
        });

    await songQueue.textChannel.send(`Currently playing ***${song.title}***`);
}

// shuffling songs in the queue list
function shuffleSongs(listOfSongs, songsLength) {
    // Durstenfeld's Shuffle
    for (let i = songsLength - 1; i > 1; i--) { // shuffle songs in queue except the current song playing
        let j = Math.floor(Math.random() * (i + 1));
        let temp = listOfSongs[i];
        listOfSongs[i] = listOfSongs[j];
        listOfSongs[j] = temp;
    }
}
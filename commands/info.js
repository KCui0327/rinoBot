module.exports = {
    name: "info",
    description: "describes the commands",
    execute(msg) {
        let instructions = "**Command List**" +
            "\n> !play\n" +
            "```- plays music from Youtube link or song name```\n" +
            "> !leave \n" +
            "```- the music bot leaves voice channel```\n" +
            "> !skip\n" +
            "```- skips current song that is playing```\n" +
            "> !pause\n" +
            "```- pauses current song```\n" +
            "> !resume\n" +
            "```- resumes paused song```\n" +
            "> !list\n" +
            "```- prints out current playlist```\n" +
            "> !remove\n" +
            "```- removes song from playlist```\n" +
            "> !shuffle\n" +
            "```- shuffles playlist```\n";
        msg.channel.send(instructions);
    }
}
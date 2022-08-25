module.exports = {
    name: "info",
    description: "describes the commands",
    execute(msg) {
        let instructions = "**Command List**" +
            "\n> !play\n" +
            "```- plays music from Youtube link or song name```\n" +
            "> !stop \n" +
            "```- stops music from playing```\n" +
            "> !list\n" +
            "```- prints out list of the music queue```\n" +
            "> !remove\n" +
            "```- removes song from queue by providing queue number```";
        msg.channel.send(instructions);
    }
}
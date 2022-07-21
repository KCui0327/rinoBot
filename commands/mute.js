module.exports = {
    name: "mute",
    description: "mutes discord users",
    execute(message, args) {
        message.channel.send("mute!");
    }
}
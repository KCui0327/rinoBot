module.exports = {
    name: "mute",
    description: "mutes discord users",
    execute(msg, args) {
        const muteUser = msg.mentions.users.first();
        if (muteUser) {
            let targetRole = msg.guild.roles.cache.find(role => role.name === "")
        } else {
            msg.channel.send("Cannot find user.")
        }
    }
}
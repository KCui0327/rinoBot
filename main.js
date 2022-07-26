const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "!";
const fs = require("fs")
require("dotenv").config();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on("ready", () => {
    console.log("Online");
});

client.on("message", msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "info":
            client.commands.get("info").execute(msg);
            break;
        case "play":
        case "leave":
        case "skip":
        case "pause":
        case "resume":
        case "list":
        case "remove":
        case "shuffle":
            client.commands.get("songControl").execute(msg, args, command);
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);

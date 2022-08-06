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
            client.commands.get("play").execute(msg, args);
            break;
        case "stop":
            client.commands.get("stop").execute(msg, args);
            break;
        case "list":
            client.commands.get("list").execute(msg, args);
            break;
        case "remove":
            client.commands.get("remove").execute(msg, args);
            break;
        default:
            console.log("Error");
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);

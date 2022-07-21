const Discord = require("discord.js");

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const prefix = "!";

const fs = require("fs");

client.commands = new Discord.Collection();

const commandOperations = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandOperations) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", () => {
    console.log("Online");
});

client.on("message", message => {
    if (!message.content.startsWith(prefix) || message.authorbot) {
        console.log("Wrong Prefix! Please use" + " '!'.");
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === "mute") {
        client.commands.get("mute").execute(message, args);
    }
})

client.login("OTk5NzgzODE0MDA2MDYzMjE0.GMzKlX.Jpf5xXGj_K0bMc1s4DkzowbpMlks6k1W8xgecA");

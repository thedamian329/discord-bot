function master(message, command, client) {
  if (command === "master") {
    message.channel.send(
      "I am the dungeon Master. For 10,000 gold, I can help guide you on what you may find in the dungeon. Use !guide"
    );
  }
}

module.exports = master;

function register(message, command, db, handleLevelUp, client, rulesMessage) {
  if (command === "register") {
    db.run(
      `INSERT INTO users (id, username, gold) VALUES (?, ?, ?)`,
      [message.author.id, message.author.username, 0],
      function (err) {
        if (err) {
          return message.channel.send("You are already registered.");
        }
        message.channel.send(`Welcome in ${message.author.username}!`);

        const user = client.users.cache.get(message.author.id);
        if (user) {
          user
            .send(rulesMessage)
            .catch((error) => console.error("Failed to send message:", error));
        } else {
          console.error("User not found:", message.author.id);
        }
      }
    );
  }
}

module.exports = register;

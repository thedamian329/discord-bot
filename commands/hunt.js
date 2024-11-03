function hunt(message, command, db, handleLevelUp) {
  if (command === "hunt") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }

        const huntRabbit = Math.random() < 0.25;

        if (huntRabbit) {
          db.run(
            `UPDATE users SET meat = meat + 1, exp = exp + 25 WHERE id = ?`,
            [message.author.id],
            function (err) {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(
                "You hunt down a rabbit gaining 1 meat and 25 exp!"
              );
              handleLevelUp(message.author.id);
            }
          );
        } else {
          message.channel.send("You return with nothing");
        }
      }
    );
  }
}

module.exports = hunt;

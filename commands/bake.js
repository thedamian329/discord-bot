function bake(message, command, db, handleLevelUp) {
  if (command === "bake") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up"
          );
        }

        if (row.wheat < 5) {
          return message.channel.send(
            "You do not have enough wheat to bake bread."
          );
        }

        db.run(
          `UPDATE users SET wheat = wheat - 5, bread = bread + 1 WHERE id = ?`,
          [message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send("You used 5 wheat and baked a loaf of bread!");
            handleLevelUp(message.author.id);
          }
        );
      }
    );
  }
}

module.exports = bake;

function sneak(message, command, db, handleLevelUp) {
  if (command === "sneak") {
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

        db.run(
          `UPDATE users SET stealth = stealth +1 WHERE id = ?`,
          [message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }

            message.channel.send("You sneak around");
            handleLevelUp(message.author.id);
          }
        );
      }
    );
  }
}

module.exports = sneak;

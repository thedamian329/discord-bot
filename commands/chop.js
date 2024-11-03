function chop(message, command, db, handleLevelUp) {
  if (command === "chop") {
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
          `UPDATE users SET wood = wood + 1, strength = strength + 1, exp = exp + 10 WHERE id = ?`,
          [message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(
              "You chopped down a tree and gained 10 EXP, 1 Strength and 1 wood!"
            );
            handleLevelUp(message.author.id);
          }
        );
      }
    );
  }
}

module.exports = chop;

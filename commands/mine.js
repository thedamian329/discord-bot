function mine(message, command, db, handleLevelUp) {
  if (command === "mine") {
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

        const goldChance = Math.random() < 0.07; // try fucking around with these numbers.
        const goldEarned = goldChance ? Math.floor(Math.random() * 100) + 1 : 0;

        db.run(
          `UPDATE users SET stone = stone + 1, strength = strength + 2, exp = exp + 15, gold = gold + ? WHERE id = ?`,
          [goldEarned, message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }

            let response = `You mined stone, gaining 15 exp and 2 strength.`;
            if (goldChance) {
              response += ` You dug extra hard and found ${goldEarned} gold!`;
            }
            message.channel.send(response);
            handleLevelUp(message.author.id);
          }
        );
      }
    );
  }
}

module.exports = mine;

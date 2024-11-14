function eatmeat(
  message,
  command,
  db,
  handleLevelUp,
  getDefaultHealthForLevel
) {
  if (command === "eatmeat") {
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

        const maxHealth = getDefaultHealthForLevel(row.level);

        if (row.health >= maxHealth) {
          return message.channel.send(
            "You are already at full health and don't need to eat."
          );
        }

        if (row.meat > 0) {
          const isRotten = Math.random() < 0.2; // 20% may be a little high but lets try for now.

          if (isRotten) {
            const damage = 30;
            const expLoss = 15;
            const newHealth = Math.max(row.health - damage, 0);
            const newExp = Math.max(row.exp - expLoss, 0);

            db.run(
              `UPDATE users SET meat = meat - 1, health = ?, exp = ? WHERE id = ?`,
              [newHealth, newExp, message.author.id],
              function (err) {
                if (err) {
                  return console.error(err.message);
                }
                message.channel.send(
                  `You ate a piece of meat, but it was rotten! You took ${damage} damage and lost ${expLoss} experience. Your health is now ${newHealth}.`
                );
                handleLevelUp(message.author.id);
              }
            );
          } else {
            const healAmount = 25;
            const newHealth = Math.min(row.health + healAmount, maxHealth);

            db.run(
              `UPDATE users SET meat = meat - 1, health = ? WHERE id = ?`,
              [newHealth, message.author.id],
              function (err) {
                if (err) {
                  return console.error(err.message);
                }
                message.channel.send(
                  `You ate a piece of meat and restored ${healAmount} health. Your health is now ${newHealth}.`
                );
              }
            );
          }
        } else {
          message.channel.send("You have no meat to eat.");
        }
      }
    );
  }
}

module.exports = eatmeat;

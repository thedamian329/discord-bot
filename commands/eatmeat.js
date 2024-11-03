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
        if (row.meat > 0) {
          const newHealth = Math.min(
            row.health + 25,
            getDefaultHealthForLevel(row.level)
          ); // Heal for 50 health
          db.run(
            `UPDATE users SET meat = meat - 1, health = ? WHERE id = ?`,
            [newHealth, message.author.id],
            function (err) {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(
                `You ate a piece of meat and restored 25 health. Your health is now ${newHealth}.`
              );
            }
          );
        } else {
          message.channel.send("You have no meat to eat.");
        }
      }
    );
  }
}

module.exports = eatmeat;

function eatbread(
  message,
  command,
  db,
  handleLevelUp,
  getDefaultHealthForLevel
) {
  if (command === "eatbread") {
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
        if (row.bread > 0) {
          const newHealth = Math.min(
            row.health + 10,
            getDefaultHealthForLevel(row.level)
          );
          db.run(
            `UPDATE users SET bread = bread - 1, health = ? WHERE id = ?`,
            [newHealth, message.author.id],
            function (err) {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(
                `You ate a piece of bread and restored 10 health. Your health is now ${newHealth}.`
              );
            }
          );
        } else {
          message.channel.send("You have no bread to eat.");
        }
      }
    );
  }
}

module.exports = eatbread;

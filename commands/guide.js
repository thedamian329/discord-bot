const dungeonEnemies = {
  slime: { health: 1000, strength: 150, exp: 100, gold: 50 },
  wolf: { health: 1500, strength: 300, exp: 200, gold: 100 },
  goblin: { health: 1000, strength: 500, exp: 300, gold: 150 },
  orc: { health: 5000, strength: 300, exp: 500, gold: 300 },
  knight: { health: 7000, strength: 1000, exp: 1500, gold: 1000 },
  dragon: { health: 15000, strength: 1000, exp: 10000, gold: 10000 },
};

function guide(message, command, db) {
  if (command === "guide") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          console.error(err.message);
          return message.channel.send(
            "An error occurred while accessing the database."
          );
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }

        const userGold = row.gold || 0;
        if (userGold < 10000) {
          return message.channel.send(
            "You do not have enough gold. You need 10,000 gold to access the guide."
          );
        }

        const newGold = userGold - 10000;

        db.run(
          `UPDATE users SET gold = ? WHERE id = ?`,
          [newGold, message.author.id],
          (updateErr) => {
            if (updateErr) {
              console.error(updateErr.message);
              return message.channel.send(
                "An error occurred while updating your gold."
              );
            }

            let dungeonList =
              "Here is a list of what you may encounter in the dungeon:\n";

            for (const [enemy, stats] of Object.entries(dungeonEnemies)) {
              dungeonList += `**${
                enemy.charAt(0).toUpperCase() + enemy.slice(1)
              }** - `;
              dungeonList += `Health: ${stats.health}, Strength: ${stats.strength}, EXP: ${stats.exp}, Gold: ${stats.gold}\n`;
            }
            message.channel.send(dungeonList);
          }
        );
      }
    );
  }
}

module.exports = guide;

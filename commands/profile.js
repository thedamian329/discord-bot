function profile(message, command, db, handleLevelUp) {
  if (command === "profile") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }
        message.channel.send(
          `Profile of ${row.username}: \nLevel: ${row.level} \nEXP: ${row.exp} \nGold: ${row.gold} \nWood: ${row.wood} \nStone: ${row.stone} \nFish: ${row.fish} \nStrength: ${row.strength} \nHealth: ${row.health} \nStealth: ${row.stealth} \nMeat: ${row.meat} \nWheat: ${row.wheat} \nBread: ${row.bread} \nDeaths: ${row.death} \nPvp: ${row.pvp}`
        );
      }
    );
  }
}

module.exports = profile;

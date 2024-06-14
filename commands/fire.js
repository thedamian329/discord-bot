function fire (message, command, db, handleLevelUp) {
if (command === 'fire') {
  db.get(`SELECT level, health, wood FROM users WHERE id = ?`, [message.author.id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (!row) {
      return message.channel.send('You are not registered. Use !register to sign up');
    }

    if (row.wood < 5) {
      return message.channel.send('You do not have any wood to start a fire.');
    }

    let maxHealth = 50 + (row.level - 1) * 50;
    if (row.health >= maxHealth) {
      return message.channel.send('You are already at full health.');
    }

  // how much you heal for
    let healthGain = 50;

    let newHealth = Math.min(maxHealth, row.health + healthGain);


    db.run(`UPDATE users SET health = ?, wood = wood - 5 WHERE id = ?`, [newHealth, message.author.id], function(err) {
      if (err) {
        return console.error(err.message);
      }
      message.channel.send(`you create a fire using 5 wood. You sit by the fire to relax.You gain ${healthGain} health. Your health is now ${newHealth}/${maxHealth}.`);
    });
  });
}
}

module.exports = fire;
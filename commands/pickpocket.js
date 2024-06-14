function pickpocket(message, command, db, handleLevelUp, client, args) {
if (command === 'pickpocket') {
  const targetId = args[0].replace(/[^0-9]/g, '');  // Extract ID from mention
  if (message.author.id === targetId) {
    return message.channel.send('You cannot pickpocket yourself!');
  }
  db.get(`SELECT * FROM users WHERE id = ?`, [targetId], (err, target) => {
    if (err) {
      return console.error(err.message);
    }
    if (!target) {
      return message.channel.send('Target not found.');
    }
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, user) => {
      if (err) {
        return console.error(err.message);
      }
      if (!user) {
        return message.channel.send('You are not registered. Use !register to sign up');
      }
      const successChance = Math.min(75, Math.max(25, 10 + user.stealth - target.stealth));
      if (Math.random() * 100 < successChance) {
        const amount = Math.floor(Math.random() * (target.gold / 2)) + 1;
        db.run(`UPDATE users SET gold = gold - ? WHERE id = ?`, [amount, target.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          db.run(`UPDATE users SET gold = gold + ?, stealth = stealth + 1 WHERE id = ?`, [amount, message.author.id], function(err) {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(`You successfully pickpocketed ${amount} gold from ${target.username} and gained 1 stealth.`);
            handleLevelUp(message.author.id);
          });
        });
      } else {
        message.channel.send('Pickpocket attempt failed. Better luck next time!');
      }
    });
  });
}
}

module.exports = pickpocket; 
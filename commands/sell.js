function sell (message, command, db, handleLevelUp, client) {
if (command === 'sell') {
  const args = message.content.split(' ');
  const itemToSell = args[1];

  if (itemToSell === 'fish') {
    db.get(`SELECT fish, gold FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      if (row.fish > 0) {
        const fishSold = row.fish;
        const goldEarned = fishSold * 3;
        db.run(`UPDATE users SET gold = ?, fish = 0 WHERE id = ?`, [row.gold + goldEarned, message.author.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          message.channel.send(`You sold all your fish (${fishSold}) and got ${goldEarned} gold.`);
        });
      } else {
        message.channel.send('You don\'t have any fish to sell.');
      }
    });

  } else if (itemToSell === 'stone') {
    db.get(`SELECT stone, gold FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      if (row.stone > 0) {
        const stonesSold = row.stone;
        const goldEarned = stonesSold * 2;
        db.run(`UPDATE users SET gold = ?, stone = 0 WHERE id = ?`, [row.gold + goldEarned, message.author.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          message.channel.send(`You sold all your stone (${stonesSold}) and got ${goldEarned} gold.`);
        });
      } else {
        message.channel.send('You don\'t have any stone to sell.');
      }
    });
  } else {
    message.channel.send('Invalid item to sell. Use !sell fish or !sell stone.');
  }
}
}

module.exports = sell;
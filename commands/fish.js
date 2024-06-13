function fish (message, command, db, handleLevelUp ) {
if (command === 'fish') {
  db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      return message.channel.send('You are not registered. Use !register to sign up.');
    }

    const catchFish = Math.random() < 0.40;

    if (catchFish) {
      db.run(`UPDATE users SET fish = fish + 1, exp = exp + 15 WHERE id = ?`, [message.author.id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        message.channel.send('You caught a fish and gained 15 EXP!');
        handleLevelUp(message.author.id);
      });
    } else {
      message.channel.send('No fish were caught');
    }
  });
}
}

module.exports = fish; 
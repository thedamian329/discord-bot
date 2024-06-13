function harvest(message, command, db, handleLevelUp) {
if (command === 'harvest') {
  db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      return message.channel.send('You are not registered. Use !register to sign up');
    }

    db.run(`UPDATE users SET wheat = wheat + 1, exp = exp + 15 WHERE id = ?`,[message.author.id], function (err) {
      if (err) {
        return console.error(err.message);
      }
      message.channel.send('You harvested some wheat, gaining 15 exp!');
      handleLevelUp(message.author.id)
    });
  });
}
}

module.exports = harvest; 
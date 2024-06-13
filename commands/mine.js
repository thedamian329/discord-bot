function mine(message, command, db, handleLevelUp) {
if (command === 'mine') {
  db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
          return console.error(err.message);
      }
      if (!row) {
          return message.channel.send('You are not registered. Use !register to sign up');
      }

      db.run(`UPDATE users SET stone = stone + 1, strength = strength +2, exp = exp + 15 WHERE id = ?`, [message.author.id], function (err) {
          if (err) {
              return console.error(err.message);
          }

          message.channel.send('You mined stone, gaining 15 exp and 2 strength');
          handleLevelUp(message.author.id)
      });
  });
}
}

module.exports = mine;
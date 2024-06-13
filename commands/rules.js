function rules(message, command, db, handleLevelUp, client, rulesMessage) {
if (command === 'rules') {
  const user = client.users.cache.get(message.author.id);
  if (user) {
    user.send(rulesMessage).catch(error => console.error('Failed to send message:', error));
  } else {
    console.error('User not found:', message.author.id);
  }
}
}

module.exports = rules;
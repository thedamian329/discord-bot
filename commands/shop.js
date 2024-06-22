function shop (message, command, db, handleLevelUp) {
if (command === 'shop') {
  let shopList = 'List of items in shop:\n';
  for (const shop in shopInventory) {
      shopList += `**${shop}** - Gold: ${shopInventory[shop].gold}, Strength: ${shopInventory[shop].strength}, health ${shopInventory[shop].health}\n`;
  }
  message.channel.send(shopList)
      .catch(error => console.error('Failed to send message:', error));
}
}

module.exports = shop; 
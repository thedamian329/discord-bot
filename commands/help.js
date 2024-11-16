const helpMessage = `
**Commands:**
- \`!register\`: Register to become a player.
- \`!profile\`: View your stats and inventory.
- \`!chop\`: Chop trees to gain wood, experience, and strength.
- \`!mine\`: Mine stone to gain stone, experience, and strength.
- \`!fish\`: Fish to sell and gain exp.
- \`!sell[fish][stone]\`: Sell your fish to earn gold.
- \`!hunt\`: Hunt for meat and gain experience.
- \`!sneak\`: Practice your stealth.
- \`!pickpocket [@player]\`: Pickpocket a player.
- \`!fire\`: Sit by the fire to heal.
- \`!eatbread\`: Eat bread.
- \`!eatmeat\`: Eat meat.
- \`!npc\`: View a list of enemies you can fight.
- \`!attack [enemy]\`: Engage in battle with an enemy.
- \`challenge [@player]\`: Challenge a player to a battle.
- \`!shop\`: View items available in the shop.
- \`!buy [item]\`: Purchase an item from the shop.
- \`!patch\`: See the current patch and patch notes.
- \`!training\`: Bring up the training list.
- \`!train [type]\`: Train your character.
- \`!master\`: Bring up the master.
- \`!guide\`: brings up the enemies you will find in the dungeon.
- \`!help\`: bring up the command list.
    `;

function help(message, command) {
  if (command === "help") {
    message.channel.send(helpMessage);
  }
}

module.exports = help;

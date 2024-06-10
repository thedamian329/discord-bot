const { Client, Intents } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const secret = require('dotenv').config();

// Connect to the SQLite database
let db = new sqlite3.Database('./rpg.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the RPG database.');
});

// Create necessary tables if they don't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  health INT DEFAULT 50,
  gold INT DEFAULT 0,
  fish INT DEFAULT 0,
  meat INT DEFAULT 0,
  pvp INT DEFAULT 0,
  stealth INT DEFAULT 0,
  strength INT DEFAULT 10,
  wood INT DEFAULT 0,
  wheat INT DEFAULT 0,
  bread INT DEFAULT 0,
  stone INT DEFAULT 0,
  level INT DEFAULT 1,
  death INT DEFAULT 0,
  exp INT DEFAULT 0
)`);


client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // june 07 2024 first major updates. 
  const rulesMessage = `
  **Patch Notes - Version 1.2.0**
  **WHEN YOU DIE YOU NOW START BACK AT LEVEL 1**
fixed you being able to pickpocket and challenge yourself to a fight.
You can no longer have negative wood.


  
         **Commands:**
  - \`!register\`: register to become a player.
  - \`!profile\`: View your stats and inventory.
  - \`!chop\`: Chop trees to gain wood, experience, and strength.
  - \`!mine\`: Mine stone to gain stone, experience, and strength
  - \`!fish\`: fish to sell and gain exp
  - \`!sell[fish][stone]\`: Sell your fish to earn gold.
  - \`!hunt\`: Hunt for meat and gain experience.
  - \`!sneak\`: Practice your stealth.
  - \`!pickpocket [@player]\`: pickpocket a player.
  - \`!fire\`: Sit by the fire to heal.
  - \`!eatbread\`: eat bread.
  - \`!eatmeat\`: eat meat.
  - \`!npc\`: View a list of enemies you fight.
  - \`!attack [enemy]\`: Engage in battle with an enemy.
  - \`challenge [@player]\`: Challenge a player to a battle. 
  - \`!shop\`: View items available in the shop.
  - \`!buy [item]\`: Purchase an item from the shop.
  - \`!patch\`: see the current patch and patch notes.
  `;
  
    if (command === 'register') {
      db.run(`INSERT INTO users (id, username, gold) VALUES (?, ?, ?)`, [message.author.id, message.author.username, 0], function(err) {
        if (err) {
          return message.channel.send('You are already registered.');
        }
        message.channel.send(`Welcome in ${message.author.username}!`);
        
        const user = client.users.cache.get(message.author.id);
        if (user) {
          user.send(rulesMessage).catch(error => console.error('Failed to send message:', error));
        } else {
          console.error('User not found:', message.author.id);
        }
      });
    }
  
    if (command === 'rules') {
      const user = client.users.cache.get(message.author.id);
      if (user) {
        user.send(rulesMessage).catch(error => console.error('Failed to send message:', error));
      } else {
        console.error('User not found:', message.author.id);
      }
    }
 
    if (command === 'patch') {
      const user = client.users.cache.get(message.author.id);
      if (user){
        user.send(rulesMessage).catch(error => console.error('Failed to send message', error));
      } else {
        console.error('User not found:', message.author.id);
      }
    }

 
  function handleLevelUp(userId) {
    db.get(`SELECT level, exp, health, strength FROM users WHERE id = ?`, [userId], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
  
      let requiredExp = getRequiredExp(row.level);
      if (row.exp >= requiredExp) {
        let newLevel = row.level + 1;
        let newHealth = getDefaultHealthForLevel(newLevel); // Calculate health based on new level
        let newStrength = row.strength + 25;
  
        db.run(`UPDATE users SET level = ?, exp = exp - ?, health = ?, strength = ? WHERE id = ?`, [newLevel, requiredExp, newHealth, newStrength, userId], (err) => {
          if (err) {
            return console.error(err.message);
          }
          client.users.cache.get(userId).send(`You're now level ${newLevel}! Your health has increased to ${newHealth} and your strength is now ${newStrength}`);
        });
      }
    });
  }
  
  function getRequiredExp(level) {
    return 500  * level; 
  }
  
  function getDefaultHealthForLevel(level) {
    return 50 * level; 
  }
  


  if (command === 'profile') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      message.channel.send(`Profile of ${row.username}: \nLevel: ${row.level} \nEXP: ${row.exp} \nGold: ${row.gold} \nWood: ${row.wood} \nStone: ${row.stone} \nFish: ${row.fish} \nStrength: ${row.strength} \nHealth: ${row.health} \nStealth: ${row.stealth} \nMeat: ${row.meat} \nWheat: ${row.wheat} \nBread: ${row.bread} \nDeaths: ${row.death} \nPvp: ${row.pvp}`);
    });
  }

  function resetToLevel1(userId) {
    const defaultHealth = 50;
    const defaultStrength = 10;
    const defaultGold = 0;
    const defaultFish = 0;
    const defaultMeat = 0;
    const defaultStealth = 0;
    const defaultWood = 0;
    const defaultWheat = 0;
    const defaultBread = 0;
    const defaultStone = 0;


    db.run(`UPDATE users SET level = 1, exp = 0, health = ?, strength = ?, gold = ?, fish = ?, meat = ?, stealth = ?, wood = ?, wheat = ?, bread = ?, stone = ?  WHERE id = ?`, [defaultHealth, defaultStrength, defaultGold, defaultFish, defaultMeat, defaultStealth, defaultWood, defaultWheat, defaultBread, defaultStone, userId], (err) => {
      if (err) {
        return console.error(err.message);
      }
      client.users.cache.get(userId).send(`You died. Time to start over`);
    });
  }


  if (command === 'chop') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (!row) {
            return message.channel.send('You are not registered. Use !register to sign up');
        }

        db.run(`UPDATE users SET wood = wood + 1, strength = strength + 1, exp = exp + 10 WHERE id = ?`, [message.author.id], function (err) {
            if (err) {
                return console.error(err.message);
            }
            message.channel.send('You chopped a tree and gained 10 EXP, 1 Strength and 1 wood!');
            handleLevelUp(message.author.id);
        });
    });
}

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


if (command === 'bake') {
  db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      return message.channel.send('You are not registered. Use !register to sign up');
    }

    if (row.wheat < 5) {
      return message.channel.send('You do not have enough wheat to bake bread.');
    }

    db.run(`UPDATE users SET wheat = wheat - 5, bread = bread + 1 WHERE id = ?`, [message.author.id], function (err) {
      if (err) {
        return console.error(err.message);
      }
      message.channel.send('You used 5 wheat and baked a loaf of bread!');
      handleLevelUp(message.author.id);
    });
  });
}

  const enemies = {
    slime: { health: 50, strength: 20, exp: 10, gold: 5 },
    wolf: { health: 100, strength: 50, exp: 25, gold: 10 },
    crab: { health: 200, strength: 30, exp: 20, gold: 8 },
    goblin: { health: 500, strength: 200, exp: 50, gold: 15 },
    spider: {health: 800, strength: 500, exp: 75, gold: 30},
    zombie: { health: 2000, strength: 20, exp: 0, gold: 100 },
    orc: { health: 1500, strength: 800, exp: 150, gold: 50 },
    ogre: { health: 2000, strength: 1000, exp: 200, gold: 150 },
    troll: { health: 3500, strength: 800, exp: 350, gold: 200 },
    knight: { health: 5000, strength: 2000, exp: 1000, gold: 500 },
    vampire: { health: 10000, strength: 5000, exp: 1500, gold: 1000 },
    dragon: { health: 250000, strength: 15000, exp: 2000, gold: 2500 },
    uncle_donnie: {health: 1000000, strength: 100000, exp: 5000, gold: 10000}
};


  if (command === 'npc') {
      let npcList = 'List of enemies you can attack:\n';
      for (const enemy in enemies) {
        npcList += `**${enemy}** - Health: ${enemies[enemy].health}, Strength: ${enemies[enemy].strength}, EXP: ${enemies[enemy].exp}, Gold: ${enemies[enemy].gold}\n`;
      }
      message.channel.send(npcList)
            .catch(error => console.error('failed to send:', error));
      
    }

    if (command === 'attack') {
      const enemyType = args[0];
      const enemy = enemies[enemyType];
  
      if (!enemy) {
        return message.channel.send('Invalid enemy type.');
      }
  
      db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, player) => {
        if (err) {
          return console.error(err.message);
        }
        if (!player) {
          return message.channel.send('You are not registered. Use !register to sign up.');
        }
  
        let playerAttack = Math.max(0, player.strength);
        let enemyAttack = Math.max(0, enemy.strength);
  
        let playerHealth = player.health;
        let enemyHealth = enemy.health;
  
        let battleLog = `**Battle with a ${enemyType}!**\n\n`;
  
        while (playerHealth > 0 && enemyHealth > 0) {
          enemyHealth -= playerAttack;
          battleLog += `You attack the ${enemyType} for ${playerAttack} damage.\n`;
          if (enemyHealth <= 0) {
            battleLog += `The ${enemyType} has been defeated!\n`;
            break;
          }
  
          playerHealth -= enemyAttack;
          battleLog += `The ${enemyType} attacks you for ${enemyAttack} damage.\n`;
          if (playerHealth <= 0) {
            battleLog += `You have been defeated by the ${enemyType}.\n`;
            break;
          }
  
          battleLog += `\n`;
        }
  
        if (playerHealth <= 0) {
          db.run(`UPDATE users SET health = 0, death = death + 1 WHERE id = ?`, [message.author.id], (err) => {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(battleLog);
            resetToLevel1(message.author.id); 
          });
        } else if (enemyHealth <= 0) {
          const newExp = player.exp + enemy.exp;
          const newGold = player.gold + enemy.gold;
  
          db.run(`UPDATE users SET health = ?, exp = ?, gold = ? WHERE id = ?`, [playerHealth, player.exp + enemy.exp, newGold, message.author.id], (err) => {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(`${battleLog}\nYou defeated the ${enemyType} and earned ${enemy.exp} EXP and ${enemy.gold} gold! You have ${playerHealth} health remaining.`);
            handleLevelUp(message.author.id);
          });
        } else {
          db.run(`UPDATE users SET health = ? WHERE id = ?`, [playerHealth, message.author.id], (err) => {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(`${battleLog}\nYou attacked the ${enemyType} and have ${playerHealth} health remaining.`);
          });
        }
      });
    }

    

    if (command === 'challenge') {
      const challengedUser = message.mentions.users.first();
      if (!challengedUser) {
        return message.channel.send('Please mention a user to challenge.');
      }
  
      const challengerId = message.author.id;
      const challengedId = challengedUser.id;
  
  
      db.get(`SELECT * FROM users WHERE id = ?`, [challengedId], (err, row) => {
        if (err) return console.error(err.message);
        if (!row) return message.channel.send('The user you challenged is not registered.');
  
        message.channel.send(`<@${challengedId}>, you have been challenged to a PvP battle by <@${challengerId}>! Type \`!accept\` to accept the challenge or \`!decline\` to decline.`);
        

        client.challenges = client.challenges || {};
        client.challenges[challengedId] = { challengerId, challengedId };
      });
    }
  

    if (command === 'accept') {
      const challengedId = message.author.id;
      const challenge = client.challenges ? client.challenges[challengedId] : null;
  
      if (!challenge) {
        return message.channel.send('You have no pending challenges.');
      }
  
      const { challengerId } = challenge;
  

      db.get(`SELECT * FROM users WHERE id = ?`, [challengerId], (err, challenger) => {
        if (err) return console.error(err.message);
        db.get(`SELECT * FROM users WHERE id = ?`, [challengedId], (err, challenged) => {
          if (err) return console.error(err.message);

          let challengerHealth = challenger.health;
          let challengedHealth = challenged.health;
          const challengerAttack = challenger.strength;
          const challengedAttack = challenged.strength;
          let battleLog = `**PvP Battle between ${challenger.username} and ${challenged.username}!**\n\n`;
  
          while (challengerHealth > 0 && challengedHealth > 0) {
            challengedHealth -= challengerAttack;
            if (challengedHealth < 0) challengedHealth = 0;
  
            battleLog += `${challenger.username} attacks ${challenged.username}, dealing ${challengerAttack} damage. ${challenged.username} has ${challengedHealth} health left.\n`;
  
            if (challengedHealth <= 0) {
              battleLog += `${challenged.username} has been defeated!\n`;
              break;
            }
  
            challengerHealth -= challengedAttack;
            if (challengerHealth < 0) challengerHealth = 0;
  
            battleLog += `${challenged.username} attacks ${challenger.username}, dealing ${challengedAttack} damage. ${challenger.username} has ${challengerHealth} health left.\n`;
  
            if (challengerHealth <= 0) {
              battleLog += `${challenger.username} has been defeated!\n`;
              break;
            }
  
            battleLog += '\n';
          }
          
          if (challengerHealth <= 0) {
            db.run(`UPDATE users SET health = 0, death = death + 1 WHERE id = ?`, [challengerId], (err) => {
              if (err) return console.error(err.message);
              resetToLevel1(challengerId);
            });
          } else {
            db.run(`UPDATE users SET health = ? WHERE id = ?`, [challengerHealth, challengerId], (err) => {
              if (err) return console.error(err.message);
            });
          }
  
          if (challengedHealth <= 0) {
            db.run(`UPDATE users SET health = 0, death = death + 1 WHERE id = ?`, [challengedId], (err) => {
              if (err) return console.error(err.message);
              resetToLevel1(challengedId);
            });
          } else {
            db.run(`UPDATE users SET health = ? WHERE id = ?`, [challengedHealth, challengedId], (err) => {
              if (err) return console.error(err.message);
            });
          }
          message.channel.send(battleLog);
          delete client.challenges[challengedId];
        });
      });
    }



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
  
  if (command === 'hunt') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
  
      const huntRabbit = Math.random() < 0.25;
  
      if (huntRabbit) {
        db.run(`UPDATE users SET meat = meat + 1, exp = exp + 25 WHERE id = ?`, [message.author.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          message.channel.send('You hunt down a rabbit gaining 1 meat and 25 exp!');
          handleLevelUp(message.author.id);
        });
      } else {
        message.channel.send('You return with nothing');
      }
    });
  }

  if (command === 'sneak') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (!row) {
            return message.channel.send('You are not registered. Use !register to sign up');
        }

        db.run(`UPDATE users SET stealth = stealth +1 WHERE id = ?`, [message.author.id], function (err) {
            if (err) {
                return console.error(err.message);
            }

            message.channel.send('You sneak around');
            handleLevelUp(message.author.id)
        });
    });
}
  

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
            message.channel.send(`You sold all your stones (${stonesSold}) and got ${goldEarned} gold.`);
          });
        } else {
          message.channel.send('You don\'t have any stones to sell.');
        }
      });
    } else {
      message.channel.send('Invalid item to sell. Use !sell fish or !sell stone.');
    }
  }
  
//shop commands 
  const shopInventory = {
    make_sure_you_are_full_health_before_buying: {gold: 0, strength: 0, health: 0},
    wooden_sword: { gold: 100, strength: 10, health: 0 },
    wooden_bow: { gold: 150, strength: 12, health: 0 },
    leather_armor: { gold: 100, strength: 0, health: 10 },
    sword: { gold: 1000, strength: 50, health: 20 },
    bow: { gold: 500, strength: 25, health: 15 },
    steel_sword: { gold: 10000, strength: 150, health: 40 }, 
    crossbow: { gold: 900, strength: 150, health: 20 },
    chainmail_armor: { gold: 800, strength: 0, health: 60 },
    fire_spell: { gold: 10000, strength: 300, health: 100 },
    ice_spell: { gold: 10000, strength: 250, health: 150 },
    battle_axe: { gold: 15000, strength: 350, health: 50 },
    longbow: { gold: 20000, strength: 425, health: 100 },
    plate_armor: { gold: 15000, strength: 0, health: 250 },
    magic_staff: { gold: 25000, strength: 600, health: 200 },
    lightning_spell: { gold: 35000, strength: 800, health: 250 },
    bacardi: {gold: 100000, strength: 1000, health: -400}
};


  if (command === 'shop') {
  let shopList = 'List of items in shop:\n';
  for (const shop in shopInventory) {
      shopList += `**${shop}** - Gold: ${shopInventory[shop].gold}, Strength: ${shopInventory[shop].strength}, health ${shopInventory[shop].health}\n`;
  }
  message.channel.send(shopList)
      .catch(error => console.error('Failed to send message:', error));
}


  if (command === 'buy') {
    const itemName = args[0];
    const item = shopInventory[itemName];

    if (!item) {
      return message.channel.send('Invalid item name. Please check the shop and try again.');
    }

    db.get(`SELECT gold, strength, health FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      if (row.gold < item.gold) {
        return message.channel.send('You do not have enough gold to buy this item.');
      }

      const newGold = row.gold - item.gold;
      const newStrength = row.strength + item.strength;
      const newHealth = row.health + item.health; 

      db.run(`UPDATE users SET gold = ?, strength = ?, health = ? WHERE id = ?`, [newGold, newStrength, newHealth, message.author.id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        message.channel.send(`You bought a ${itemName}! Your new stats are:\nGold: ${newGold}\nStrength: ${newStrength}\nHealth: ${newHealth}`);
      });
    });
  }

   if (command === 'eatbread') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      if (row.bread > 0) {
        const newHealth = Math.min(row.health + 15, getDefaultHealthForLevel(row.level)); 
        db.run(`UPDATE users SET bread = bread - 1, health = ? WHERE id = ?`, [newHealth, message.author.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          message.channel.send(`You ate a piece of bread and restored 15 health. Your health is now ${newHealth}.`);
        });
      } else {
        message.channel.send('You have no bread to eat.');
      }
    });
  }

  if (command === 'eatmeat') {
    db.get(`SELECT * FROM users WHERE id = ?`, [message.author.id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        return message.channel.send('You are not registered. Use !register to sign up.');
      }
      if (row.meat > 0) {
        const newHealth = Math.min(row.health + 25, getDefaultHealthForLevel(row.level)); // Heal for 50 health
        db.run(`UPDATE users SET meat = meat - 1, health = ? WHERE id = ?`, [newHealth, message.author.id], function(err) {
          if (err) {
            return console.error(err.message);
          }
          message.channel.send(`You ate a piece of meat and restored 25 health. Your health is now ${newHealth}.`);
        });
      } else {
        message.channel.send('You have no meat to eat.');
      }
    });
  }
  

  if (command === 'fire') {
    // Retrieve the player's current level and health
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
  
      // Calculate the maximum health based on the player's level
      let maxHealth = 50 + (row.level - 1) * 50;
      if (row.health >= maxHealth) {
        return message.channel.send('You are already at full health.');
      }
  
      // Calculate the health gain from sitting by the fire
      let healthGain = 50;
  
      // Calculate the resulting health after healing
      let newHealth = Math.min(maxHealth, row.health + healthGain); // Ensure health doesn't exceed maxHealth
  
      // Update the player's health in the database
      db.run(`UPDATE users SET health = ?, wood = wood - 5 WHERE id = ?`, [newHealth, message.author.id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        message.channel.send(`you create a fire using 5 wood. You sit by the fire to relax.You gain ${healthGain} health. Your health is now ${newHealth}/${maxHealth}.`);
      });
    });
  }

  
});


client.login(process.env.GITHUB_SECRET);
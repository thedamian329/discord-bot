const { Client, Intents } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const secret = require("dotenv").config();
const chop = require("./commands/chop");
const register = require("./commands/register");
const profile = require("./commands/profile");
const mine = require("./commands/mine");
const rules = require("./commands/rules");
const harvest = require("./commands/harvest");
const bake = require("./commands/bake");
const fish = require("./commands/fish");
const hunt = require("./commands/hunt");
const sneak = require("./commands/sneak");
const fire = require("./commands/fire");
const pickpocket = require("./commands/pickpocket");
const shop = require("./commands/shop");
const eatbread = require("./commands/eatbread");
const eatmeat = require("./commands/eatmeat");
const sell = require("./commands/sell");
const gym = require("./commands/training");

// Connect to the SQLite database
let db = new sqlite3.Database("./rpg.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the RPG database.");
});

const rulesMessage = `
**Patch Notes - Version 2.1.1**
**ADDED DUNGEON. MUST BE LEVEL 5 TO ENTER. Enemies come in waves, you get 60 seconds to heal to full health or leave the dungeon if you are a pussy**
  fixed issue where your dungeon wins got reset on death. You also now get to keep the gold you had when you die. Added Training. !training brings up the list
  of training you can complete. !train [type] will train. You can now get a random gold drop from 1-100 gold while mining. 

       **Commands:**
- \`!register\`: register to become a player.
- \`!profile\`: View your stats and inventory.
- \`!chop\`: Chop trees to gain wood, experience, and strength.
- \`!mine\`: Mine stone to gain stone, experience, and strength.
- \`!fish\`: fish to sell and gain exp.
- \`!sell[fish][stone]\`: Sell your fish to earn gold.
- \`!hunt\`: Hunt for meat and gain experience.
- \`!sneak\`: Practice your stealth.
- \`!pickpocket [@player]\`: pickpocket a player.
- \`!fire\`: Sit by the fire to heal.
- \`!eatbread\`: eat bread.
- \`!eatmeat\`: eat meat.
- \`!npc\`: View a list of enemies you can fight.
- \`!attack [enemy]\`: Engage in battle with an enemy.
- \`challenge [@player]\`: Challenge a player to a battle. 
- \`!shop\`: View items available in the shop.
- \`!buy [item]\`: Purchase an item from the shop.
- \`!patch\`: see the current patch and patch notes.
- \`!training\: Bring up the training list.
- \`!train [type]\: Train
`;

//player inventory
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
  dungeon INT DEFAULT 0,
  exp INT DEFAULT 0
)`);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const prefix = "!";

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "chop":
      chop(message, command, db, handleLevelUp);
      break;
    case "register":
      register(message, command, db, handleLevelUp, client, rulesMessage);
      break;
    case "profile":
      profile(message, command, db, handleLevelUp);
      break;
    case "mine":
      mine(message, command, db, handleLevelUp);
      break;
    case "rules":
      rules(message, command, db, handleLevelUp, client, rulesMessage);
      break;
    case "harvest":
      harvest(message, command, db, handleLevelUp);
      break;
    case "bake":
      bake(message, command, db, handleLevelUp);
      break;
    case "fish":
      fish(message, command, db, handleLevelUp);
      break;
    case "hunt":
      hunt(message, command, db, handleLevelUp);
      break;
    case "sneak":
      sneak(message, command, db, handleLevelUp);
      break;
    case "fire":
      fire(message, command, db, handleLevelUp);
      break;
    case "pickpocket":
      pickpocket(message, command, db, handleLevelUp, client, args);
      break;
    case "shop":
      shop(message, command, db, handleLevelUp);
      break;
    case "eatbread":
      eatbread(message, command, db, handleLevelUp, getDefaultHealthForLevel);
      break;
    case "eatmeat":
      eatmeat(message, command, db, handleLevelUp, getDefaultHealthForLevel);
      break;
    case "sell":
      sell(message, command, db, handleLevelUp, client);
      break;
    case "training":
      gym(message, command, db, handleLevelUp);
      break;
  }

  function handleLevelUp(userId) {
    db.get(
      `SELECT level, exp, health, strength FROM users WHERE id = ?`,
      [userId],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }

        let requiredExp = getRequiredExp(row.level);
        if (row.exp >= requiredExp) {
          let newLevel = row.level + 1;

          // new way fpr getting default health
          let currentDefaultHealth = getDefaultHealthForLevel(row.level);
          let newDefaultHealth = getDefaultHealthForLevel(newLevel);

          //this should take in any bonus health you have over the default and add it to the new default
          let healthExcess = row.health - currentDefaultHealth;
          let newHealth = newDefaultHealth + Math.max(0, healthExcess);

          let newStrength = row.strength + 50;

          db.run(
            `UPDATE users SET level = ?, exp = exp - ?, health = ?, strength = ? WHERE id = ?`,
            [newLevel, requiredExp, newHealth, newStrength, userId],
            (err) => {
              if (err) {
                return console.error(err.message);
              }
              client.users.cache
                .get(userId)
                .send(
                  `You're now level ${newLevel}! Your health has increased to ${newHealth} and your strength is now ${newStrength}`
                );
            }
          );
        }
      }
    );
  }

  function getRequiredExp(level) {
    return 500 * level;
  }

  function getDefaultHealthForLevel(level) {
    return 50 * level;
  }

  function resetToLevel1(userId) {
    const defaultHealth = 50;
    const defaultStrength = 10;
    const defaultFish = 0;
    const defaultMeat = 0;
    const defaultStealth = 0;
    const defaultWood = 0;
    const defaultWheat = 0;
    const defaultBread = 0;
    const defaultStone = 0;

    db.run(
      `UPDATE users SET level = 1, exp = 0, health = ?, strength = ?, fish = ?, meat = ?, stealth = ?, wood = ?, wheat = ?, bread = ?, stone = ? WHERE id = ?`,
      [
        defaultHealth,
        defaultStrength,
        defaultFish,
        defaultMeat,
        defaultStealth,
        defaultWood,
        defaultWheat,
        defaultBread,
        defaultStone,
        userId,
      ],
      (err) => {
        if (err) {
          return console.error(err.message);
        }
        client.users.cache.get(userId).send(`You died. Time to start over`);
      }
    );
  }

  module.exports = { resetToLevel1 };

  const enemies = {
    slime: { health: 50, strength: 20, exp: 10, gold: 5 },
    wolf: { health: 100, strength: 50, exp: 25, gold: 10 },
    crab: { health: 200, strength: 30, exp: 20, gold: 8 },
    goblin: { health: 500, strength: 200, exp: 50, gold: 15 },
    spider: { health: 800, strength: 500, exp: 75, gold: 30 },
    zombie: { health: 2000, strength: 20, exp: 0, gold: 100 },
    orc: { health: 1500, strength: 800, exp: 150, gold: 50 },
    ogre: { health: 2000, strength: 1000, exp: 200, gold: 150 },
    troll: { health: 3500, strength: 800, exp: 350, gold: 200 },
    knight: { health: 5000, strength: 2000, exp: 1000, gold: 500 },
    vampire: { health: 10000, strength: 5000, exp: 1500, gold: 1000 },
    dragon: { health: 250000, strength: 15000, exp: 2000, gold: 2500 },
    uncle_donnie: { health: 1000000, strength: 100000, exp: 5000, gold: 10000 },
  };

  if (command === "npc") {
    let npcList = "List of enemies you can attack:\n";
    for (const enemy in enemies) {
      npcList += `**${enemy}** - Health: ${enemies[enemy].health}, Strength: ${enemies[enemy].strength}, EXP: ${enemies[enemy].exp}, Gold: ${enemies[enemy].gold}\n`;
    }
    message.channel
      .send(npcList)
      .catch((error) => console.error("failed to send:", error));
  }

  if (command === "attack") {
    const enemyType = args[0];
    const enemy = enemies[enemyType];

    if (!enemy) {
      return message.channel.send("Invalid enemy type.");
    }

    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, player) => {
        if (err) {
          return console.error(err.message);
        }
        if (!player) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
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
          db.run(
            `UPDATE users SET health = 0, death = death + 1 WHERE id = ?`,
            [message.author.id],
            (err) => {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(battleLog);
              resetToLevel1(message.author.id);
            }
          );
        } else if (enemyHealth <= 0) {
          const newExp = player.exp + enemy.exp;
          const newGold = player.gold + enemy.gold;

          db.run(
            `UPDATE users SET health = ?, exp = ?, gold = ? WHERE id = ?`,
            [playerHealth, player.exp + enemy.exp, newGold, message.author.id],
            (err) => {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(
                `${battleLog}\nYou defeated the ${enemyType} and earned ${enemy.exp} EXP and ${enemy.gold} gold! You have ${playerHealth} health remaining.`
              );
              handleLevelUp(message.author.id);
            }
          );
        } else {
          db.run(
            `UPDATE users SET health = ? WHERE id = ?`,
            [playerHealth, message.author.id],
            (err) => {
              if (err) {
                return console.error(err.message);
              }
              message.channel.send(
                `${battleLog}\nYou attacked the ${enemyType} and have ${playerHealth} health remaining.`
              );
            }
          );
        }
      }
    );
  }
  // test enemies for now
  const dungeonEnemies = {
    slime: { health: 1000, strength: 150, exp: 100, gold: 50 },
    wolf: { health: 1500, strength: 300, exp: 200, gold: 100 },
    goblin: { health: 1000, strength: 500, exp: 300, gold: 150 },
    orc: { health: 5000, strength: 300, exp: 500, gold: 300 },
    knight: { health: 7000, strength: 1000, exp: 1500, gold: 1000 },
    dragon: { health: 15000, strength: 1000, exp: 10000, gold: 10000 },
  };

  if (command === "dungeon") {
    const enemySequence = ["slime", "wolf", "goblin", "orc", "knight"];
    const bossChance = 0.2;

    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, player) => {
        if (err) return console.error(err.message);
        if (!player)
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );

        if (player.level < 5) {
          return message.channel.send(
            "You must be at least level 5 to enter the dungeon."
          );
        }
        if (player.health < 250) {
          return message.channel.send(
            "You must be at full health to enter the dungeon."
          );
        }

        let playerHealth = player.health;
        let totalGoldEarned = 0;
        let totalExpEarned = 0;
        let battleLog = `**YOU ENTERED A DUNGEON!**\n\n`;
        let survivedDungeon = true;
        let initialHealth = player.health; // Player's health when entering the dungeon

        const battleNextEnemy = (index) => {
          if (index >= enemySequence.length) {
            if (Math.random() < bossChance) {
              return handleBossFight();
            }
            return completeDungeon();
          }

          const enemyType = enemySequence[index];
          const enemy = dungeonEnemies[enemyType];
          let enemyHealth = enemy.health;

          battleLog += `**Encounter: ${enemyType.toUpperCase()}**\n`;

          while (playerHealth > 0 && enemyHealth > 0) {
            enemyHealth -= Math.max(0, player.strength);
            battleLog += `You attack the ${enemyType} for ${player.strength} damage.\n`;
            if (enemyHealth <= 0) {
              battleLog += `The ${enemyType} has been defeated!\n\n`;
              totalGoldEarned += enemy.gold;
              totalExpEarned += enemy.exp;
              break;
            }

            playerHealth -= Math.max(0, enemy.strength);
            battleLog += `The ${enemyType} attacks you for ${enemy.strength} damage.\n`;
            if (playerHealth <= 0) {
              battleLog += `You have been defeated by the ${enemyType}.\n`;
              survivedDungeon = false;
              return handlePlayerDefeat();
            }
          }

          message.channel.send(battleLog).then(() => {
            if (playerHealth > 0) {
              message.channel.send(
                "Do you want to heal, continue to the next enemy, or leave the dungeon? Type `!heal` to heal, `!continue` to move on, or `!leave` to exit."
              );

              const filter = (msg) =>
                msg.author.id === message.author.id &&
                ["!heal", "!continue", "!leave"].includes(msg.content);
              const collector = message.channel.createMessageCollector({
                filter,
                max: 1,
                time: 60000,
              });

              collector.on("collect", (msg) => {
                if (msg.content === "!heal") {
                  playerHealth = initialHealth;
                  message.channel.send(
                    `You healed back to your starting health! Your current health is now ${playerHealth}.`
                  );
                  battleNextEnemy(index + 1);
                } else if (msg.content === "!continue") {
                  battleNextEnemy(index + 1);
                } else if (msg.content === "!leave") {
                  message.channel.send(
                    "You have left the dungeon. Your progress is saved."
                  );
                  completeDungeon(true);
                }
              });

              collector.on("end", (collected) => {
                if (collected.size === 0) {
                  message.channel.send("Time's up! Moving to the next enemy.");
                  battleNextEnemy(index + 1);
                }
              });
            }
          });
        };

        const handleBossFight = () => {
          const boss = dungeonEnemies["dragon"];
          let bossHealth = boss.health;
          battleLog += `**Boss Fight: DRAGON!**\n\n`;

          while (playerHealth > 0 && bossHealth > 0) {
            bossHealth -= Math.max(0, player.strength);
            battleLog += `You attack the Dragon for ${player.strength} damage.\n`;
            if (bossHealth <= 0) {
              battleLog += `The Dragon has been defeated!\n\n`;
              totalGoldEarned += boss.gold;
              totalExpEarned += boss.exp;
              return completeDungeon();
            }

            playerHealth -= Math.max(0, boss.strength);
            battleLog += `The Dragon attacks you for ${boss.strength} damage.\n`;
            if (playerHealth <= 0) {
              battleLog += `You have been defeated by the Dragon.\n`;
              return handlePlayerDefeat();
            }
          }
        };

        const completeDungeon = (earlyExit = false) => {
          const finalLog = earlyExit
            ? `${battleLog}\nYou left the dungeon early. You earned ${totalExpEarned} EXP and ${totalGoldEarned} gold.`
            : `${battleLog}\nCongratulations! You cleared the dungeon and earned ${totalExpEarned} EXP and ${totalGoldEarned} gold! You have ${playerHealth} health remaining.`;

          // If player left early, don't update the dungeon count
          const dungeonUpdateQuery = earlyExit
            ? `UPDATE users SET health = ?, exp = ?, gold = ? WHERE id = ?`
            : `UPDATE users SET health = ?, exp = ?, gold = ?, dungeon = dungeon + 1 WHERE id = ?`;

          db.run(
            dungeonUpdateQuery,
            [
              playerHealth,
              player.exp + totalExpEarned,
              player.gold + totalGoldEarned,
              message.author.id,
            ],
            (err) => {
              if (err) return console.error(err.message);
              message.channel.send(finalLog);
              if (!earlyExit) handleLevelUp(message.author.id); // Only handle level up if they completed the dungeon
            }
          );
        };

        const handlePlayerDefeat = () => {
          db.run(
            `UPDATE users SET health = 0, death = death + 1 WHERE id = ?`,
            [message.author.id],
            (err) => {
              if (err) return console.error(err.message);
              message.channel.send(battleLog);
              resetToLevel1(message.author.id);
            }
          );
        };

        battleNextEnemy(0);
      }
    );
  }

  if (command === "challenge") {
    const challengedUser = message.mentions.users.first();
    if (!challengedUser) {
      return message.channel.send("Please mention a user to challenge.");
    }

    const challengerId = message.author.id;
    const challengedId = challengedUser.id;

    db.get(`SELECT * FROM users WHERE id = ?`, [challengedId], (err, row) => {
      if (err) return console.error(err.message);
      if (!row)
        return message.channel.send(
          "The user you challenged is not registered."
        );

      message.channel.send(
        `<@${challengedId}>, you have been challenged to a PvP battle by <@${challengerId}>! Type \`!accept\` to accept the challenge or \`!decline\` to decline.`
      );

      client.challenges = client.challenges || {};
      client.challenges[challengedId] = { challengerId, challengedId };
    });
  }

  if (command === "accept") {
    const challengedId = message.author.id;
    const challenge = client.challenges
      ? client.challenges[challengedId]
      : null;

    if (!challenge) {
      return message.channel.send("You have no pending challenges.");
    }

    const { challengerId } = challenge;

    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [challengerId],
      (err, challenger) => {
        if (err) return console.error(err.message);
        db.get(
          `SELECT * FROM users WHERE id = ?`,
          [challengedId],
          (err, challenged) => {
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

              battleLog += "\n";
            }

            if (challengerHealth <= 0) {
              db.run(
                `UPDATE users SET health = 0, death = death + 1 WHERE id = ?`,
                [challengerId],
                (err) => {
                  if (err) return console.error(err.message);
                  resetToLevel1(challengerId);
                }
              );
            } else {
              db.run(
                `UPDATE users SET health = ? WHERE id = ?`,
                [challengerHealth, challengerId],
                (err) => {
                  if (err) return console.error(err.message);
                }
              );
            }

            if (challengedHealth <= 0) {
              db.run(
                `UPDATE users SET health = 0, death = death + 1 WHERE id = ?`,
                [challengedId],
                (err) => {
                  if (err) return console.error(err.message);
                  resetToLevel1(challengedId);
                }
              );
            } else {
              db.run(
                `UPDATE users SET health = ? WHERE id = ?`,
                [challengedHealth, challengedId],
                (err) => {
                  if (err) return console.error(err.message);
                }
              );
            }
            message.channel.send(battleLog);
            delete client.challenges[challengedId];
          }
        );
      }
    );
  }

  //shop stuff
  const shopInventory = {
    make_sure_you_are_full_health_before_buying: {
      gold: 0,
      strength: 0,
      health: 0,
    },
    wooden_sword: { gold: 100, strength: 10, health: 0 },
    health_potion: { gold: 75, strength: 0, health: 110 },
    wooden_bow: { gold: 150, strength: 12, health: 0 },
    leather_armor: { gold: 100, strength: 0, health: 10 },
    sword: { gold: 1000, strength: 50, health: 50 },
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
    bacardi: { gold: 100000, strength: 1000, health: -400 },
    lagunitas: { gold: 1000, strength: 500, health: -10000 },
  };

  if (command === "buy") {
    const itemName = args[0];
    const item = shopInventory[itemName];

    if (!item) {
      return message.channel.send(
        "Invalid item name. Please check the shop and try again."
      );
    }

    db.get(
      `SELECT gold, strength, health FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }
        if (row.gold < item.gold) {
          return message.channel.send(
            "You do not have enough gold to buy this item."
          );
        }

        const newGold = row.gold - item.gold;
        const newStrength = row.strength + item.strength;
        const newHealth = row.health + item.health;

        db.run(
          `UPDATE users SET gold = ?, strength = ?, health = ? WHERE id = ?`,
          [newGold, newStrength, newHealth, message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(
              `You bought a ${itemName}! Your new stats are:\nGold: ${newGold}\nStrength: ${newStrength}\nHealth: ${newHealth}`
            );
          }
        );
      }
    );
  }

  const training = {
    novice: { gold: 1000, strength: 100, health: 0 },
    apprentice: { gold: 5000, strength: 250, health: 100 },
    master: { gold: 10000, strength: 500, health: 0 },
  };

  if (command === "train") {
    const trainingName = args[0];
    if (!trainingName) {
      return message.channel.send("Please specify a training name.");
    }

    const trainType = training[trainingName];

    if (!trainType) {
      return message.channel.send(
        "Invalid training name. Please check the training list and try again"
      );
    }

    db.get(
      `SELECT gold, strength, health FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }
        if (row.gold < trainType.gold) {
          return message.channel.send(
            "You do not have enough gold for this training."
          );
        }

        const newGold = row.gold - trainType.gold;
        const newStrength = row.strength + trainType.strength;
        const newHealth = row.health + trainType.health;

        db.run(
          `UPDATE users SET gold = ?, strength = ?, health = ? WHERE id = ?`,
          [newGold, newStrength, newHealth, message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }
            message.channel.send(
              `You completed ${trainingName} training! Your new stats are: \nGold: ${newGold}\nStrength: ${newStrength}\nHealth: ${newHealth}`
            );
          }
        );
      }
    );
  }
});

client.login(process.env.GITHUB_SECRET);

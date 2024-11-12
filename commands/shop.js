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

function shop(message, command, db, handleLevelUp) {
  if (command === "shop") {
    let shopList = "List of items in shop:\n";
    for (const shop in shopInventory) {
      shopList += `**${shop}** - Gold: ${shopInventory[shop].gold}, Strength: ${shopInventory[shop].strength}, health ${shopInventory[shop].health}\n`;
    }
    message.channel
      .send(shopList)
      .catch((error) => console.error("Failed to send message:", error));
  }
}

module.exports = shop;

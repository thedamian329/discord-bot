const trainingGym = {
  novice: { gold: 500, strength: 100, health: 0 },
  apprentice: { gold: 1000, strength: 500, health: 250 },
  master: { gold: 2500, strength: 1000, health: 500 },
};

function gym(message, command, db, handleLevelUp) {
  if (command === "training") {
    let trainingType = "List of training:\n";
    for (const trainingName in trainingGym) {
      trainingType += `**${trainingName}** - Gold: ${trainingGym[trainingName].gold}, Strength: ${trainingGym[trainingName].strength}, Health: ${trainingGym[trainingName].health}\n`;
    }
    message.channel
      .send(trainingType)
      .catch((error) => console.error("Failed to send message:", error));
  }
}

module.exports = gym;

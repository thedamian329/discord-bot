const trainingGym = {
  novice: { gold: 1000, strength: 100, health: 0 },
  apprentice: { gold: 5000, strength: 250, health: 100 },
  master: { gold: 10000, strength: 500, health: 0 },
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

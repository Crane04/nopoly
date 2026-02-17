import { GameState, Player, Card } from "./types";

// Helper function to move player
const movePlayer = (player: Player, newPosition: number, game: GameState) => {
  const oldPosition = player.position;
  player.position = newPosition;

  // Check if passed Go
  if (player.position < oldPosition && newPosition !== 30) {
    // Not if going to jail
    player.money += 200;
  }
};

// Helper to find nearest railroad
const findNearestRailroad = (currentPosition: number): number => {
  const railroads = [5, 15, 25, 35]; // Kings Cross, Marylebone, Fenchurch, Liverpool
  for (let i = 0; i < railroads.length; i++) {
    if (railroads[i] > currentPosition) return railroads[i];
  }
  return railroads[0]; // Wrap around to first
};

// Helper to find nearest utility
const findNearestUtility = (currentPosition: number): number => {
  const utilities = [12, 28]; // Electric Company, Water Works
  for (let i = 0; i < utilities.length; i++) {
    if (utilities[i] > currentPosition) return utilities[i];
  }
  return utilities[0]; // Wrap around to first
};

// CHANCE CARDS
export const CHANCE_CARDS: Card[] = [
  {
    id: 0,
    type: "chance",
    description: "Advance to Go (Collect $200)",
    action: (game: GameState, player: Player) => {
      player.position = 0;
      player.money += 200;
    },
  },
  {
    id: 1,
    type: "chance",
    description: "Advance to Trafalgar Square",
    action: (game: GameState, player: Player) => {
      movePlayer(player, 24, game); // Trafalgar Square is position 24
    },
  },
  {
    id: 2,
    type: "chance",
    description: "Advance to Pall Mall",
    action: (game: GameState, player: Player) => {
      movePlayer(player, 11, game); // Pall Mall is position 11
    },
  },
  {
    id: 3,
    type: "chance",
    description: "Advance to nearest Utility",
    action: (game: GameState, player: Player) => {
      const nearestUtil = findNearestUtility(player.position);
      movePlayer(player, nearestUtil, game);

      const property = game.properties[nearestUtil];
      if (property.owner && property.owner !== player.id) {
        // If owned, pay 10x dice roll - we'll handle this when they land
        game.dice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        const rent = (game.dice[0] + game.dice[1]) * 10;
        player.money -= rent;
        const owner = game.players.find((p) => p.id === property.owner);
        if (owner) owner.money += rent;
      }
    },
  },
  {
    id: 4,
    type: "chance",
    description: "Advance to nearest Railroad",
    action: (game: GameState, player: Player) => {
      const nearestRail = findNearestRailroad(player.position);
      movePlayer(player, nearestRail, game);

      const property = game.properties[nearestRail];
      if (property.owner && property.owner !== player.id) {
        // Pay double rent
        const rent = property.rent * 2;
        player.money -= rent;
        const owner = game.players.find((p) => p.id === property.owner);
        if (owner) owner.money += rent;
      }
    },
  },
  {
    id: 5,
    type: "chance",
    description: "Bank pays you dividend of $50",
    action: (game: GameState, player: Player) => {
      player.money += 50;
    },
  },
  {
    id: 6,
    type: "chance",
    description: "Get Out of Jail Free",
    action: (game: GameState, player: Player) => {
      // We'll track this in player object - need to add property
      player.getOutOfJailCards = (player.getOutOfJailCards || 0) + 1;
    },
  },
  {
    id: 7,
    type: "chance",
    description: "Go Back 3 Spaces",
    action: (game: GameState, player: Player) => {
      player.position = (player.position - 3 + 40) % 40;
    },
  },
  {
    id: 8,
    type: "chance",
    description: "Go to Jail - Go directly to Jail",
    action: (game: GameState, player: Player) => {
      player.inJail = true;
      player.position = 10; // Jail position
    },
  },
  {
    id: 9,
    type: "chance",
    description: "Make general repairs on all your property",
    action: (game: GameState, player: Player) => {
      let total = 0;
      player.properties.forEach((propId) => {
        const prop = game.properties[propId];
        if (prop.houses > 0) {
          total += prop.houses * 25;
        }
      });
      player.money -= total;
    },
  },
  {
    id: 10,
    type: "chance",
    description: "Pay poor tax of $15",
    action: (game: GameState, player: Player) => {
      player.money -= 15;
    },
  },
  {
    id: 11,
    type: "chance",
    description: "Take a trip to Kings Cross Station",
    action: (game: GameState, player: Player) => {
      movePlayer(player, 5, game); // Kings Cross is position 5
    },
  },
  {
    id: 12,
    type: "chance",
    description: "Advance to Mayfair",
    action: (game: GameState, player: Player) => {
      movePlayer(player, 39, game); // Mayfair is position 39
    },
  },
  {
    id: 13,
    type: "chance",
    description: "You have been elected Chairman of the Board",
    action: (game: GameState, player: Player) => {
      const payAmount = 50;
      game.players.forEach((p) => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.money += payAmount;
          player.money -= payAmount;
        }
      });
    },
  },
  {
    id: 14,
    type: "chance",
    description: "Your building loan matures - Collect $150",
    action: (game: GameState, player: Player) => {
      player.money += 150;
    },
  },
  {
    id: 15,
    type: "chance",
    description: "You have won a crossword competition - Collect $100",
    action: (game: GameState, player: Player) => {
      player.money += 100;
    },
  },
];

// COMMUNITY CHEST CARDS
export const COMMUNITY_CHEST_CARDS: Card[] = [
  {
    id: 0,
    type: "community-chest",
    description: "Advance to Go (Collect $200)",
    action: (game: GameState, player: Player) => {
      player.position = 0;
      player.money += 200;
    },
  },
  {
    id: 1,
    type: "community-chest",
    description: "Bank error in your favor - Collect $200",
    action: (game: GameState, player: Player) => {
      player.money += 200;
    },
  },
  {
    id: 2,
    type: "community-chest",
    description: "Doctor's fees - Pay $50",
    action: (game: GameState, player: Player) => {
      player.money -= 50;
    },
  },
  {
    id: 3,
    type: "community-chest",
    description: "From sale of stock you get $50",
    action: (game: GameState, player: Player) => {
      player.money += 50;
    },
  },
  {
    id: 4,
    type: "community-chest",
    description: "Get Out of Jail Free",
    action: (game: GameState, player: Player) => {
      player.getOutOfJailCards = (player.getOutOfJailCards || 0) + 1;
    },
  },
  {
    id: 5,
    type: "community-chest",
    description: "Go to Jail - Go directly to Jail",
    action: (game: GameState, player: Player) => {
      player.inJail = true;
      player.position = 10;
    },
  },
  {
    id: 6,
    type: "community-chest",
    description: "Grand Opera Night - Collect $50 from every player",
    action: (game: GameState, player: Player) => {
      const collectAmount = 50;
      game.players.forEach((p) => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.money -= collectAmount;
          player.money += collectAmount;
        }
      });
    },
  },
  {
    id: 7,
    type: "community-chest",
    description: "Holiday Fund matures - Receive $100",
    action: (game: GameState, player: Player) => {
      player.money += 100;
    },
  },
  {
    id: 8,
    type: "community-chest",
    description: "Income tax refund - Collect $20",
    action: (game: GameState, player: Player) => {
      player.money += 20;
    },
  },
  {
    id: 9,
    type: "community-chest",
    description: "It's your birthday - Collect $10 from each player",
    action: (game: GameState, player: Player) => {
      const collectAmount = 10;
      game.players.forEach((p) => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.money -= collectAmount;
          player.money += collectAmount;
        }
      });
    },
  },
  {
    id: 10,
    type: "community-chest",
    description: "Life insurance matures - Collect $100",
    action: (game: GameState, player: Player) => {
      player.money += 100;
    },
  },
  {
    id: 11,
    type: "community-chest",
    description: "Hospital fees - Pay $50",
    action: (game: GameState, player: Player) => {
      player.money -= 50;
    },
  },
  {
    id: 12,
    type: "community-chest",
    description: "School fees - Pay $50",
    action: (game: GameState, player: Player) => {
      player.money -= 50;
    },
  },
  {
    id: 13,
    type: "community-chest",
    description: "Receive $25 consultancy fee",
    action: (game: GameState, player: Player) => {
      player.money += 25;
    },
  },
  {
    id: 14,
    type: "community-chest",
    description: "You are assessed for street repairs",
    action: (game: GameState, player: Player) => {
      let total = 0;
      player.properties.forEach((propId) => {
        const prop = game.properties[propId];
        if (prop.houses > 0) {
          total += prop.houses * 40;
        }
      });
      player.money -= total;
    },
  },
  {
    id: 15,
    type: "community-chest",
    description: "You have won second prize in a beauty contest - Collect $10",
    action: (game: GameState, player: Player) => {
      player.money += 10;
    },
  },
  {
    id: 16,
    type: "community-chest",
    description: "You inherit $100",
    action: (game: GameState, player: Player) => {
      player.money += 100;
    },
  },
];

// Shuffle function for decks
export const shuffleDeck = (cards: Card[]): Card[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

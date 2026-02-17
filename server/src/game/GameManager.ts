import { Player, GameState, Property, GameAction } from "./types";
import { BOARD_PROPERTIES, TOKENS } from "./board";

export class GameManager {
  private games: Map<string, GameState> = new Map();

  createGame(gameId: string): GameState {
    const gameState: GameState = {
      gameId,
      players: [],
      currentPlayer: 0,
      properties: JSON.parse(JSON.stringify(BOARD_PROPERTIES)),
      dice: null,
      status: "waiting",
      winner: null,
    };
    this.games.set(gameId, gameState);
    return gameState;
  }

  joinGame(
    gameId: string,
    playerId: string,
    playerName: string,
  ): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length >= 4 || game.status !== "waiting")
      return null;

    const player: Player = {
      id: playerId,
      name: playerName,
      money: 1500,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      token: TOKENS[game.players.length % TOKENS.length],
      isBankrupt: false,
    };

    game.players.push(player);

    if (game.players.length === 2) {
      game.status = "playing";
    }

    return game;
  }

  processAction(gameId: string, action: GameAction): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.status !== "playing") return null;

    const player = game.players.find((p) => p.id === action.playerId);
    if (!player || player.isBankrupt) return null;

    switch (action.type) {
      case "ROLL_DICE":
        return this.handleRollDice(game, player);
      case "BUY_PROPERTY":
        return this.handleBuyProperty(game, player);
      case "END_TURN":
        return this.handleEndTurn(game);
      default:
        return game;
    }
  }

  private handleRollDice(game: GameState, player: Player): GameState {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    game.dice = [dice1, dice2];

    if (player.inJail) {
      if (dice1 === dice2) {
        player.inJail = false;
        player.jailTurns = 0;
        this.movePlayer(player, dice1 + dice2);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= 3) {
          player.inJail = false;
          player.jailTurns = 0;
          player.money -= 50;
        }
      }
    } else {
      this.movePlayer(player, dice1 + dice2);

      this.handleSpecialSpace(game, player);
    }

    return game;
  }

  private movePlayer(player: Player, steps: number): void {
    const oldPosition = player.position;
    player.position = (player.position + steps) % 40;

    // Passed GO
    if (player.position < oldPosition) {
      player.money += 200;
      console.log(`${player.name} passed GO and collected $200`);
    }

    console.log(
      `${player.name} moved from ${oldPosition} to ${player.position}`,
    );

    // Ensure position is valid (0-39)
    if (player.position < 0 || player.position >= 40) {
      console.error(`Invalid position detected: ${player.position}, fixing...`);
      player.position = ((player.position % 40) + 40) % 40;
    }
  }

  private handleBuyProperty(game: GameState, player: Player): GameState {
    // Safety check - ensure position is valid
    if (player.position < 0 || player.position >= game.properties.length) {
      console.error(`Invalid player position: ${player.position}`);
      return game;
    }

    const property = game.properties[player.position];

    // Check if property exists and can be bought
    if (!property) {
      console.error(`No property found at position ${player.position}`);
      return game;
    }

    // Check if property is purchasable (price > 0), no owner, and player has enough money
    if (
      property.price > 0 &&
      !property.owner &&
      player.money >= property.price
    ) {
      property.owner = player.id;
      player.properties.push(property.id);
      player.money -= property.price;
      console.log(
        `${player.name} bought ${property.name} for $${property.price}`,
      );

      // Auto end turn after buying
      return this.handleEndTurn(game);
    } else {
      // Log why purchase failed
      if (property.price <= 0) console.log(`${property.name} is not for sale`);
      if (property.owner)
        console.log(`${property.name} already owned by ${property.owner}`);
      if (player.money < property.price)
        console.log(`${player.name} doesn't have enough money`);
    }

    return game;
  }

  private handleEndTurn(game: GameState): GameState {
    let nextPlayer = (game.currentPlayer + 1) % game.players.length;

    // Skip bankrupt players
    while (
      game.players[nextPlayer].isBankrupt &&
      nextPlayer !== game.currentPlayer
    ) {
      nextPlayer = (nextPlayer + 1) % game.players.length;
    }

    game.currentPlayer = nextPlayer;
    game.dice = null;

    // Check for winner
    const activePlayers = game.players.filter((p) => !p.isBankrupt);
    if (activePlayers.length === 1) {
      game.status = "finished";
      game.winner = activePlayers[0].id;
    }

    return game;
  }

  private handleSpecialSpace(game: GameState, player: Player): void {
    const space = game.properties[player.position];

    switch (space.name) {
      case "Income Tax":
        player.money -= 200;
        console.log(`${player.name} paid Income Tax of $200`);
        break;
      case "Luxury Tax":
        player.money -= 100;
        console.log(`${player.name} paid Luxury Tax of $100`);
        break;
      case "Go To Jail":
        player.inJail = true;
        player.position = 10; // Move to Jail
        console.log(`${player.name} is going to jail!`);
        break;
      case "Community Chest":
      case "Chance":
        // For now, just log - we can add cards later
        console.log(`${player.name} landed on ${space.name}`);
        break;
    }
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }
}

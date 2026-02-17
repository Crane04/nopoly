export interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  token: string;
  isBankrupt: boolean;
}

export interface Property {
  id: number;
  name: string;
  price: number;
  rent: number;
  color: string;
  owner: string | null;
  houses: number;
  mortgage: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayer: number;
  properties: Property[];
  dice: [number, number] | null;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  
}

export interface GameAction {
  type: "ROLL_DICE" | "BUY_PROPERTY" | "END_TURN" | "AUCTION" | "MORTGAGE";
  playerId: string;
  data?: any;
}

export interface Card {
  id: number;
  type: "chance" | "community-chest";
  description: string;
  action: (game: GameState, player: Player) => void;
}

export interface CardDeck {
  chance: Card[];
  communityChest: Card[];
}

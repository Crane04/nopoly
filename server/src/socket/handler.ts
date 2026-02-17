import { Server, Socket } from "socket.io";
import { GameManager } from "../game/GameManager";
import { GameAction } from "../game/types";

const gameManager = new GameManager();

export function setupSocketHandlers(io: Server, socket: Socket) {
  socket.on("create-game", ({ playerName }: { playerName: string }) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game = gameManager.createGame(gameId);

    // Automatically join the creator to the game
    const gameState = gameManager.joinGame(gameId, socket.id, playerName);

    if (gameState) {
      socket.join(gameId);
      socket.emit("game-created", { gameId, gameState, playerId: socket.id });
      console.log(`Game ${gameId} created by ${playerName}`);
    } else {
      socket.emit("error", "Failed to create game");
    }
  });
  socket.on(
    "join-game",
    ({ gameId, playerName }: { gameId: string; playerName: string }) => {
      const gameState = gameManager.joinGame(gameId, socket.id, playerName);

      if (gameState) {
        socket.join(gameId);
        socket.emit("game-joined", { gameState, playerId: socket.id });
        socket.to(gameId).emit("player-joined", gameState);

        if (gameState.status === "playing") {
          io.to(gameId).emit("game-started", gameState);
        }
      } else {
        socket.emit("error", "Failed to join game");
      }
    },
  );

  socket.on(
    "game-action",
    ({ gameId, action }: { gameId: string; action: GameAction }) => {
      const gameState = gameManager.processAction(gameId, action);
      if (gameState) {
        io.to(gameId).emit("game-updated", gameState);
      }
    },
  );

  socket.on("leave-game", ({ gameId }: { gameId: string }) => {
    socket.leave(gameId);
    // Handle player removal logic here
  });
}

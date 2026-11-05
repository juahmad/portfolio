import { describe, expect, it } from "vitest";
import {
  type GameState,
  type Wall,
  applyAction,
  canPlaceWall,
  createGame,
  isLegal,
  legalMoves,
  shortestPathLength,
  toWallSet,
} from "./engine";
import { chooseBotAction } from "./bot";

const sorted = (ps: { r: number; c: number }[]) =>
  [...ps].sort((a, b) => a.r - b.r || a.c - b.c);

const withState = (patch: Partial<GameState>): GameState => ({ ...createGame(), ...patch });
const wall = (o: "h" | "v", r: number, c: number): Wall => ({ o, r, c, owner: "you" });

describe("createGame", () => {
  it("starts with pawns on opposite sides and 10 walls each", () => {
    const g = createGame();
    expect(g.pawns).toEqual({ you: { r: 8, c: 4 }, bot: { r: 0, c: 4 } });
    expect(g.wallsLeft).toEqual({ you: 10, bot: 10 });
    expect(g.turn).toBe("you");
    expect(g.winner).toBeNull();
  });
});

describe("legalMoves", () => {
  it("allows the three open neighbours from the starting square", () => {
    expect(sorted(legalMoves(createGame(), "you"))).toEqual([
      { r: 7, c: 4 },
      { r: 8, c: 3 },
      { r: 8, c: 5 },
    ]);
  });

  it("jumps straight over a facing opponent", () => {
    const g = withState({ pawns: { you: { r: 5, c: 4 }, bot: { r: 4, c: 4 } } });
    expect(legalMoves(g, "you")).toContainEqual({ r: 3, c: 4 });
    expect(legalMoves(g, "you")).not.toContainEqual({ r: 4, c: 4 });
  });

  it("steps diagonally when a wall stands behind the opponent", () => {
    const g = withState({
      pawns: { you: { r: 5, c: 4 }, bot: { r: 4, c: 4 } },
      walls: [wall("h", 3, 4)], // blocks (4,4) ↔ (3,4)
    });
    const moves = legalMoves(g, "you");
    expect(moves).toContainEqual({ r: 4, c: 3 });
    expect(moves).toContainEqual({ r: 4, c: 5 });
    expect(moves).not.toContainEqual({ r: 3, c: 4 });
  });

  it("respects walls", () => {
    const g = withState({ walls: [wall("h", 7, 4)] }); // wall above (8,4)
    expect(legalMoves(g, "you")).not.toContainEqual({ r: 7, c: 4 });
  });
});

describe("canPlaceWall", () => {
  it("rejects walls off the board", () => {
    expect(canPlaceWall(createGame(), 8, 0, "h")).toBe(false);
    expect(canPlaceWall(createGame(), 0, -1, "v")).toBe(false);
  });

  it("rejects overlapping and crossing walls", () => {
    const g = withState({ walls: [wall("h", 4, 4)] });
    expect(canPlaceWall(g, 4, 4, "h")).toBe(false); // same spot
    expect(canPlaceWall(g, 4, 5, "h")).toBe(false); // overlaps half
    expect(canPlaceWall(g, 4, 4, "v")).toBe(false); // crosses
    expect(canPlaceWall(g, 4, 6, "h")).toBe(true); // touches end to end
  });

  it("never lets a wall seal a player off from their goal", () => {
    // Fence between rows 6 and 7 across columns 1–8, leaving a gap at column 0.
    const fence = [wall("h", 6, 1), wall("h", 6, 3), wall("h", 6, 5), wall("h", 6, 7)];
    const g = withState({ walls: fence });
    expect(shortestPathLength(toWallSet(fence), g.pawns.you, 0)).toBeLessThan(Infinity);
    // A vertical wall beside the gap would cut "you" off from column 0, so it's refused.
    expect(canPlaceWall(g, 7, 0, "v")).toBe(false);
    // The same wall elsewhere is fine.
    expect(canPlaceWall(g, 2, 0, "v")).toBe(true);
  });
});

describe("applyAction", () => {
  it("moves, passes the turn and detects a win", () => {
    let g = withState({ pawns: { you: { r: 1, c: 0 }, bot: { r: 0, c: 4 } } });
    g = applyAction(g, "you", { type: "move", to: { r: 0, c: 0 } });
    expect(g.winner).toBe("you");
  });

  it("places a wall and spends it", () => {
    const g = applyAction(createGame(), "you", { type: "wall", r: 3, c: 3, o: "v" });
    expect(g.walls).toHaveLength(1);
    expect(g.wallsLeft.you).toBe(9);
    expect(g.turn).toBe("bot");
  });

  it("throws on illegal actions", () => {
    expect(() => applyAction(createGame(), "bot", { type: "move", to: { r: 1, c: 4 } })).toThrow();
    expect(() => applyAction(createGame(), "you", { type: "move", to: { r: 5, c: 5 } })).toThrow();
  });
});

describe("chooseBotAction", () => {
  it("always returns a legal action over a full game", () => {
    let g = createGame();
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let turn = 0; turn < 200 && !g.winner; turn++) {
      const player = g.turn;
      const action =
        player === "bot"
          ? chooseBotAction(g, rng)
          : { type: "move" as const, to: legalMoves(g, "you")[Math.floor(rng() * legalMoves(g, "you").length)] };
      expect(isLegal(g, player, action)).toBe(true);
      g = applyAction(g, player, action);
    }
    expect(g.winner).not.toBeNull();
  });

  it("walks straight to its goal on an empty board when it's ahead", () => {
    const g = withState({ turn: "bot", pawns: { you: { r: 8, c: 0 }, bot: { r: 7, c: 4 } } });
    expect(chooseBotAction(g)).toEqual({ type: "move", to: { r: 8, c: 4 } });
  });
});

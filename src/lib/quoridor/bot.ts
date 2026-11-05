/**
 * A simple heuristic Quoridor bot.
 *
 * It's a stand-in until the self-play model is trained:
 *   1. If the human is about as close to winning as the bot (or closer), try every
 *      legal wall and keep the one that most increases (human path − bot path).
 *   2. Place it if it gains enough; otherwise step along the bot's shortest path.
 */
import {
  type Action,
  type GameState,
  GOAL_ROW,
  SIZE,
  canPlaceWall,
  legalMoves,
  shortestPathLength,
  toWallSet,
  wallKey,
  type Orientation,
} from "./engine";

export type Rng = () => number;

export function chooseBotAction(state: GameState, rng: Rng = Math.random): Action {
  const walls = toWallSet(state.walls);
  const botPath = shortestPathLength(walls, state.pawns.bot, GOAL_ROW.bot);
  const youPath = shortestPathLength(walls, state.pawns.you, GOAL_ROW.you);

  if (state.wallsLeft.bot > 0 && youPath <= botPath + 1) {
    let best: { r: number; c: number; o: Orientation; gain: number } | null = null;
    for (let r = 0; r < SIZE - 1; r++) {
      for (let c = 0; c < SIZE - 1; c++) {
        for (const o of ["h", "v"] as const) {
          if (!canPlaceWall(state, r, c, o)) continue;
          const trial = new Set(walls).add(wallKey(o, r, c));
          const gain =
            shortestPathLength(trial, state.pawns.you, GOAL_ROW.you) -
            youPath -
            (shortestPathLength(trial, state.pawns.bot, GOAL_ROW.bot) - botPath);
          if (!best || gain > best.gain || (gain === best.gain && rng() < 0.25)) best = { r, c, o, gain };
        }
      }
    }
    const threshold = youPath < botPath ? 1 : 2;
    if (best && best.gain >= threshold) return { type: "wall", r: best.r, c: best.c, o: best.o };
  }

  let bestMove = legalMoves(state, "bot")[0];
  let bestDist = Infinity;
  for (const m of legalMoves(state, "bot")) {
    if (m.r === GOAL_ROW.bot) return { type: "move", to: m };
    const d = shortestPathLength(walls, m, GOAL_ROW.bot);
    if (d < bestDist || (d === bestDist && rng() < 0.5)) {
      bestDist = d;
      bestMove = m;
    }
  }
  return { type: "move", to: bestMove };
}

/**
 * Quoridor rules engine.
 *
 * Pure and immutable: every function takes a state and returns a new one,
 * so the UI, the bot and the tests all share exactly the same rules.
 *
 * Coordinates: rows 0–8 top to bottom, columns 0–8 left to right.
 * A wall is anchored at the top-left cell of the 2×2 block it splits:
 *   - "h" runs along the bottom edge of (r, c) and (r, c + 1)
 *   - "v" runs along the right edge of (r, c) and (r + 1, c)
 * so valid anchors are 0–7 in both directions.
 */

export const SIZE = 9;
export const WALLS_PER_PLAYER = 10;

export type Player = "you" | "bot";
export type Orientation = "h" | "v";

export interface Pos {
  r: number;
  c: number;
}

export interface Wall {
  r: number;
  c: number;
  o: Orientation;
  owner: Player;
}

export interface GameState {
  pawns: Record<Player, Pos>;
  walls: readonly Wall[];
  wallsLeft: Record<Player, number>;
  turn: Player;
  winner: Player | null;
}

export type Action =
  | { type: "move"; to: Pos }
  | { type: "wall"; r: number; c: number; o: Orientation };

export const GOAL_ROW: Record<Player, number> = { you: 0, bot: SIZE - 1 };

const DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const other = (p: Player): Player => (p === "you" ? "bot" : "you");

export const samePos = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c;

export const wallKey = (o: Orientation, r: number, c: number) => `${o}${r},${c}`;

export type WallSet = ReadonlySet<string>;

export const toWallSet = (walls: readonly Wall[]): WallSet =>
  new Set(walls.map((w) => wallKey(w.o, w.r, w.c)));

export function createGame(): GameState {
  return {
    pawns: { you: { r: SIZE - 1, c: 4 }, bot: { r: 0, c: 4 } },
    walls: [],
    wallsLeft: { you: WALLS_PER_PLAYER, bot: WALLS_PER_PLAYER },
    turn: "you",
    winner: null,
  };
}

const inBounds = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

/** True when a step from (r, c) in direction (dr, dc) leaves the board or hits a wall. */
export function isBlocked(walls: WallSet, r: number, c: number, dr: number, dc: number): boolean {
  if (!inBounds(r + dr, c + dc)) return true;
  const h = (a: number, b: number) => walls.has(wallKey("h", a, b));
  const v = (a: number, b: number) => walls.has(wallKey("v", a, b));
  if (dr === 1) return h(r, c) || h(r, c - 1);
  if (dr === -1) return h(r - 1, c) || h(r - 1, c - 1);
  if (dc === 1) return v(r, c) || v(r - 1, c);
  return v(r, c - 1) || v(r - 1, c - 1);
}

/** Every square `player` may move to this turn, including straight and diagonal jumps. */
export function legalMoves(state: GameState, player: Player): Pos[] {
  const walls = toWallSet(state.walls);
  const me = state.pawns[player];
  const opp = state.pawns[other(player)];
  const out: Pos[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    if (isBlocked(walls, me.r, me.c, dr, dc)) continue;
    const next = { r: me.r + dr, c: me.c + dc };
    if (!samePos(next, opp)) {
      out.push(next);
      continue;
    }
    // Face to face: jump straight over if nothing is behind the opponent…
    if (!isBlocked(walls, opp.r, opp.c, dr, dc)) {
      out.push({ r: opp.r + dr, c: opp.c + dc });
      continue;
    }
    // …otherwise step diagonally around them.
    const sideways = dr !== 0 ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
    for (const [sr, sc] of sideways) {
      if (!isBlocked(walls, opp.r, opp.c, sr, sc)) out.push({ r: opp.r + sr, c: opp.c + sc });
    }
  }
  return out;
}

/** Fewest steps from `from` to any square on `goalRow`, ignoring pawns. Infinity if sealed off. */
export function shortestPathLength(walls: WallSet, from: Pos, goalRow: number): number {
  const seen = new Int16Array(SIZE * SIZE).fill(-1);
  const start = from.r * SIZE + from.c;
  const queue = [start];
  seen[start] = 0;
  for (let i = 0; i < queue.length; i++) {
    const k = queue[i];
    const r = Math.floor(k / SIZE);
    const c = k % SIZE;
    if (r === goalRow) return seen[k];
    for (const [dr, dc] of DIRECTIONS) {
      if (isBlocked(walls, r, c, dr, dc)) continue;
      const nk = (r + dr) * SIZE + (c + dc);
      if (seen[nk] < 0) {
        seen[nk] = seen[k] + 1;
        queue.push(nk);
      }
    }
  }
  return Infinity;
}

/** Wall placement rules: on the board, no overlap, no crossing, and nobody fully blocked. */
export function canPlaceWall(state: GameState, r: number, c: number, o: Orientation): boolean {
  if (r < 0 || r > SIZE - 2 || c < 0 || c > SIZE - 2) return false;
  const walls = new Set(toWallSet(state.walls));
  if (walls.has(wallKey(o, r, c))) return false;
  if (o === "h" && (walls.has(wallKey("h", r, c - 1)) || walls.has(wallKey("h", r, c + 1)) || walls.has(wallKey("v", r, c)))) return false;
  if (o === "v" && (walls.has(wallKey("v", r - 1, c)) || walls.has(wallKey("v", r + 1, c)) || walls.has(wallKey("h", r, c)))) return false;

  walls.add(wallKey(o, r, c));
  return (
    shortestPathLength(walls, state.pawns.you, GOAL_ROW.you) < Infinity &&
    shortestPathLength(walls, state.pawns.bot, GOAL_ROW.bot) < Infinity
  );
}

export function isLegal(state: GameState, player: Player, action: Action): boolean {
  if (state.winner || state.turn !== player) return false;
  if (action.type === "move") return legalMoves(state, player).some((m) => samePos(m, action.to));
  return state.wallsLeft[player] > 0 && canPlaceWall(state, action.r, action.c, action.o);
}

/** Applies a legal action and passes the turn. Throws on an illegal one. */
export function applyAction(state: GameState, player: Player, action: Action): GameState {
  if (!isLegal(state, player, action)) throw new Error(`Illegal ${action.type} for ${player}`);

  if (action.type === "move") {
    const pawns = { ...state.pawns, [player]: action.to };
    const winner = action.to.r === GOAL_ROW[player] ? player : null;
    return { ...state, pawns, winner, turn: winner ? state.turn : other(player) };
  }

  return {
    ...state,
    walls: [...state.walls, { r: action.r, c: action.c, o: action.o, owner: player }],
    wallsLeft: { ...state.wallsLeft, [player]: state.wallsLeft[player] - 1 },
    turn: other(player),
  };
}

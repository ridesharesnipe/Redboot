import { nanoid } from 'nanoid';

const PLAYER_ID_KEY = 'redboot-player-id';

/**
 * Gets or creates an anonymous player ID stored in localStorage.
 * This ID is used to identify users without requiring authentication.
 */
export function getPlayerId(): string {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  
  if (!playerId) {
    // Generate a new unique ID using nanoid (URL-safe, unique)
    playerId = nanoid(21); // 21 characters = ~149 bits of entropy
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  
  return playerId;
}

/**
 * Clears the player ID (useful for testing or resetting the app)
 */
export function clearPlayerId(): void {
  localStorage.removeItem(PLAYER_ID_KEY);
}

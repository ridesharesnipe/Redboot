import { nanoid } from 'nanoid';

const PLAYER_ID_KEY = 'redboot-player-id';
const SESSION_TOKEN_KEY = 'redboot-session-token';

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
 * Gets or creates a secret session token stored in localStorage.
 * This token prevents player ID impersonation - you need BOTH the player ID
 * and the matching session token to access data.
 */
export function getSessionToken(): string {
  let sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  
  if (!sessionToken) {
    // Generate a new secret token using nanoid
    sessionToken = nanoid(32); // 32 characters = ~191 bits of entropy (very secure)
    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
  }
  
  return sessionToken;
}

/**
 * Clears the player ID and session token (useful for testing or resetting the app)
 */
export function clearPlayerId(): void {
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

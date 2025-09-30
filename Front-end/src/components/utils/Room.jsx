// utils/room.js

/**
 * Generate a consistent room ID for two users.
 * Sorts the IDs so that the order doesn't matter.
 *
 * @param {number|string} id1 - First user ID
 * @param {number|string} id2 - Second user ID
 * @returns {string} room ID
 */
export const getRoomId = (id1, id2) => {
  return [id1, id2].sort().join("_");
};
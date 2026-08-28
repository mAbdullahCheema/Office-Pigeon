/**
 * Lua that runs inside Redis.
 *
 * Kept out of `lib/redis.ts` because that module carries the `server-only`
 * guard, which throws under plain Node — and the end-to-end check needs to
 * exercise the real script rather than a copy of it that could drift.
 */

/**
 * Fixed-window rate limiting in one round trip.
 *
 * Done in three commands from the app — INCR, EXPIRE, PTTL — this cost three
 * network round trips per guarded request, which at a measured 70 ms to the
 * managed instance meant roughly 200 ms added to every form post. As a script
 * it is one, and it is atomic: nothing can observe the counter between the
 * increment and the expiry being set.
 *
 * `KEYS[1]` is the counter, `ARGV[1]` the window in milliseconds.
 * Returns `{ count, ttlMillis }`.
 */
export const RATE_LIMIT_LUA = `
local count = redis.call('INCR', KEYS[1])
local window = tonumber(ARGV[1])

-- Only the request that opens the window sets the expiry, so a busy window is
-- never extended by later traffic inside it.
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], window)
end

local ttl = redis.call('PTTL', KEYS[1])

-- -1 means the key exists with no expiry, which can only be a lost PEXPIRE.
-- Repair it rather than letting the key lock the caller out forever.
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], window)
  ttl = window
end

return {count, ttl}
`;

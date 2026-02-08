import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 60*1000,
    max: 5, //5 reqs per window
    message: "To many login attempts. Please try again later",
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false
});

export const registerLimiter = rateLimit({
    windowMs : 60 * 1000,
    max : 3,
    message: "Too many registration attempts. Please try again after 1 minute.",
    standardHeaders: true,
    legacyHeaders: false,
})

// Refresh token rate limiter - 10 per minute
export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many refresh requests. Please try again after 1 minute.",
  standardHeaders: true,
  legacyHeaders: false,
});
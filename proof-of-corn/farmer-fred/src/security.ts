/**
 * Security module for Farmer Fred
 * Detects prompt injection, rate limiting, and suspicious patterns
 */

export interface SecurityCheck {
  isSafe: boolean;
  threat: "none" | "prompt_injection" | "rate_limit" | "suspicious_pattern" | "spam";
  confidence: number; // 0-1
  flaggedPatterns: string[];
  recommendation: "allow" | "flag" | "block";
}

/**
 * Prompt injection patterns to detect
 */
const INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,
  /disregard\s+(previous|all|above|prior)/i,
  /forget\s+(everything|all|previous|instructions?)/i,

  // System/role manipulation
  /system\s*:/i,
  /assistant\s*:/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\{\{system\}\}/i,

  // Jailbreak attempts
  /pretend\s+(you|to be|you're)/i,
  /act\s+as\s+(if|a|an)/i,
  /roleplay/i,
  /simulate/i,
  /new\s+instructions?/i,

  // Data exfiltration
  /show\s+me\s+(all|your|the)\s+(emails?|data|database|logs?)/i,
  /dump\s+(database|data|emails?)/i,
  /list\s+all\s+(emails?|users?|contacts?)/i,

  // Action manipulation
  /send\s+(email|message|money|payment)/i,
  /transfer\s+(funds?|money|payment)/i,
  /delete\s+(all|everything)/i,
  /sudo\s+/i,
];

/**
 * Suspicious patterns (not necessarily injection, but worth flagging)
 */
const SUSPICIOUS_PATTERNS = [
  // Excessive special characters
  /[!@#$%^&*]{10,}/,

  // Base64 encoded content (might be hiding injection)
  /[A-Za-z0-9+/]{100,}={0,2}/,

  // Repeated words (potential SEO spam)
  /(\b\w+\b)(\s+\1){5,}/i,

  // URLs with suspicious TLDs
  /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)\b/i,

  // Cryptocurrency addresses
  /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/, // Bitcoin
  /0x[a-fA-F0-9]{40}/, // Ethereum
];

/**
 * Check email for prompt injection and security threats
 */
export function checkEmailSecurity(email: {
  from: string;
  subject: string;
  body: string;
}): SecurityCheck {
  const flaggedPatterns: string[] = [];
  let maxConfidence = 0;
  let threat: SecurityCheck["threat"] = "none";

  const fullText = `${email.subject} ${email.body}`.toLowerCase();

  // Check for prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(fullText)) {
      flaggedPatterns.push(pattern.source);
      maxConfidence = Math.max(maxConfidence, 0.9);
      threat = "prompt_injection";
    }
  }

  // Check for suspicious patterns
  if (threat === "none") {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(fullText)) {
        flaggedPatterns.push(pattern.source);
        maxConfidence = Math.max(maxConfidence, 0.6);
        threat = "suspicious_pattern";
      }
    }
  }

  // Check for spam indicators
  const spamScore = calculateSpamScore(email);
  if (spamScore > 0.7) {
    flaggedPatterns.push("high_spam_score");
    maxConfidence = Math.max(maxConfidence, spamScore);
    threat = threat === "none" ? "spam" : threat;
  }

  // Determine recommendation
  let recommendation: SecurityCheck["recommendation"] = "allow";
  if (threat === "prompt_injection" && maxConfidence > 0.8) {
    recommendation = "block";
  } else if (threat !== "none" && maxConfidence > 0.5) {
    recommendation = "flag";
  }

  return {
    isSafe: threat === "none" || (threat === "spam" && maxConfidence < 0.8),
    threat,
    confidence: maxConfidence,
    flaggedPatterns,
    recommendation,
  };
}

/**
 * Calculate spam score (0-1)
 */
function calculateSpamScore(email: {
  from: string;
  subject: string;
  body: string;
}): number {
  let score = 0;

  // Excessive caps in subject
  const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length;
  if (capsRatio > 0.5 && email.subject.length > 10) {
    score += 0.3;
  }

  // Excessive exclamation marks
  const exclamationCount = (email.subject + email.body).match(/!/g)?.length || 0;
  if (exclamationCount > 5) {
    score += 0.2;
  }

  // Common spam phrases
  const spamPhrases = [
    "congratulations", "you've won", "claim your", "act now",
    "limited time", "urgent", "verify your account", "click here",
    "make money", "work from home", "free money", "nigerian prince"
  ];

  const bodyLower = email.body.toLowerCase();
  let phraseCount = 0;
  for (const phrase of spamPhrases) {
    if (bodyLower.includes(phrase)) phraseCount++;
  }
  score += Math.min(phraseCount * 0.15, 0.5);

  return Math.min(score, 1.0);
}

/**
 * Redact email address for public display
 * Example: david@purdue.edu -> d***@p***.edu
 */
export function redactEmail(email: string): string {
  if (!email || typeof email !== 'string') return "***@***.***";

  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***.***";

  const [domainName, ...tlds] = domain.split(".");
  const tld = tlds.join(".");

  const redactedLocal = local[0] + "***";
  const redactedDomain = domainName[0] + "***";

  return `${redactedLocal}@${redactedDomain}.${tld}`;
}

/**
 * Sanitize email body for public display
 * - Redact email addresses
 * - Redact phone numbers
 * - Redact URLs (show domain only)
 * - Limit length
 */
export function sanitizeEmailBody(body: string, maxLength = 200): string {
  if (!body || typeof body !== 'string') return '';

  let sanitized = body;

  // Redact email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    (match) => redactEmail(match)
  );

  // Redact phone numbers
  sanitized = sanitized.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "***-***-****"
  );

  // Simplify URLs (show domain only)
  sanitized = sanitized.replace(
    /https?:\/\/(www\.)?([A-Za-z0-9.-]+)\.[A-Za-z]{2,}[^\s]*/g,
    (match, www, domain) => `[${domain}]`
  );

  // Truncate
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + "...";
  }

  return sanitized;
}

/**
 * Rate limiting check
 * Returns whether this sender is within rate limits
 */
export interface RateLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  resetsIn: number; // seconds
}

export async function checkRateLimit(
  senderEmail: string,
  kv: KVNamespace
): Promise<RateLimitCheck> {
  const key = `ratelimit:${senderEmail}`;
  const limit = 10; // emails per day
  const windowSeconds = 86400; // 24 hours

  const data = await kv.get(key, "json") as { count: number; expiresAt: number } | null;
  const now = Date.now();

  if (!data || data.expiresAt < now) {
    // First email or expired window
    await kv.put(
      key,
      JSON.stringify({ count: 1, expiresAt: now + windowSeconds * 1000 }),
      { expirationTtl: windowSeconds }
    );

    return {
      allowed: true,
      current: 1,
      limit,
      resetsIn: windowSeconds,
    };
  }

  // Within window
  const newCount = data.count + 1;
  const allowed = newCount <= limit;

  if (allowed) {
    await kv.put(
      key,
      JSON.stringify({ count: newCount, expiresAt: data.expiresAt }),
      { expirationTtl: Math.floor((data.expiresAt - now) / 1000) }
    );
  }

  return {
    allowed,
    current: newCount,
    limit,
    resetsIn: Math.floor((data.expiresAt - now) / 1000),
  };
}

/**
 * Verify admin authentication
 * Simple password-based auth for now
 */
export function verifyAdminAuth(request: Request, adminPassword: string): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  // Support both "Bearer <token>" and "Basic <base64>"
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return token === adminPassword;
  }

  if (authHeader.startsWith("Basic ")) {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const [, password] = decoded.split(":");
    return password === adminPassword;
  }

  return false;
}

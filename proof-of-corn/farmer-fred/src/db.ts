/**
 * D1 DATABASE HELPERS
 *
 * Typed query helpers for Farmer Fred's D1 database.
 * Replaces ephemeral KV reads/writes with durable, queryable SQL.
 *
 * Binding: env.FARMER_FRED_DB (configured in wrangler.toml)
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DB {
  FARMER_FRED_DB: D1Database;
}

export interface DecisionEntry {
  id?: number;
  timestamp?: string;
  category: "infrastructure" | "code" | "research" | "planning" | "farming" | "outreach" | "agent" | "milestone" | "community";
  title: string;
  description: string;
  cost?: number;
  ai_decision?: boolean;
  region?: string;
  principles?: string[];
  data_json?: Record<string, unknown>;
}

export interface EmailRecord {
  id: string;
  from_addr: string;
  to_addr?: string;
  subject: string;
  body: string;
  received_at?: string;
  status: "unread" | "read" | "replied" | "archived";
  category?: "lead" | "partnership" | "question" | "spam" | "other" | "suspicious";
  security_score?: number;
  security_safe?: boolean;
  security_threat?: string;
  thread_id?: string;
  data_json?: Record<string, unknown>;
}

export interface TaskRecord {
  id: string;
  type: "respond_email" | "research" | "outreach" | "decision" | "follow_up";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  assigned_to: string;
  created_at?: string;
  due_at?: string;
  completed_at?: string;
  related_email_id?: string;
}

export interface PartnershipEval {
  id?: number;
  partner_name: string;
  evaluation_date?: string;
  scores_json: Record<string, number>;
  total_score: number;
  recommendation: "pursue" | "consider" | "decline";
  rationale: string;
  priority: number;
  risks?: string[];
  opportunities?: string[];
  data_json?: Record<string, unknown>;
}

export interface WeatherReading {
  id?: number;
  region: string;
  timestamp?: string;
  temperature: number;
  humidity?: number;
  conditions: string;
  planting_viable: boolean;
  frost_risk: boolean;
  soil_temp_estimate?: number;
  forecast?: string;
  data_json?: Record<string, unknown>;
}

export interface BudgetEntry {
  id?: number;
  date?: string;
  item: string;
  amount: number;
  category: "expense" | "revenue";
  status?: "pending" | "confirmed" | "cancelled";
  notes?: string;
  data_json?: Record<string, unknown>;
}

export interface ContactRecord {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  twitter?: string;
  organization?: string;
  role?: string;
  source: string;
  interest: string;
  first_contact?: string;
  last_contact?: string;
  notes?: string;
  data_json?: Record<string, unknown>;
}

export interface TweetRecord {
  id?: number;
  tweet_id?: string;
  text: string;
  posted_at?: string;
  engagement_json?: Record<string, number>;
  in_reply_to?: string;
  data_json?: Record<string, unknown>;
}

export interface LearningRecord {
  id: string;
  source: "email" | "hn" | "feedback" | "decision" | "observation" | "call";
  source_id?: string;
  insight: string;
  category: "communication" | "farming" | "partnerships" | "community" | "operations" | "general";
  confidence: "high" | "medium" | "low";
  created_at?: string;
  applied_count?: number;
}

export interface FeedbackRecord {
  id: string;
  author?: string;
  type: "suggestion" | "bug" | "improvement" | "question" | "praise";
  content: string;
  status: "pending" | "reviewed" | "incorporated" | "declined";
  created_at?: string;
  reviewed_at?: string;
  learning_id?: string;
}


// ============================================
// DECISIONS
// ============================================

/**
 * Log a decision/event to the decisions table.
 * Replaces: env.FARMER_FRED_KV.put(`log:${Date.now()}`, ...)
 */
export async function logDecision(
  db: D1Database,
  entry: DecisionEntry
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO decisions (timestamp, category, title, description, cost, ai_decision, region, principles, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entry.timestamp || new Date().toISOString(),
      entry.category,
      entry.title,
      entry.description,
      entry.cost ?? 0,
      entry.ai_decision !== false ? 1 : 0,
      entry.region ?? null,
      entry.principles ? JSON.stringify(entry.principles) : null,
      entry.data_json ? JSON.stringify(entry.data_json) : null
    )
    .run();
}

/**
 * Retrieve recent decisions, optionally filtered by category.
 * Replaces: env.FARMER_FRED_KV.list({ prefix: "log:" }) + N get() calls
 */
export async function getDecisions(
  db: D1Database,
  opts: { limit?: number; category?: string; since?: string } = {}
): Promise<DecisionEntry[]> {
  const limit = opts.limit ?? 50;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.category) {
    conditions.push("category = ?");
    params.push(opts.category);
  }

  if (opts.since) {
    conditions.push("timestamp >= ?");
    params.push(opts.since);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await db
    .prepare(`SELECT * FROM decisions ${where} ORDER BY timestamp DESC LIMIT ?`)
    .bind(...params, limit)
    .all();

  return (results ?? []).map(rowToDecision);
}

function rowToDecision(row: Record<string, unknown>): DecisionEntry {
  return {
    id: row.id as number,
    timestamp: row.timestamp as string,
    category: row.category as DecisionEntry["category"],
    title: row.title as string,
    description: row.description as string,
    cost: row.cost as number,
    ai_decision: (row.ai_decision as number) === 1,
    region: row.region as string | undefined,
    principles: row.principles ? JSON.parse(row.principles as string) : undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// EMAILS
// ============================================

/**
 * Save an email record.
 * Replaces: env.FARMER_FRED_KV.put(`email:${emailId}`, ..., { expirationTtl: 90 days })
 */
export async function saveEmail(
  db: D1Database,
  email: EmailRecord
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO emails
         (id, from_addr, to_addr, subject, body, received_at, status, category,
          security_score, security_safe, security_threat, thread_id, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      email.id,
      email.from_addr,
      email.to_addr ?? "fred@proofofcorn.com",
      email.subject,
      email.body,
      email.received_at ?? new Date().toISOString(),
      email.status,
      email.category ?? null,
      email.security_score ?? null,
      email.security_safe != null ? (email.security_safe ? 1 : 0) : null,
      email.security_threat ?? null,
      email.thread_id ?? null,
      email.data_json ? JSON.stringify(email.data_json) : null
    )
    .run();
}

/**
 * Retrieve emails, optionally filtered by status.
 * Replaces: env.FARMER_FRED_KV.list({ prefix: "email:" }) + N get() calls
 */
export async function getEmails(
  db: D1Database,
  opts: { status?: string; category?: string; limit?: number } = {}
): Promise<EmailRecord[]> {
  const limit = opts.limit ?? 50;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.status) {
    conditions.push("status = ?");
    params.push(opts.status);
  }

  if (opts.category) {
    conditions.push("category = ?");
    params.push(opts.category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await db
    .prepare(`SELECT * FROM emails ${where} ORDER BY received_at DESC LIMIT ?`)
    .bind(...params, limit)
    .all();

  return (results ?? []).map(rowToEmail);
}

/**
 * Get a single email by ID.
 */
export async function getEmailById(
  db: D1Database,
  id: string
): Promise<EmailRecord | null> {
  const row = await db
    .prepare("SELECT * FROM emails WHERE id = ?")
    .bind(id)
    .first();

  return row ? rowToEmail(row) : null;
}

/**
 * Update email status (e.g., mark as replied).
 */
export async function updateEmailStatus(
  db: D1Database,
  id: string,
  status: EmailRecord["status"]
): Promise<void> {
  await db
    .prepare("UPDATE emails SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
}

function rowToEmail(row: Record<string, unknown>): EmailRecord {
  return {
    id: row.id as string,
    from_addr: row.from_addr as string,
    to_addr: row.to_addr as string,
    subject: row.subject as string,
    body: row.body as string,
    received_at: row.received_at as string,
    status: row.status as EmailRecord["status"],
    category: row.category as EmailRecord["category"],
    security_score: row.security_score as number | undefined,
    security_safe: row.security_safe != null ? (row.security_safe as number) === 1 : undefined,
    security_threat: row.security_threat as string | undefined,
    thread_id: row.thread_id as string | undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// TASKS
// ============================================

/**
 * Save a task record.
 * Replaces: env.FARMER_FRED_KV.put(`task:${task.id}`, ...)
 */
export async function saveTask(
  db: D1Database,
  task: TaskRecord
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO tasks
         (id, type, priority, title, description, status, assigned_to,
          created_at, due_at, completed_at, related_email_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      task.id,
      task.type,
      task.priority,
      task.title,
      task.description,
      task.status,
      task.assigned_to,
      task.created_at ?? new Date().toISOString(),
      task.due_at ?? null,
      task.completed_at ?? null,
      task.related_email_id ?? null
    )
    .run();
}

/**
 * Retrieve tasks, optionally filtered by status/priority.
 * Replaces: env.FARMER_FRED_KV.list({ prefix: "task:" }) + N get() calls
 */
export async function getTasks(
  db: D1Database,
  opts: { status?: string; priority?: string; assigned_to?: string; limit?: number } = {}
): Promise<TaskRecord[]> {
  const limit = opts.limit ?? 100;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.status) {
    conditions.push("status = ?");
    params.push(opts.status);
  }

  if (opts.priority) {
    conditions.push("priority = ?");
    params.push(opts.priority);
  }

  if (opts.assigned_to) {
    conditions.push("assigned_to = ?");
    params.push(opts.assigned_to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await db
    .prepare(
      `SELECT * FROM tasks ${where}
       ORDER BY
         CASE status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'blocked' THEN 2 ELSE 3 END,
         CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
         created_at DESC
       LIMIT ?`
    )
    .bind(...params, limit)
    .all();

  return (results ?? []).map(rowToTask);
}

/**
 * Get a single task by ID.
 */
export async function getTaskById(
  db: D1Database,
  id: string
): Promise<TaskRecord | null> {
  const row = await db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(id)
    .first();

  return row ? rowToTask(row) : null;
}

/**
 * Update task status (e.g., mark as completed).
 */
export async function updateTaskStatus(
  db: D1Database,
  id: string,
  status: TaskRecord["status"]
): Promise<void> {
  const completedAt = status === "completed" ? new Date().toISOString() : null;
  await db
    .prepare("UPDATE tasks SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?")
    .bind(status, completedAt, id)
    .run();
}

function rowToTask(row: Record<string, unknown>): TaskRecord {
  return {
    id: row.id as string,
    type: row.type as TaskRecord["type"],
    priority: row.priority as TaskRecord["priority"],
    title: row.title as string,
    description: row.description as string,
    status: row.status as TaskRecord["status"],
    assigned_to: row.assigned_to as string,
    created_at: row.created_at as string,
    due_at: row.due_at as string | undefined,
    completed_at: row.completed_at as string | undefined,
    related_email_id: row.related_email_id as string | undefined,
  };
}


// ============================================
// PARTNERSHIPS
// ============================================

/**
 * Save a partnership evaluation.
 * Replaces: env.FARMER_FRED_KV.put("partnerships:latest-evaluation", ...)
 * Now creates a new row each time, preserving full history.
 */
export async function savePartnershipEval(
  db: D1Database,
  evalRecord: PartnershipEval
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO partnerships
         (partner_name, evaluation_date, scores_json, total_score, recommendation,
          rationale, priority, risks, opportunities, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      evalRecord.partner_name,
      evalRecord.evaluation_date ?? new Date().toISOString(),
      JSON.stringify(evalRecord.scores_json),
      evalRecord.total_score,
      evalRecord.recommendation,
      evalRecord.rationale,
      evalRecord.priority,
      evalRecord.risks ? JSON.stringify(evalRecord.risks) : null,
      evalRecord.opportunities ? JSON.stringify(evalRecord.opportunities) : null,
      evalRecord.data_json ? JSON.stringify(evalRecord.data_json) : null
    )
    .run();
}

/**
 * Get partnership evaluation history for a specific partner.
 * New capability: track how evaluations change over time.
 */
export async function getPartnershipHistory(
  db: D1Database,
  partnerName: string
): Promise<PartnershipEval[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM partnerships WHERE partner_name = ? ORDER BY evaluation_date DESC"
    )
    .bind(partnerName)
    .all();

  return (results ?? []).map(rowToPartnership);
}

/**
 * Get the latest evaluation for all partners.
 */
export async function getLatestPartnershipEvals(
  db: D1Database
): Promise<PartnershipEval[]> {
  const { results } = await db
    .prepare(
      `SELECT p.* FROM partnerships p
       INNER JOIN (
         SELECT partner_name, MAX(evaluation_date) as latest
         FROM partnerships GROUP BY partner_name
       ) latest ON p.partner_name = latest.partner_name
                AND p.evaluation_date = latest.latest
       ORDER BY p.priority ASC`
    )
    .all();

  return (results ?? []).map(rowToPartnership);
}

function rowToPartnership(row: Record<string, unknown>): PartnershipEval {
  return {
    id: row.id as number,
    partner_name: row.partner_name as string,
    evaluation_date: row.evaluation_date as string,
    scores_json: JSON.parse(row.scores_json as string),
    total_score: row.total_score as number,
    recommendation: row.recommendation as PartnershipEval["recommendation"],
    rationale: row.rationale as string,
    priority: row.priority as number,
    risks: row.risks ? JSON.parse(row.risks as string) : undefined,
    opportunities: row.opportunities ? JSON.parse(row.opportunities as string) : undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// WEATHER HISTORY
// ============================================

/**
 * Save a weather reading.
 * Replaces: overwriting KV cache with latest reading.
 * Now preserves all readings for time-series analysis.
 */
export async function saveWeatherReading(
  db: D1Database,
  reading: WeatherReading
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO weather_history
         (region, timestamp, temperature, humidity, conditions,
          planting_viable, frost_risk, soil_temp_estimate, forecast, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      reading.region,
      reading.timestamp ?? new Date().toISOString(),
      reading.temperature,
      reading.humidity ?? null,
      reading.conditions,
      reading.planting_viable ? 1 : 0,
      reading.frost_risk ? 1 : 0,
      reading.soil_temp_estimate ?? null,
      reading.forecast ?? null,
      reading.data_json ? JSON.stringify(reading.data_json) : null
    )
    .run();
}

/**
 * Get weather history for a region over a number of days.
 * New capability: trend analysis, frost risk patterns, planting windows.
 */
export async function getWeatherHistory(
  db: D1Database,
  region: string,
  days: number = 7
): Promise<WeatherReading[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { results } = await db
    .prepare(
      "SELECT * FROM weather_history WHERE region = ? AND timestamp >= ? ORDER BY timestamp DESC"
    )
    .bind(region, since)
    .all();

  return (results ?? []).map(rowToWeather);
}

/**
 * Get the latest weather reading for each region.
 */
export async function getLatestWeather(
  db: D1Database
): Promise<WeatherReading[]> {
  const { results } = await db
    .prepare(
      `SELECT w.* FROM weather_history w
       INNER JOIN (
         SELECT region, MAX(timestamp) as latest
         FROM weather_history GROUP BY region
       ) latest ON w.region = latest.region AND w.timestamp = latest.latest`
    )
    .all();

  return (results ?? []).map(rowToWeather);
}

function rowToWeather(row: Record<string, unknown>): WeatherReading {
  return {
    id: row.id as number,
    region: row.region as string,
    timestamp: row.timestamp as string,
    temperature: row.temperature as number,
    humidity: row.humidity as number | undefined,
    conditions: row.conditions as string,
    planting_viable: (row.planting_viable as number) === 1,
    frost_risk: (row.frost_risk as number) === 1,
    soil_temp_estimate: row.soil_temp_estimate as number | undefined,
    forecast: row.forecast as string | undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// BUDGET
// ============================================

/**
 * Save a budget entry (expense or revenue line item).
 * Replaces: single KV "budget" blob with {spent, allocated}.
 */
export async function saveBudgetEntry(
  db: D1Database,
  entry: BudgetEntry
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO budget (date, item, amount, category, status, notes, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entry.date ?? new Date().toISOString().split("T")[0],
      entry.item,
      entry.amount,
      entry.category,
      entry.status ?? "confirmed",
      entry.notes ?? null,
      entry.data_json ? JSON.stringify(entry.data_json) : null
    )
    .run();
}

/**
 * Get budget summary: total spent, total revenue, and all entries.
 * Replaces: env.FARMER_FRED_KV.get("budget", "json")
 */
export async function getBudgetSummary(
  db: D1Database
): Promise<{ totalSpent: number; totalRevenue: number; balance: number; entries: BudgetEntry[] }> {
  // Get totals
  const totals = await db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN category = 'expense' AND status = 'confirmed' THEN amount ELSE 0 END), 0) as total_spent,
         COALESCE(SUM(CASE WHEN category = 'revenue' AND status = 'confirmed' THEN amount ELSE 0 END), 0) as total_revenue
       FROM budget`
    )
    .first();

  const totalSpent = (totals?.total_spent as number) ?? 0;
  const totalRevenue = (totals?.total_revenue as number) ?? 0;

  // Get all entries
  const { results } = await db
    .prepare("SELECT * FROM budget ORDER BY date DESC, id DESC")
    .all();

  const entries = (results ?? []).map(rowToBudget);

  return {
    totalSpent,
    totalRevenue,
    balance: totalRevenue - totalSpent,
    entries,
  };
}

function rowToBudget(row: Record<string, unknown>): BudgetEntry {
  return {
    id: row.id as number,
    date: row.date as string,
    item: row.item as string,
    amount: row.amount as number,
    category: row.category as BudgetEntry["category"],
    status: row.status as BudgetEntry["status"],
    notes: row.notes as string | undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// CONTACTS
// ============================================

/**
 * Save a contact record.
 * Replaces: env.FARMER_FRED_KV.put(contactId, ...) + contacts:index
 */
export async function saveContact(
  db: D1Database,
  contact: ContactRecord
): Promise<void> {
  const id = contact.id || `contact:${Date.now()}-${contact.name.toLowerCase().replace(/\s+/g, "-")}`;

  await db
    .prepare(
      `INSERT OR REPLACE INTO contacts
         (id, name, email, phone, twitter, organization, role, source,
          interest, first_contact, last_contact, notes, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      contact.name,
      contact.email ?? null,
      contact.phone ?? null,
      contact.twitter ?? null,
      contact.organization ?? null,
      contact.role ?? null,
      contact.source,
      contact.interest,
      contact.first_contact ?? new Date().toISOString(),
      contact.last_contact ?? new Date().toISOString(),
      contact.notes ?? null,
      contact.data_json ? JSON.stringify(contact.data_json) : null
    )
    .run();
}

/**
 * Get all contacts, optionally filtered by source.
 * Replaces: env.FARMER_FRED_KV.get("contacts:index") + N get() calls
 */
export async function getContacts(
  db: D1Database,
  opts: { source?: string; limit?: number } = {}
): Promise<ContactRecord[]> {
  const limit = opts.limit ?? 100;

  if (opts.source) {
    const { results } = await db
      .prepare("SELECT * FROM contacts WHERE source = ? ORDER BY last_contact DESC LIMIT ?")
      .bind(opts.source, limit)
      .all();
    return (results ?? []).map(rowToContact);
  }

  const { results } = await db
    .prepare("SELECT * FROM contacts ORDER BY last_contact DESC LIMIT ?")
    .bind(limit)
    .all();

  return (results ?? []).map(rowToContact);
}

/**
 * Find a contact by name or email (for deduplication).
 */
export async function findContact(
  db: D1Database,
  opts: { name?: string; email?: string }
): Promise<ContactRecord | null> {
  if (opts.email) {
    const row = await db
      .prepare("SELECT * FROM contacts WHERE LOWER(email) = LOWER(?) LIMIT 1")
      .bind(opts.email)
      .first();
    if (row) return rowToContact(row);
  }

  if (opts.name) {
    const row = await db
      .prepare("SELECT * FROM contacts WHERE LOWER(name) = LOWER(?) LIMIT 1")
      .bind(opts.name)
      .first();
    if (row) return rowToContact(row);
  }

  return null;
}

function rowToContact(row: Record<string, unknown>): ContactRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    twitter: row.twitter as string | undefined,
    organization: row.organization as string | undefined,
    role: row.role as string | undefined,
    source: row.source as string,
    interest: row.interest as string,
    first_contact: row.first_contact as string,
    last_contact: row.last_contact as string,
    notes: row.notes as string | undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// TWEETS
// ============================================

/**
 * Save a tweet record.
 */
export async function saveTweet(
  db: D1Database,
  tweet: TweetRecord
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO tweets (tweet_id, text, posted_at, engagement_json, in_reply_to, data_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      tweet.tweet_id ?? null,
      tweet.text,
      tweet.posted_at ?? new Date().toISOString(),
      tweet.engagement_json ? JSON.stringify(tweet.engagement_json) : null,
      tweet.in_reply_to ?? null,
      tweet.data_json ? JSON.stringify(tweet.data_json) : null
    )
    .run();
}

/**
 * Get recent tweets.
 */
export async function getTweets(
  db: D1Database,
  opts: { limit?: number } = {}
): Promise<TweetRecord[]> {
  const limit = opts.limit ?? 50;

  const { results } = await db
    .prepare("SELECT * FROM tweets ORDER BY posted_at DESC LIMIT ?")
    .bind(limit)
    .all();

  return (results ?? []).map(rowToTweet);
}

/**
 * Update tweet engagement metrics.
 */
export async function updateTweetEngagement(
  db: D1Database,
  tweetId: string,
  engagement: Record<string, number>
): Promise<void> {
  await db
    .prepare("UPDATE tweets SET engagement_json = ? WHERE tweet_id = ?")
    .bind(JSON.stringify(engagement), tweetId)
    .run();
}

function rowToTweet(row: Record<string, unknown>): TweetRecord {
  return {
    id: row.id as number,
    tweet_id: row.tweet_id as string | undefined,
    text: row.text as string,
    posted_at: row.posted_at as string,
    engagement_json: row.engagement_json ? JSON.parse(row.engagement_json as string) : undefined,
    in_reply_to: row.in_reply_to as string | undefined,
    data_json: row.data_json ? JSON.parse(row.data_json as string) : undefined,
  };
}


// ============================================
// LEARNINGS
// ============================================

/**
 * Save a learning record.
 * Replaces: env.FARMER_FRED_KV.put(`learning:${id}`, ..., { expirationTtl: 365 days })
 */
export async function saveLearning(
  db: D1Database,
  learning: LearningRecord
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO learnings
         (id, source, source_id, insight, category, confidence, created_at, applied_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      learning.id,
      learning.source,
      learning.source_id ?? null,
      learning.insight,
      learning.category,
      learning.confidence,
      learning.created_at ?? new Date().toISOString(),
      learning.applied_count ?? 0
    )
    .run();
}

/**
 * Get learnings, optionally filtered by category or source.
 */
export async function getLearnings(
  db: D1Database,
  opts: { category?: string; source?: string; limit?: number } = {}
): Promise<LearningRecord[]> {
  const limit = opts.limit ?? 100;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.category) {
    conditions.push("category = ?");
    params.push(opts.category);
  }

  if (opts.source) {
    conditions.push("source = ?");
    params.push(opts.source);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await db
    .prepare(`SELECT * FROM learnings ${where} ORDER BY created_at DESC LIMIT ?`)
    .bind(...params, limit)
    .all();

  return (results ?? []).map(rowToLearning);
}

function rowToLearning(row: Record<string, unknown>): LearningRecord {
  return {
    id: row.id as string,
    source: row.source as LearningRecord["source"],
    source_id: row.source_id as string | undefined,
    insight: row.insight as string,
    category: row.category as LearningRecord["category"],
    confidence: row.confidence as LearningRecord["confidence"],
    created_at: row.created_at as string,
    applied_count: row.applied_count as number,
  };
}


// ============================================
// FEEDBACK
// ============================================

/**
 * Save a feedback record.
 * Replaces: env.FARMER_FRED_KV.put(`feedback:${id}`, ..., { expirationTtl: 180 days })
 */
export async function saveFeedback(
  db: D1Database,
  feedback: FeedbackRecord
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO feedback
         (id, author, type, content, status, created_at, reviewed_at, learning_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      feedback.id,
      feedback.author ?? "Anonymous",
      feedback.type,
      feedback.content,
      feedback.status,
      feedback.created_at ?? new Date().toISOString(),
      feedback.reviewed_at ?? null,
      feedback.learning_id ?? null
    )
    .run();
}

/**
 * Get feedback records, optionally filtered by status or type.
 */
export async function getFeedback(
  db: D1Database,
  opts: { status?: string; type?: string; limit?: number } = {}
): Promise<FeedbackRecord[]> {
  const limit = opts.limit ?? 100;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.status) {
    conditions.push("status = ?");
    params.push(opts.status);
  }

  if (opts.type) {
    conditions.push("type = ?");
    params.push(opts.type);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await db
    .prepare(`SELECT * FROM feedback ${where} ORDER BY created_at DESC LIMIT ?`)
    .bind(...params, limit)
    .all();

  return (results ?? []).map(rowToFeedback);
}

function rowToFeedback(row: Record<string, unknown>): FeedbackRecord {
  return {
    id: row.id as string,
    author: row.author as string,
    type: row.type as FeedbackRecord["type"],
    content: row.content as string,
    status: row.status as FeedbackRecord["status"],
    created_at: row.created_at as string,
    reviewed_at: row.reviewed_at as string | undefined,
    learning_id: row.learning_id as string | undefined,
  };
}

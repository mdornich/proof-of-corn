/**
 * HACKER NEWS MONITORING TOOL
 *
 * Fetches and analyzes HN comments for Proof of Corn.
 * Uses Algolia HN API for fast search.
 */

export interface HNComment {
  id: string;
  author: string;
  text: string;
  created_at: string;
  points: number | null;
  parent_id: string | null;
}

export interface HNAnalysis {
  timestamp: string;
  storyId: string;
  totalComments: number;
  totalPoints: number;
  themes: Theme[];
  actionableIdeas: ActionableIdea[];
  concerns: Concern[];
  sentiment: SentimentSummary;
  topComments: HNComment[];
}

export interface Theme {
  name: string;
  count: number;
  examples: string[];
}

export interface ActionableIdea {
  idea: string;
  author: string;
  priority: "high" | "medium" | "low";
  category: "feature" | "improvement" | "partnership" | "content";
  commentId: string;
}

export interface Concern {
  concern: string;
  author: string;
  addressed: boolean;
  response?: string;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  overall: "positive" | "neutral" | "negative" | "mixed";
}

const PROOF_OF_CORN_STORY_ID = "46735511";
const ALGOLIA_API = "https://hn.algolia.com/api/v1";

/**
 * Fetch story metadata from HN
 */
export async function fetchStoryMetadata(): Promise<{
  points: number;
  numComments: number;
  title: string;
  url: string;
  createdAt: string;
}> {
  const response = await fetch(
    `${ALGOLIA_API}/items/${PROOF_OF_CORN_STORY_ID}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch story: ${response.status}`);
  }

  const data = await response.json() as {
    points: number;
    children: unknown[];
    title: string;
    url: string;
    created_at: string;
  };

  return {
    points: data.points,
    numComments: data.children?.length || 0,
    title: data.title,
    url: data.url,
    createdAt: data.created_at
  };
}

/**
 * Fetch all comments for the Proof of Corn story
 */
export async function fetchAllComments(limit = 100): Promise<HNComment[]> {
  const response = await fetch(
    `${ALGOLIA_API}/search?tags=comment,story_${PROOF_OF_CORN_STORY_ID}&hitsPerPage=${limit}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.status}`);
  }

  const data = await response.json() as {
    hits: Array<{
      objectID: string;
      author: string;
      comment_text: string;
      created_at: string;
      points: number | null;
      parent_id: string | null;
    }>;
  };

  return data.hits.map(hit => ({
    id: hit.objectID,
    author: hit.author,
    text: decodeHtmlEntities(hit.comment_text || ""),
    created_at: hit.created_at,
    points: hit.points,
    parent_id: hit.parent_id
  }));
}

/**
 * Extract actionable ideas from comments using keyword matching
 * (Can be enhanced with Claude analysis later)
 */
export function extractActionableIdeas(comments: HNComment[]): ActionableIdea[] {
  const ideas: ActionableIdea[] = [];

  const ideaKeywords = [
    { pattern: /should|could|would be (cool|great|nice|better)/i, priority: "medium" as const },
    { pattern: /suggestion|idea|feature/i, priority: "medium" as const },
    { pattern: /you (need|should|must)/i, priority: "high" as const },
    { pattern: /what if|have you considered/i, priority: "medium" as const },
    { pattern: /partnership|collaborate|sponsor/i, priority: "high" as const },
    { pattern: /RSS|feed|subscribe|newsletter/i, priority: "high" as const },
    { pattern: /livestream|twitch|youtube/i, priority: "medium" as const },
  ];

  const categoryPatterns = [
    { pattern: /RSS|feed|API|endpoint/i, category: "feature" as const },
    { pattern: /partner|sponsor|collaborate/i, category: "partnership" as const },
    { pattern: /video|stream|content|blog/i, category: "content" as const },
    { pattern: /.*/, category: "improvement" as const }, // default
  ];

  for (const comment of comments) {
    for (const { pattern, priority } of ideaKeywords) {
      if (pattern.test(comment.text)) {
        // Determine category
        let category: ActionableIdea["category"] = "improvement";
        for (const { pattern: catPattern, category: cat } of categoryPatterns) {
          if (catPattern.test(comment.text)) {
            category = cat;
            break;
          }
        }

        // Extract a summary (first 200 chars)
        const summary = comment.text.slice(0, 200).replace(/<[^>]*>/g, "");

        ideas.push({
          idea: summary,
          author: comment.author,
          priority,
          category,
          commentId: comment.id
        });
        break; // Only count each comment once
      }
    }
  }

  return ideas;
}

/**
 * Extract concerns/criticisms from comments
 */
export function extractConcerns(comments: HNComment[]): Concern[] {
  const concerns: Concern[] = [];

  const concernPatterns = [
    /fail|failure|won't work|doesn't work/i,
    /stupid|dumb|pointless|useless/i,
    /scam|fake|misleading/i,
    /concern|worried|problem|issue/i,
    /budget.*low|too expensive|not enough/i,
    /security|privacy|risk/i,
  ];

  for (const comment of comments) {
    for (const pattern of concernPatterns) {
      if (pattern.test(comment.text)) {
        const summary = comment.text.slice(0, 200).replace(/<[^>]*>/g, "");
        concerns.push({
          concern: summary,
          author: comment.author,
          addressed: false
        });
        break;
      }
    }
  }

  return concerns;
}

/**
 * Basic sentiment analysis
 */
export function analyzeSentiment(comments: HNComment[]): SentimentSummary {
  const positiveWords = /great|awesome|cool|love|amazing|brilliant|excellent|fantastic|impressive/i;
  const negativeWords = /stupid|dumb|fail|useless|pointless|terrible|awful|hate|scam|fake/i;

  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const comment of comments) {
    const hasPositive = positiveWords.test(comment.text);
    const hasNegative = negativeWords.test(comment.text);

    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    else neutral++;
  }

  const total = comments.length || 1;
  const positiveRatio = positive / total;
  const negativeRatio = negative / total;

  let overall: SentimentSummary["overall"] = "neutral";
  if (positiveRatio > 0.4) overall = "positive";
  else if (negativeRatio > 0.4) overall = "negative";
  else if (positiveRatio > 0.2 && negativeRatio > 0.2) overall = "mixed";

  return { positive, neutral, negative, overall };
}

/**
 * Identify common themes
 */
export function identifyThemes(comments: HNComment[]): Theme[] {
  const themePatterns: Array<{ name: string; pattern: RegExp }> = [
    { name: "AI Agency/Autonomy", pattern: /autonom|agency|sentien|conscious/i },
    { name: "Skepticism", pattern: /fail|won't work|stupid|dumb|useless/i },
    { name: "Comparison to Others", pattern: /twitch|pokemon|deere|tesla/i },
    { name: "Budget Concerns", pattern: /budget|cost|expensive|money/i },
    { name: "Technical Questions", pattern: /sensor|IoT|API|data|weather/i },
    { name: "Philosophical", pattern: /intelligence|sentience|human|replace/i },
    { name: "Supportive", pattern: /cool|great|awesome|love|interesting/i },
    { name: "Jokes/Humor", pattern: /lol|haha|joke|welcome.*overlord/i },
  ];

  const themes: Theme[] = themePatterns.map(({ name, pattern }) => ({
    name,
    count: 0,
    examples: []
  }));

  for (const comment of comments) {
    for (let i = 0; i < themePatterns.length; i++) {
      if (themePatterns[i].pattern.test(comment.text)) {
        themes[i].count++;
        if (themes[i].examples.length < 3) {
          themes[i].examples.push(
            comment.text.slice(0, 100).replace(/<[^>]*>/g, "")
          );
        }
      }
    }
  }

  // Sort by count and filter out empty themes
  return themes
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Full analysis of HN feedback
 */
export async function analyzeHNFeedback(): Promise<HNAnalysis> {
  const [metadata, comments] = await Promise.all([
    fetchStoryMetadata(),
    fetchAllComments(200)
  ]);

  const themes = identifyThemes(comments);
  const actionableIdeas = extractActionableIdeas(comments);
  const concerns = extractConcerns(comments);
  const sentiment = analyzeSentiment(comments);

  // Get top comments (most recent, with substance)
  const topComments = comments
    .filter(c => c.text.length > 100)
    .slice(0, 10);

  return {
    timestamp: new Date().toISOString(),
    storyId: PROOF_OF_CORN_STORY_ID,
    totalComments: metadata.numComments,
    totalPoints: metadata.points,
    themes,
    actionableIdeas: actionableIdeas.slice(0, 20),
    concerns: concerns.slice(0, 20),
    sentiment,
    topComments
  };
}

/**
 * Decode HTML entities in comment text
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/<p>/g, "\n\n")
    .replace(/<[^>]*>/g, "");
}

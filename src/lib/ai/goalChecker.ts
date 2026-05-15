// Goal relevance checker - evaluates if content is aligned with user's goal

export interface RelevanceResult {
  isRelevant: boolean;
  confidence: number;
  reason: string;
}

// Simple keyword-based relevance checker (works without AI API)
export function checkRelevanceLocally(
  goal: string,
  contentTitle: string,
  contentDescription?: string
): RelevanceResult {
  const goalWords = goal.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const content = `${contentTitle} ${contentDescription || ''}`.toLowerCase();

  let matchCount = 0;
  for (const word of goalWords) {
    if (content.includes(word)) {
      matchCount++;
    }
  }

  const confidence = goalWords.length > 0 ? matchCount / goalWords.length : 0;

  if (confidence >= 0.3) {
    return {
      isRelevant: true,
      confidence,
      reason: `This content appears relevant to your goal. ${matchCount} matching concepts found.`,
    };
  }

  // Default to allowing if no strong signal
  if (goalWords.length < 3) {
    return {
      isRelevant: true,
      confidence: 0.5,
      reason: 'Unable to determine relevance with certainty. Allowed by default.',
    };
  }

  return {
    isRelevant: false,
    confidence,
    reason: `This content doesn't appear to be aligned with your goal: "${goal}". Consider focusing on material that directly serves your objective.`,
  };
}

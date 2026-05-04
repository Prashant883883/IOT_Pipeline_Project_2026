export interface ApplicationScore {
  applicationId: string;
  proposalId: string;
  studentSkills: string[];
  proposalSkills: string[];
  matchScore: number;
  skillsGap: string[];
  studentHasSkills: string[];
}

/**
 * Calculate skills match between student and proposal
 * Returns a score 0-1 and identifies skill gaps
 */
export function calculateSkillsMatch(studentSkills: string[], proposalSkills: string[]): {
  score: number;
  gap: string[];
  matched: string[];
} {
  if (!proposalSkills || proposalSkills.length === 0) {
    return { score: 1, gap: [], matched: [] };
  }

  const normalizedStudent = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedProposal = proposalSkills.map((s) => s.toLowerCase().trim());

  const matched = normalizedProposal.filter((skill) =>
    normalizedStudent.some(
      (s) => s === skill || s.includes(skill) || skill.includes(s)
    )
  );

  const gap = normalizedProposal.filter((skill) => !matched.includes(skill));

  const score = normalizedProposal.length > 0 ? matched.length / normalizedProposal.length : 1;

  return {
    score: Math.min(score, 1),
    gap,
    matched,
  };
}

/**
 * Calculate application quality score based on:
 * - Skills match
 * - Application status (SELECTED is best)
 * - Recruiter engagement (notes count)
 */
export function calculateApplicationScore(
  application: any,
  skillsMatchScore: number
): number {
  let score = skillsMatchScore * 0.6; // 60% weight on skills match

  // Status bonus/penalty (using uppercase constants)
  const statusWeights: Record<string, number> = {
    SELECTED: 1.0,
    INTERVIEW: 0.8,
    SHORTLISTED: 0.6,
    UNDER_REVIEW: 0.5,
    REQUEST_INFO: 0.4,
    NEW: 0.3,
    REJECTED: 0.0,
  };
  const statusScore = statusWeights[application.currentStatus] || 0.5;
  score += statusScore * 0.25; // 25% weight on status

  // Recruiter engagement bonus (notes indicate interest)
  const noteBonus = Math.min(application._count?.recruiterNotes || 0, 5) * 0.03;
  score += noteBonus * 0.15; // 15% weight on engagement

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Parse skills from a string (comma or space separated)
 */
export function parseSkills(skillsString: string | string[]): string[] {
  if (Array.isArray(skillsString)) {
    return skillsString.map((s) => s.toLowerCase().trim()).filter(Boolean);
  }

  if (typeof skillsString !== 'string') {
    return [];
  }

  return skillsString
    .split(/[,\s]+/)
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
}

/**
 * Calculate average days from submission to hire
 */
export function calculateAverageTimeToHire(applications: any[]): number {
  const hiredApps = applications.filter((app) => app.currentStatus === 'SELECTED');

  if (hiredApps.length === 0) return 0;

  const totalDays = hiredApps.reduce((sum, app) => {
    const submitted = new Date(app.submittedAt);
    const updated = new Date(app.updatedAt);
    const days = Math.floor((updated.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / hiredApps.length);
}

/**
 * Get hire conversion rate (SELECTED status is considered "hired/converted")
 */
export function calculateConversionRate(applications: any[]): number {
  if (applications.length === 0) return 0;
  const hired = applications.filter((app) => app.currentStatus === 'SELECTED').length;
  return hired / applications.length;
}

/**
 * Extract skills in demand from all proposals
 */
export function getSkillsInDemand(applications: any[]): { skill: string; count: number }[] {
  const skillCounts: Record<string, number> = {};

  applications.forEach((app) => {
    const skills = parseSkills(app.proposal.skills || []);
    skills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Get application status distribution
 */
export function getApplicationsByStatus(applications: any[]): { status: string; count: number }[] {
  const statusCounts: Record<string, number> = {};

  applications.forEach((app) => {
    const status = app.currentStatus || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
}

/**
 * Forecast applications for next N months based on historical trend
 * Similar to population forecasting concept
 */
export function forecastApplicationTrend(applications: any[], forecastMonths: number = 6): {
  month: string;
  predicted: number;
}[] {
  // Group applications by submission month
  const monthlyApps: Record<string, number> = {};
  const now = new Date();

  applications.forEach((app) => {
    const date = new Date(app.submittedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyApps[key] = (monthlyApps[key] || 0) + 1;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyApps).sort();
  const values = sortedMonths.map((m) => monthlyApps[m]);

  // Simple linear trend calculation (like forecasting population change)
  let average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const trend =
    values.length > 1
      ? (values[values.length - 1] - values[0]) / (values.length - 1)
      : 0;

  // Generate forecasts
  const forecasts = [];
  for (let i = 1; i <= forecastMonths; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + i);
    const month = futureDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    const predicted = Math.max(0, Math.round(average + trend * (values.length + i)));
    forecasts.push({ month, predicted });
  }

  return forecasts;
}

/**
 * Analyze pipeline conversion rates (the conversion funnel)
 * Shows each stage of the recruitment pipeline with counts and percentages
 */
export function analyzePipelineConversion(applications: any[]): {
  stage: string;
  count: number;
  percentage: number;
  avgTimeInStage: number;
}[] {
  const statusFlow = [
    { stage: 'New', status: 'NEW' },
    { stage: 'Under Review', status: 'UNDER_REVIEW' },
    { stage: 'Shortlisted', status: 'SHORTLISTED' },
    { stage: 'Interview', status: 'INTERVIEW' },
    { stage: 'Selected', status: 'SELECTED' },
    { stage: 'Rejected', status: 'REJECTED' },
    { stage: 'Request Info', status: 'REQUEST_INFO' },
  ];

  const total = applications.length || 1;

  return statusFlow.map(({ stage, status }) => {
    const appsInStage = applications.filter((app) => app.currentStatus === status);
    const count = appsInStage.length;

    // Calculate average time in stage
    let avgTime = 0;
    if (appsInStage.length > 0) {
      const times = appsInStage.map((app) => {
        const created = new Date(app.submittedAt);
        const updated = new Date(app.updatedAt);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      });
      avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }

    return {
      stage,
      count,
      percentage: Math.round((count / total) * 100),
      avgTimeInStage: avgTime,
    };
  });
}

/**
 * Cluster candidates by performance score (like municipality clustering by aging rate, growth)
 */
export function clusterCandidates(applications: any[]): {
  cluster: string;
  count: number;
  avgScore: number;
  candidates: string[];
}[] {
  const scored = applications
    .map((app) => ({
      ...app,
      score: calculateApplicationScore(app, 0.7),
    }))
    .sort((a, b) => b.score - a.score);

  // Divide into performance clusters
  const clusters = [
    {
      name: 'High Performers',
      min: 0.75,
      max: 1.0,
      candidates: [] as any[],
    },
    {
      name: 'Strong Candidates',
      min: 0.5,
      max: 0.75,
      candidates: [] as any[],
    },
    {
      name: 'Potential Candidates',
      min: 0.25,
      max: 0.5,
      candidates: [] as any[],
    },
    { name: 'Development Needed', min: 0, max: 0.25, candidates: [] as any[] },
  ];

  scored.forEach((app) => {
    const cluster = clusters.find((c) => app.score >= c.min && app.score < c.max);
    if (cluster) {
      cluster.candidates.push(app);
    }
  });

  return clusters.map((c) => ({
    cluster: c.name,
    count: c.candidates.length,
    avgScore: c.candidates.length > 0 ? c.candidates.reduce((sum, a) => sum + a.score, 0) / c.candidates.length : 0,
    candidates: c.candidates.slice(0, 5).map((a) => a.proposal?.title || 'Unknown'),
  }));
}

/**
 * Detect anomalies in recruitment patterns (unusual shifts)
 */
export function detectAnomalies(applications: any[]): {
  anomalyType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}[] {
  const anomalies: { anomalyType: string; description: string; severity: 'low' | 'medium' | 'high' }[] = [];

  // Anomaly 1: Sudden drop in applications
  const monthlyApps: Record<string, number> = {};
  applications.forEach((app) => {
    const date = new Date(app.submittedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyApps[key] = (monthlyApps[key] || 0) + 1;
  });

  const values = Object.values(monthlyApps);
  if (values.length > 2) {
    const recent = values.slice(-3);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    if (recent[2] < average * 0.3) {
      anomalies.push({
        anomalyType: 'Application Drop',
        description: 'Recent application submissions are significantly below average.',
        severity: 'high',
      });
    }
  }

  // Anomaly 2: High rejection rate
  const rejectionRate =
    applications.filter((a) => a.currentStatus === 'REJECTED').length / (applications.length || 1);
  if (rejectionRate > 0.6) {
    anomalies.push({
      anomalyType: 'High Rejection Rate',
      description: `${Math.round(rejectionRate * 100)}% of applications are being rejected.`,
      severity: 'medium',
    });
  }

  // Anomaly 3: Long time in stage
  const stuckApps = applications.filter((app) => {
    const now = new Date();
    const updated = new Date(app.updatedAt);
    const days = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    return days > 30 && app.currentStatus !== 'SELECTED' && app.currentStatus !== 'REJECTED';
  });

  if (stuckApps.length > 0) {
    anomalies.push({
      anomalyType: 'Stalled Applications',
      description: `${stuckApps.length} application(s) have been inactive for more than 30 days.`,
      severity: stuckApps.length > 5 ? 'high' : 'medium',
    });
  }

  return anomalies;
}

/**
 * Get trending skills (similar to identifying regional trends)
 */
export function getTrendingSkills(applications: any[], limit: number = 8): {
  skill: string;
  demand: number;
  trend: 'up' | 'down' | 'stable';
}[] {
  const recentApps = applications.slice(-Math.max(10, Math.floor(applications.length / 2)));
  const allApps = applications;

  const getSkillCounts = (apps: any[]) => {
    const counts: Record<string, number> = {};
    apps.forEach((app) => {
      const skills = parseSkills(app.proposal?.skills || []);
      skills.forEach((skill) => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return counts;
  };

  const recentCounts = getSkillCounts(recentApps);
  const allCounts = getSkillCounts(allApps);

  const skills = Object.keys(recentCounts).slice(0, limit);

  return skills
    .map((skill) => {
      const recentDemand = recentCounts[skill] || 0;
      const totalDemand = allCounts[skill] || 0;
      const trend: 'up' | 'down' | 'stable' =
        recentDemand > totalDemand / recentApps.length * 1.2
          ? 'up'
          : recentDemand < totalDemand / recentApps.length * 0.8
            ? 'down'
            : 'stable';

      return {
        skill,
        demand: recentDemand,
        trend,
      };
    })
    .sort((a, b) => b.demand - a.demand);
}

/**
 * Calculate recruitment health score (0-100)
 */
export function calculateRecruitmentHealth(applications: any[]): {
  score: number;
  factors: { name: string; value: number; weight: number }[];
} {
  const factors = [];

  // Conversion rate (25%)
  const conversionRate = calculateConversionRate(applications);
  factors.push({
    name: 'Conversion Rate',
    value: conversionRate * 100,
    weight: 25,
  });

  // Time to hire (25%)
  const avgTimeToHire = calculateAverageTimeToHire(applications);
  const timeToHireScore = Math.max(0, 100 - avgTimeToHire);
  factors.push({
    name: 'Time to Hire Efficiency',
    value: timeToHireScore,
    weight: 25,
  });

  // Application volume (20%)
  const monthlyAvg = applications.length / Math.max(1, new Date().getMonth() + 1);
  const volumeScore = Math.min(100, (monthlyAvg / 2) * 100);
  factors.push({
    name: 'Application Volume',
    value: volumeScore,
    weight: 20,
  });

  // Quality score (30%)
  const avgQuality =
    applications.reduce((sum, app) => sum + calculateApplicationScore(app, 0.7), 0) /
    Math.max(1, applications.length);
  factors.push({
    name: 'Candidate Quality',
    value: avgQuality * 100,
    weight: 30,
  });

  const score = Math.round(
    factors.reduce((sum, f) => sum + (f.value / 100) * f.weight, 0)
  );

  return { score, factors };
}

/**
 * ADVANCED ML FEATURES FOR RECRUITMENT INTELLIGENCE
 */

/**
 * Calculate semantic similarity between two skill sets (0-1)
 * Uses string similarity and fuzzy matching
 */
function calculateSkillSimilarity(skill1: string, skill2: string): number {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Substring match (e.g., "JavaScript" contains "JS")
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  // Levenshtein distance similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const distance = levenshteinDistance(longer, shorter);
  const similarity = (longer.length - distance) / longer.length;

  return Math.max(0, Math.min(1, similarity));
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i++) track[0][i] = i;
  for (let j = 0; j <= s2.length; j++) track[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[s2.length][s1.length];
}

/**
 * Advanced skill matching with semantic similarity
 * Returns detailed match information
 */
export function advancedSkillMatch(
  studentSkills: string[],
  requiredSkills: string[]
): {
  overallScore: number;
  exactMatches: string[];
  partialMatches: { skill: string; match: string; similarity: number }[];
  missingSkills: string[];
  matchPercentage: number;
} {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      overallScore: 1,
      exactMatches: [],
      partialMatches: [],
      missingSkills: [],
      matchPercentage: 100,
    };
  }

  const normalized = studentSkills.map((s) => s.toLowerCase().trim());
  const exactMatches = requiredSkills.filter((req) =>
    normalized.includes(req.toLowerCase().trim())
  );

  const remaining = requiredSkills.filter(
    (req) => !normalized.includes(req.toLowerCase().trim())
  );
  const partialMatches: { skill: string; match: string; similarity: number }[] = [];

  remaining.forEach((required) => {
    let bestMatch: string | null = null;
    let bestSimilarity = 0.5; // Threshold: 50% similarity

    normalized.forEach((student) => {
      const similarity = calculateSkillSimilarity(required, student);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = student;
      }
    });

    if (bestMatch) {
      partialMatches.push({
        skill: required,
        match: bestMatch,
        similarity: bestSimilarity,
      });
    }
  });

  const missingSkills = remaining.filter(
    (skill) => !partialMatches.some((p) => p.skill === skill)
  );

  const overallScore =
    (exactMatches.length + partialMatches.length * 0.7) / requiredSkills.length;
  const matchPercentage = Math.round(
    ((exactMatches.length + partialMatches.length * 0.7) / requiredSkills.length) * 100
  );

  return {
    overallScore: Math.min(1, overallScore),
    exactMatches,
    partialMatches,
    missingSkills,
    matchPercentage,
  };
}

/**
 * CANDIDATE RECOMMENDATION SYSTEM
 * Given a proposal, recommend top candidates with detailed scoring
 */
export function recommendCandidatesForProposal(
  proposalId: string,
  proposalSkills: string[],
  allApplications: any[],
  topN: number = 5
): {
  candidateId: string;
  proposalTitle: string;
  recommendationScore: number;
  matchDetails: {
    skillMatchScore: number;
    experienceScore: number;
    successProbability: number;
    recommendationReason: string;
  };
  strengths: string[];
  gaps: string[];
}[] {
  const proposalApplications = allApplications.filter(
    (app) => app.proposalId === proposalId
  );

  const scored = proposalApplications.map((app) => {
    const studentSkills = parseSkills(app.proposal?.student?.skills || []);
    const skillMatch = advancedSkillMatch(studentSkills, proposalSkills);

    // Experience score: based on application history success
    const previousSuccessRate = allApplications
      .filter((a) => a.studentId === app.studentId)
      .filter((a) => a.currentStatus === 'SELECTED').length / Math.max(1, 
        allApplications.filter((a) => a.studentId === app.studentId).length
      );
    const experienceScore = previousSuccessRate;

    // Success probability: weighted combination
    const successProbability =
      skillMatch.overallScore * 0.5 +
      experienceScore * 0.3 +
      (app._count?.recruiterNotes || 0) / 5 * 0.2;

    const recommendationScore =
      skillMatch.overallScore * 0.4 +
      experienceScore * 0.3 +
      successProbability * 0.3;

    const strengths = [
      ...skillMatch.exactMatches.map((s) => `Has required skill: ${s}`),
      ...skillMatch.partialMatches.map(
        (p) => `Knows similar skill: ${p.match} (similar to ${p.skill})`
      ),
    ];

    if (experienceScore > 0.5) {
      strengths.push(`${Math.round(experienceScore * 100)}% past success rate`);
    }

    const gaps = skillMatch.missingSkills.map((s) => `Missing: ${s}`);

    return {
      candidateId: app.studentId,
      proposalTitle: app.proposal?.title || 'Unknown',
      recommendationScore: Math.min(1, Math.max(0, recommendationScore)),
      matchDetails: {
        skillMatchScore: skillMatch.overallScore,
        experienceScore,
        successProbability,
        recommendationReason:
          recommendationScore > 0.75
            ? 'Strong match - highly recommended'
            : recommendationScore > 0.5
              ? 'Moderate match - consider for interview'
              : 'Weak match - has skill gaps',
      },
      strengths,
      gaps,
    };
  });

  return scored
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, topN);
}

/**
 * HIRING SUCCESS PREDICTION MODEL
 * Predicts likelihood that a candidate will be hired
 */
export function predictHiringSuccess(application: any, allApplications: any[]): {
  successProbability: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  keyFactors: { factor: string; impact: number; direction: 'positive' | 'negative' }[];
  recommendation: string;
} {
  const factors: {
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }[] = [];

  // Factor 1: Skill match (30% weight)
  const studentSkills = parseSkills(application.student?.skills || []);
  const proposalSkills = parseSkills(application.proposal?.skills || []);
  const skillMatch = advancedSkillMatch(studentSkills, proposalSkills);
  factors.push({
    factor: 'Skill Match',
    impact: skillMatch.overallScore * 0.3,
    direction: skillMatch.overallScore > 0.6 ? 'positive' : 'negative',
  });

  // Factor 2: Application velocity (20% weight)
  const now = new Date();
  const submitted = new Date(application.submittedAt);
  const daysSinceSubmission = Math.floor(
    (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
  );
  const velocityScore = daysSinceSubmission > 30 ? 0.3 : daysSinceSubmission > 7 ? 0.7 : 1;
  factors.push({
    factor: 'Application Momentum',
    impact: velocityScore * 0.2,
    direction: velocityScore > 0.5 ? 'positive' : 'negative',
  });

  // Factor 3: Recruiter engagement (20% weight)
  const noteCount = application._count?.recruiterNotes || 0;
  const engagementScore = Math.min(noteCount / 5, 1);
  factors.push({
    factor: 'Recruiter Engagement',
    impact: engagementScore * 0.2,
    direction: engagementScore > 0.3 ? 'positive' : 'negative',
  });

  // Factor 4: Candidate history (15% weight)
  const candidateApps = allApplications.filter(
    (a) => a.studentId === application.studentId
  );
  const historySuccessRate =
    candidateApps.filter((a) => a.currentStatus === 'SELECTED').length /
    Math.max(1, candidateApps.length);
  factors.push({
    factor: 'Historical Success Rate',
    impact: historySuccessRate * 0.15,
    direction: historySuccessRate > 0.3 ? 'positive' : 'negative',
  });

  // Factor 5: Current status progression (15% weight)
  const statusScore =
    application.currentStatus === 'SELECTED'
      ? 1
      : application.currentStatus === 'INTERVIEW'
        ? 0.7
        : application.currentStatus === 'UNDER_REVIEW'
          ? 0.4
          : 0.1;
  factors.push({
    factor: 'Pipeline Stage',
    impact: statusScore * 0.15,
    direction: statusScore > 0.4 ? 'positive' : 'negative',
  });

  const successProbability = Math.min(
    1,
    factors.reduce((sum, f) => sum + f.impact, 0)
  );

  const confidenceLevel =
    candidateApps.length > 5 ? 'high' : candidateApps.length > 2 ? 'medium' : 'low';

  const recommendation =
    successProbability > 0.75
      ? '🎯 Highly likely to succeed - move to next stage'
      : successProbability > 0.5
        ? '⭐ Moderately likely - schedule interview'
        : successProbability > 0.25
          ? '⚠️ Low probability - consider skill development'
          : '❌ Very unlikely - recommend rejection';

  return {
    successProbability,
    confidenceLevel,
    keyFactors: factors,
    recommendation,
  };
}

/**
 * ADVANCED PIPELINE FORECASTING
 * Predicts future pipeline state with confidence intervals
 */
export function forecastPipelineState(
  applications: any[],
  monthsAhead: number = 6
): {
  month: string;
  predictedHires: number;
  predictedRejections: number;
  predictedInProgress: number;
  confidence: number;
}[] {
  const monthlyData: Record<
    string,
    { hires: number; rejections: number; inProgress: number }
  > = {};

  applications.forEach((app) => {
    const date = new Date(app.updatedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[key]) {
      monthlyData[key] = { hires: 0, rejections: 0, inProgress: 0 };
    }

    if (app.currentStatus === 'SELECTED') monthlyData[key].hires++;
    else if (app.currentStatus === 'REJECTED') monthlyData[key].rejections++;
    else monthlyData[key].inProgress++;
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const recentMonths = sortedMonths.slice(-3);

  const avgHires =
    recentMonths.reduce((sum, m) => sum + monthlyData[m].hires, 0) /
    Math.max(1, recentMonths.length);
  const avgRejections =
    recentMonths.reduce((sum, m) => sum + monthlyData[m].rejections, 0) /
    Math.max(1, recentMonths.length);
  const avgInProgress =
    recentMonths.reduce((sum, m) => sum + monthlyData[m].inProgress, 0) /
    Math.max(1, recentMonths.length);

  const forecasts = [];
  const now = new Date();

  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + i);
    const month = futureDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });

    // Add slight seasonality factor
    const seasonality = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.2;

    forecasts.push({
      month,
      predictedHires: Math.round(avgHires * seasonality),
      predictedRejections: Math.round(avgRejections * seasonality),
      predictedInProgress: Math.round(avgInProgress * seasonality),
      confidence: sortedMonths.length > 6 ? 0.8 : sortedMonths.length > 3 ? 0.6 : 0.4,
    });
  }

  return forecasts;
}

/**
 * SKILL DEMAND & MARKET INTELLIGENCE
 * Analyze which skills are most valuable and trending
 */
export function analyzeSkillDemandIntelligence(applications: any[]): {
  skill: string;
  demandScore: number;
  hiringSuccessRate: number;
  trend: 'up' | 'down' | 'stable';
  averageTimeToHire: number;
}[] {
  const skillStats: Record<
    string,
    { count: number; hires: number; totalDays: number; daysCount: number }
  > = {};

  applications.forEach((app) => {
    const skills = parseSkills(app.proposal?.skills || []);
    const submitted = new Date(app.submittedAt);
    const updated = new Date(app.updatedAt);
    const days = Math.floor((updated.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));

    skills.forEach((skill) => {
      if (!skillStats[skill]) {
        skillStats[skill] = { count: 0, hires: 0, totalDays: 0, daysCount: 0 };
      }
      skillStats[skill].count++;
      if (app.currentStatus === 'SELECTED') {
        skillStats[skill].hires++;
        skillStats[skill].totalDays += days;
        skillStats[skill].daysCount++;
      }
    });
  });

  const recentApps = applications.slice(-Math.max(10, Math.floor(applications.length / 2)));
  const recentSkills: Record<string, number> = {};

  recentApps.forEach((app) => {
    const skills = parseSkills(app.proposal?.skills || []);
    skills.forEach((skill) => {
      recentSkills[skill] = (recentSkills[skill] || 0) + 1;
    });
  });

  return Object.entries(skillStats)
    .map(([skill, stats]) => {
      const demandScore = Math.min(1, stats.count / Math.max(5, applications.length / 2));
      const hiringSuccessRate = stats.count > 0 ? stats.hires / stats.count : 0;
      const averageTimeToHire =
        stats.daysCount > 0 ? Math.round(stats.totalDays / stats.daysCount) : 0;

      const recentDemand = recentSkills[skill] || 0;
      const baselineCount = stats.count / applications.length;
      const recentCount = recentDemand / recentApps.length;

      const trend: 'up' | 'down' | 'stable' =
        recentCount > baselineCount * 1.2
          ? 'up'
          : recentCount < baselineCount * 0.8
            ? 'down'
            : 'stable';

      return {
        skill,
        demandScore,
        hiringSuccessRate: Math.round(hiringSuccessRate * 100) / 100,
        trend,
        averageTimeToHire,
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 15);
}

/**
 * CANDIDATE SIMILARITY CLUSTERING
 * Find similar candidates for team building
 */
export function findSimilarCandidates(
  targetCandidateId: string,
  allApplications: any[],
  similarityThreshold: number = 0.6
): {
  candidateId: string;
  similarity: number;
  commonSkills: string[];
  complementarySkills: string[];
}[] {
  const targetApp = allApplications.find(
    (a) => a.studentId === targetCandidateId
  );
  if (!targetApp) return [];

  const targetSkills = parseSkills(targetApp.student?.skills || []);

  const otherApplications = allApplications.filter(
    (a) => a.studentId !== targetCandidateId
  );

  return otherApplications
    .map((app) => {
      const otherSkills = parseSkills(app.student?.skills || []);

      // Find common skills
      const commonSkills = targetSkills.filter((skill) =>
        otherSkills.some(
          (o) => calculateSkillSimilarity(skill, o) > similarityThreshold
        )
      );

      // Find complementary skills
      const complementarySkills = otherSkills.filter(
        (skill) =>
          !targetSkills.some(
            (t) => calculateSkillSimilarity(skill, t) > similarityThreshold
          )
      );

      // Similarity score
      const similarity =
        commonSkills.length / Math.max(1, Math.max(targetSkills.length, otherSkills.length));

      return {
        candidateId: app.studentId,
        similarity,
        commonSkills,
        complementarySkills,
      };
    })
    .filter((c) => c.similarity > similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
}

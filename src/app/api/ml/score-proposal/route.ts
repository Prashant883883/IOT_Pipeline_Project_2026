import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  advancedSkillMatch,
  parseSkills,
  calculateApplicationScore,
  calculateSkillsMatch,
} from '@/lib/ml-analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      proposalId,
      studentId,
      studentSkills,
      requiredSkills,
    } = body;

    // Method 1: Score based on text quality only
    if (text && !proposalId && !studentId && !studentSkills) {
      const score = calculateTextQualityScore(text);

      return NextResponse.json({
        success: true,
        scoreType: 'textQuality',
        score: Math.round(score * 100),
        message: 'Proposal text quality scored',
        details: {
          lengthRating: text.length > 500 ? 'Good' : 'Moderate',
          depthRating: calculateDepthRating(text),
          profesionalismRating: calculateProfessionalismRating(text),
        },
      });
    }

    // Method 2: Score student-proposal skill match
    if (proposalId && studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!student || !proposal) {
        return NextResponse.json(
          { error: 'Student or proposal not found' },
          { status: 404 }
        );
      }

      const studentSkillsArray = parseSkills(student.skills || []);
      const proposalSkillsArray = parseSkills(proposal.skills || []);
      const matchResult = advancedSkillMatch(studentSkillsArray, proposalSkillsArray);

      return NextResponse.json({
        success: true,
        scoreType: 'skillMatch',
        score: matchResult.matchPercentage,
        overallScore: Math.round(matchResult.overallScore * 100),
        message: 'Student-proposal skill match scored',
        details: {
          exactMatches: matchResult.exactMatches.length,
          partialMatches: matchResult.partialMatches.length,
          missingSkills: matchResult.missingSkills.length,
          totalRequired: proposalSkillsArray.length,
        },
      });
    }

    // Method 3: Score direct skill arrays
    if (studentSkills && requiredSkills) {
      const studentArray = parseSkills(studentSkills);
      const requiredArray = parseSkills(requiredSkills);
      const matchResult = advancedSkillMatch(studentArray, requiredArray);

      return NextResponse.json({
        success: true,
        scoreType: 'skillMatch',
        score: matchResult.matchPercentage,
        overallScore: Math.round(matchResult.overallScore * 100),
        message: 'Direct skill array match scored',
        details: {
          exactMatches: matchResult.exactMatches,
          partialMatches: matchResult.partialMatches.map((p) => ({
            required: p.skill,
            candidate: p.match,
            similarity: Math.round(p.similarity * 100),
          })),
          missingSkills: matchResult.missingSkills,
        },
      });
    }

    return NextResponse.json(
      {
        error:
          'Provide either text OR (proposalId + studentId) OR (studentSkills + requiredSkills)',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Score proposal error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to score proposal' },
      { status: 500 }
    );
  }
}

/**
 * Calculate text quality score based on structure and content
 * Higher score = better quality proposal
 */
function calculateTextQualityScore(text: string): number {
  if (!text || text.length === 0) return 0;

  let score = 0;

  // Length score (0-0.3)
  const lengthScore = Math.min(text.length / 500, 1) * 0.3;
  score += lengthScore;

  // Word count score (0-0.3)
  const wordCount = text.trim().split(/\s+/).length;
  const wordScore = Math.min(wordCount / 100, 1) * 0.3;
  score += wordScore;

  // Keyword presence (0-0.4)
  const keywords = [
    'experience',
    'skills',
    'expertise',
    'project',
    'achieved',
    'implemented',
    'developed',
    'designed',
    'leadership',
    'team',
  ];
  const keywordCount = keywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const keywordScore = (keywordCount / keywords.length) * 0.4;
  score += keywordScore;

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Calculate depth rating based on text complexity and detail level
 */
function calculateDepthRating(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const avgWordsPerSentence = text.split(/\s+/).length / Math.max(1, sentences);

  if (avgWordsPerSentence > 15 && sentences > 5) return 'Excellent';
  if (avgWordsPerSentence > 12 && sentences > 3) return 'Good';
  if (avgWordsPerSentence > 8) return 'Fair';
  return 'Basic';
}

/**
 * Calculate professionalism rating based on language quality
 */
function calculateProfessionalismRating(text: string): string {
  const lowercase = text.toLowerCase();
  const hasSlang = /\b(gonna|wanna|gotta|kinda|sorta)\b/.test(lowercase);
  const hasExclamation = (text.match(/!/g) || []).length > 3;
  const hasProperSentences = /^[A-Z].*\.$/.test(text.split('\n').join(' '));

  let score = 0;
  if (!hasSlang) score += 1;
  if (!hasExclamation) score += 1;
  if (hasProperSentences) score += 1;

  if (score >= 3) return 'Professional';
  if (score >= 2) return 'Semi-Professional';
  return 'Casual';
}

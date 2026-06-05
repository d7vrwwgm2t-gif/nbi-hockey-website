export function getLetterGrade(score: number | null) {
  if (score === null) return null;

  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "B-";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

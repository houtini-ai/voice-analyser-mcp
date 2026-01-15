import { analyzeArgumentFlow } from './dist/analyzers/argument-flow.js';
import { analyzeParagraphTransitions } from './dist/analyzers/paragraph-transitions.js';
import { analyzeSpecificityPatterns } from './dist/analyzers/specificity-patterns.js';
import { analyzeVulnerabilityPatterns } from './dist/analyzers/vulnerability-patterns.js';

console.log('All imports successful!');
console.log('Functions available:',{
  analyzeArgumentFlow: typeof analyzeArgumentFlow,
  analyzeParagraphTransitions: typeof analyzeParagraphTransitions,
  analyzeSpecificityPatterns: typeof analyzeSpecificityPatterns,
  analyzeVulnerabilityPatterns: typeof analyzeVulnerabilityPatterns
});

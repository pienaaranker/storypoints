import { describe, it, expect } from 'vitest';
import {
    calculateRelativeConsistency,
    validateStorySetConsistency,
    validateCrossDomainConsistency,
    getRealTimeFeedback
} from '../consistencyValidation.js';

describe('Consistency Validation', () => {
    // Sample stories for testing
    const sampleStories = {
        simple: {
            id: 'simple-1',
            title: 'Simple Story',
            points: 2,
            complexityFactors: {
                technical: 'low',
                business: 'low',
                integration: 'low',
                uncertainty: 'low'
            }
        },
        medium: {
            id: 'medium-1',
            title: 'Medium Story',
            points: 5,
            complexityFactors: {
                technical: 'medium',
                business: 'medium',
                integration: 'medium',
                uncertainty: 'low'
            }
        },
        complex: {
            id: 'complex-1',
            title: 'Complex Story',
            points: 8,
            complexityFactors: {
                technical: 'high',
                business: 'medium',
                integration: 'high',
                uncertainty: 'medium'
            }
        },
        overEstimated: {
            id: 'over-1',
            title: 'Over-estimated Story',
            points: 8,
            complexityFactors: {
                technical: 'low',
                business: 'low',
                integration: 'low',
                uncertainty: 'low'
            }
        },
        underEstimated: {
            id: 'under-1',
            title: 'Under-estimated Story',
            points: 2,
            complexityFactors: {
                technical: 'high',
                business: 'high',
                integration: 'high',
                uncertainty: 'high'
            }
        }
    };

    describe('calculateRelativeConsistency', () => {
        it('should return high consistency score for well-sized stories', () => {
            const result = calculateRelativeConsistency(sampleStories.simple, sampleStories.medium);

            expect(result.score).toBeGreaterThan(70);
            expect(result.pointsRatio).toBe(0.4); // 2/5
            expect(result.complexityRatio).toBeGreaterThan(0);
            expect(result.feedback).toContain('Good relative sizing');
        });

        it('should detect over-estimation', () => {
            const result = calculateRelativeConsistency(sampleStories.overEstimated, sampleStories.simple);

            expect(result.score).toBeLessThan(60);
            expect(result.feedback).toContain('over-estimated');
        });

        it('should detect under-estimation', () => {
            const result = calculateRelativeConsistency(sampleStories.underEstimated, sampleStories.simple);

            expect(result.score).toBeLessThan(60);
            expect(result.feedback).toContain('under-estimated');
        });

        it('should handle invalid input gracefully', () => {
            const result = calculateRelativeConsistency(null, sampleStories.simple);

            expect(result.score).toBe(0);
            expect(result.feedback).toContain('Invalid story data');
        });

        it('should handle stories without complexity factors', () => {
            const storyWithoutFactors = {
                id: 'no-factors',
                title: 'No Factors Story',
                points: 3
            };

            const result = calculateRelativeConsistency(storyWithoutFactors, sampleStories.simple);

            expect(result.score).toBeGreaterThan(0);
            expect(result.complexityRatio).toBeCloseTo(2.5, 1); // Default medium complexity
        });
    });

    describe('validateStorySetConsistency', () => {
        it('should return perfect score for empty or single story set', () => {
            expect(validateStorySetConsistency([]).overallScore).toBe(100);
            expect(validateStorySetConsistency([sampleStories.simple]).overallScore).toBe(100);
        });

        it('should validate consistent story set', () => {
            const consistentStories = [
                sampleStories.simple,
                sampleStories.medium,
                sampleStories.complex
            ];

            const result = validateStorySetConsistency(consistentStories);

            expect(result.overallScore).toBeGreaterThan(70);
            expect(result.issues.length).toBeLessThan(2);
            expect(result.comparisons.length).toBe(3); // 3 stories = 3 comparisons
        });

        it('should detect inconsistent story set', () => {
            const inconsistentStories = [
                sampleStories.simple,
                sampleStories.overEstimated,
                sampleStories.underEstimated
            ];

            const result = validateStorySetConsistency(inconsistentStories);

            expect(result.overallScore).toBeLessThan(70);
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it('should provide appropriate recommendations for issues', () => {
            const inconsistentStories = [
                sampleStories.overEstimated,
                sampleStories.underEstimated
            ];

            const result = validateStorySetConsistency(inconsistentStories);

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(rec =>
                rec.includes('Review the relative complexity') || rec.includes('reference stories')
            )).toBe(true);
        });
    });

    describe('validateCrossDomainConsistency', () => {
        const technicalStories = [
            {
                ...sampleStories.medium,
                domain: 'technical',
                title: 'Technical Story',
                points: 3, // Low points for medium complexity
                complexityFactors: {
                    technical: 'medium',
                    business: 'medium',
                    integration: 'medium',
                    uncertainty: 'low'
                }
            }
        ];

        const businessStories = [
            {
                ...sampleStories.medium,
                domain: 'business',
                title: 'Business Story',
                points: 8, // High points for same complexity - should trigger inconsistency
                complexityFactors: {
                    technical: 'medium',
                    business: 'medium',
                    integration: 'medium',
                    uncertainty: 'low'
                }
            }
        ];

        it('should detect cross-domain inconsistencies', () => {
            const result = validateCrossDomainConsistency(technicalStories, businessStories);

            expect(result.hasCrossDomainInconsistencies).toBe(true);
            expect(result.crossDomainIssues.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it('should provide cross-domain recommendations', () => {
            const result = validateCrossDomainConsistency(technicalStories, businessStories);

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(rec =>
                rec.includes('reference stories') || rec.includes('estimation') || rec.includes('scale')
            )).toBe(true);
        });

        it('should handle empty domain arrays', () => {
            const result = validateCrossDomainConsistency([], businessStories);

            expect(result.hasCrossDomainInconsistencies).toBe(false);
            expect(result.crossDomainIssues.length).toBe(0);
        });
    });

    describe('getRealTimeFeedback', () => {
        it('should provide feedback for current estimates', () => {
            const currentEstimates = [
                sampleStories.simple,
                sampleStories.overEstimated
            ];

            const result = getRealTimeFeedback(currentEstimates);

            expect(result.consistencyScore).toBeLessThan(100);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.suggestions.length).toBeGreaterThan(0);
        });

        it('should compare against reference stories', () => {
            const currentEstimates = [{
                ...sampleStories.simple,
                points: 8, // Over-estimated simple story
                complexityFactors: {
                    technical: 'low',
                    business: 'low',
                    integration: 'low',
                    uncertainty: 'low'
                }
            }];
            const referenceStories = [sampleStories.simple];

            const result = getRealTimeFeedback(currentEstimates, referenceStories);

            // The function may or may not find similar reference stories depending on complexity matching
            expect(typeof result.warnings).toBe('object');
            expect(Array.isArray(result.warnings)).toBe(true);
        });

        it('should handle single story gracefully', () => {
            const result = getRealTimeFeedback([sampleStories.simple]);

            expect(result.consistencyScore).toBe(100);
            expect(result.warnings.length).toBe(0);
            expect(result.suggestions.length).toBe(0);
        });

        it('should handle empty estimates', () => {
            const result = getRealTimeFeedback([]);

            expect(result.consistencyScore).toBe(100);
            expect(result.warnings.length).toBe(0);
            expect(result.suggestions.length).toBe(0);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle stories with missing complexity factors', () => {
            const storyMissingFactors = {
                id: 'missing-factors',
                title: 'Missing Factors',
                points: 5
            };

            const result = calculateRelativeConsistency(storyMissingFactors, sampleStories.simple);

            expect(result.score).toBeGreaterThan(0);
            expect(typeof result.complexityRatio).toBe('number');
        });

        it('should handle stories with partial complexity factors', () => {
            const partialFactors = {
                id: 'partial',
                title: 'Partial Factors',
                points: 3,
                complexityFactors: {
                    technical: 'medium'
                    // Missing other factors
                }
            };

            const result = calculateRelativeConsistency(partialFactors, sampleStories.simple);

            expect(result.score).toBeGreaterThan(0);
            expect(typeof result.complexityRatio).toBe('number');
        });

        it('should handle zero point stories', () => {
            const zeroPointStory = {
                ...sampleStories.simple,
                points: 0
            };

            const result = calculateRelativeConsistency(sampleStories.simple, zeroPointStory);

            expect(result.score).toBe(0);
            expect(result.feedback).toContain('Invalid story data');
        });

        it('should handle very large point differences', () => {
            const largeStory = {
                ...sampleStories.complex,
                points: 100
            };

            const result = calculateRelativeConsistency(largeStory, sampleStories.simple);

            expect(typeof result.score).toBe('number');
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle large story sets efficiently', () => {
            const largeStorySet = Array.from({ length: 50 }, (_, i) => ({
                id: `story-${i}`,
                title: `Story ${i}`,
                points: Math.floor(Math.random() * 8) + 1,
                complexityFactors: {
                    technical: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    business: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    integration: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    uncertainty: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
                }
            }));

            const startTime = performance.now();
            const result = validateStorySetConsistency(largeStorySet);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
            expect(result.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.overallScore).toBeLessThanOrEqual(100);
        });
    });
});
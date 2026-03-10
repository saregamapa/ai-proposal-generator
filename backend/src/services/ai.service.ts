import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface ProposalInput {
  clientName: string;
  companyName: string;
  industry: string;
  services: string[];
  budget?: string;
  timeline?: string;
  additionalContext?: string;
}

export const aiService = {
  async generateProposal(input: ProposalInput): Promise<any> {
    logger.info('Generating AI proposal', { company: input.companyName });
    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are an expert business proposal writer. Return valid JSON only.' },
          { role: 'user', content: `Generate a complete business proposal for ${input.companyName} in ${input.industry}. Services: ${input.services.join(', ')}. Return JSON with executiveSummary, clientProblem, proposedSolution, scopeOfWork, deliverables, timeline (array), pricingTable (array), terms, nextSteps, totalAmount.` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0].message.content;
      if (!content) throw new AppError('AI returned empty response', 500);
      const parsed = JSON.parse(content);
      const totalAmount = parsed.pricingTable?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || parsed.totalAmount || 0;
      return { ...parsed, totalAmount, tokensUsed: response.usage?.total_tokens || 0 };
    } catch (err: any) {
      if (err instanceof SyntaxError) throw new AppError('AI generation failed — invalid response format', 500);
      if (err?.status === 429) throw new AppError('AI service rate limit reached. Please try again in a moment.', 429);
      throw err;
    }
  },
  async improveSection(section: string, content: string, instructions: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: 'You are a professional business writer. Improve the given proposal section. Return only the improved text.' },
        { role: 'user', content: `Section: ${section}\n\nContent:\n${content}\n\nInstructions: ${instructions}` },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });
    return response.choices[0].message.content || content;
  },
};

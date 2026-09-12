import { Response } from 'express';
import { prisma } from '../../index';
import { AuthRequest } from '../middleware/authMiddleware';

export const searchAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { query, classification, caseId } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { title: { contains: query as string } },
              { description: { contains: query as string } }
            ]
          } : {},
          classification ? { classification: classification as string } : {},
          caseId ? { caseId: caseId as string } : {}
        ]
      },
      include: {
        caseRecord: true,
        creator: { select: { firstName: true, lastName: true, badgeNumber: true, department: true } }
      }
    });

    res.status(200).json({
      message: 'Search completed successfully.',
      count: documents.length,
      results: documents
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Failed to execute search.' });
  }
};

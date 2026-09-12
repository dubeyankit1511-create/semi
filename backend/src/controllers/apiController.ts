import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Users
export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

// Documents
export const getDocuments = async (_req: Request, res: Response) => {
  const docs = await prisma.document.findMany({ include: { creator: true } });
  res.json(docs);
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.create({
      data: req.body
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Audit Logs
export const getAuditLogs = async (_req: Request, res: Response) => {
  const logs = await prisma.auditLog.findMany({ 
    include: { user: true },
    orderBy: { timestamp: 'desc' }
  });
  res.json(logs);
};

export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const log = await prisma.auditLog.create({
      data: req.body
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
};

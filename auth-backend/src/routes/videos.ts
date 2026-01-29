import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user's videos
router.get('/', authenticate, async (req: any, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save video after transcoding
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { originalFileName, originalFileSize, cloudfrontUrl, status } = req.body;

    if (!originalFileName || !cloudfrontUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const video = await prisma.video.create({
      data: {
        userId: req.userId,
        originalFileName,
        originalFileSize: originalFileSize || 0,
        cloudfrontUrl,
        status: status || 'completed',
      },
    });

    res.json({ video });
  } catch (error) {
    console.error('Save video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete video
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({ where: { id } });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.video.delete({ where: { id } });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

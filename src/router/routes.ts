import express from 'express';
import { savePhoto, findPhoto } from '../controllers';
import { findNews, saveNews } from '../controllers/News.usecase';

const router = express.Router();

router.post('/photo', async (req, res) => {
  try {
    const photo = await savePhoto(req.body);
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/photos', async (req, res) => {
  try {
    const photos = await findPhoto();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.post('/news', async (req, res) => {
  try {
    const news = await saveNews(req.body);
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/news', async (req, res) => {
  try {
    const news = await findNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;

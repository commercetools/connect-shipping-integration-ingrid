import express from 'express';
import { createIngridSession } from '../services/ingridService';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    // Pass any necessary payload data from the request to the Ingrid API
    const sessionData = await createIngridSession();
    res.json({ htmlSnippet: sessionData.html_snippet });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;

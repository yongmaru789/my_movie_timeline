import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';

export const moviesRouter = Router();


moviesRouter.get('/', (req, res) => {
  const userId = req.query.userId;
  const movies = db.getMoviesByUser(userId);
  res.json({ ok: true, movies });
});


moviesRouter.post('/', (req, res) => {
  const { userId, date, title, comment, poster, tmdbId, genres } = req.body || {};
  if (!userId || !date || !title) {
    return res.status(400).json({ ok: false, error: 'userId, date, title required' });
  }
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const movie = { id, userId, date, title, comment: comment || '', poster: poster || '', tmdbId, genres: Array.isArray(genres) ? genres : [] };
  db.addMovie(movie);
  res.status(201).json({ ok: true, movie });
});

moviesRouter.put('/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });

  const existingList = db.getMoviesByUser(body.userId); 
  const existing = db.getAll().movies.find(m => m.id === id);
  if (!existing) return res.status(404).json({ ok: false, error: 'not found' });

  const updated = { ...existing, ...body, id };
  const saved = db.updateMovie(updated);
  res.json({ ok: true, movie: saved });
});

moviesRouter.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });
  const removed = db.deleteMovie(id);
  if (!removed) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true });
});

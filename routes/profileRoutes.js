import express from 'express';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

// Route: Analyze and save a profile by username
router.post('/profiles/:username', profileController.analyzeAndSave);

// Route: Get all stored profiles list
router.get('/profiles', profileController.getProfiles);

// Route: Get stored data/insights of a single profile
router.get('/profiles/:username', profileController.getProfile);

// Route: Force refresh profile data from GitHub
router.put('/profiles/:username/refresh', profileController.refreshProfile);

// Route: Delete profile analysis from DB
router.delete('/profiles/:username', profileController.deleteProfile);

export default router;

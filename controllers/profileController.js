import * as githubService from '../utils/githubService.js';
import * as profileModel from '../models/profileModel.js';

/**
 * Trigger analysis of a GitHub username and save/update the results in the DB.
 * POST /api/profiles/:username
 */
export async function analyzeAndSave(req, res) {
  const { username } = req.params;

  if (!username || username.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Username parameter is required.'
    });
  }

  try {
    console.log(`Analyzing GitHub profile for user: ${username}`);
    const analysisResult = await githubService.analyzeProfile(username);
    
    console.log(`Saving profile analysis to database for user: ${username}`);
    await profileModel.saveProfile(analysisResult);

    // Fetch the updated profile details from DB to return complete structure
    const savedProfile = await profileModel.getProfileByUsername(analysisResult.username);

    return res.status(201).json({
      success: true,
      message: 'GitHub profile analyzed and saved successfully.',
      data: savedProfile
    });
  } catch (error) {
    console.error(`Error in analyzeAndSave for user ${username}:`, error.message);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Fetch list of all analyzed profiles stored in the DB.
 * GET /api/profiles
 */
export async function getProfiles(req, res) {
  try {
    const profiles = await profileModel.getAllProfiles();
    return res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles from the database.',
      error: error.message
    });
  }
}

/**
 * Fetch a single stored profile's detailed insights from the DB.
 * GET /api/profiles/:username
 */
export async function getProfile(req, res) {
  const { username } = req.params;

  try {
    const profile = await profileModel.getProfileByUsername(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Profile for user "${username}" was not found in the database. Use POST /api/profiles/${username} to analyze and save it first.`
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(`Error fetching profile for user ${username}:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile details.',
      error: error.message
    });
  }
}

/**
 * Force refresh a profile by re-fetching from GitHub API and updating the DB.
 * PUT /api/profiles/:username/refresh
 */
export async function refreshProfile(req, res) {
  const { username } = req.params;

  try {
    // Check if the profile exists in DB first
    const existing = await profileModel.getProfileByUsername(username);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Profile for user "${username}" does not exist in the database. Use POST /api/profiles/${username} to analyze it first.`
      });
    }

    console.log(`Refreshing GitHub profile analysis for: ${username}`);
    const updatedAnalysis = await githubService.analyzeProfile(username);
    await profileModel.saveProfile(updatedAnalysis);

    const refreshedProfile = await profileModel.getProfileByUsername(updatedAnalysis.username);

    return res.status(200).json({
      success: true,
      message: 'GitHub profile data refreshed successfully.',
      data: refreshedProfile
    });
  } catch (error) {
    console.error(`Error refreshing profile for user ${username}:`, error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Delete a profile analysis from the DB.
 * DELETE /api/profiles/:username
 */
export async function deleteProfile(req, res) {
  const { username } = req.params;

  try {
    const deleted = await profileModel.deleteProfileByUsername(username);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Profile for user "${username}" not found in database.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Profile for user "${username}" deleted successfully from database.`
    });
  } catch (error) {
    console.error(`Error deleting profile for user ${username}:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete profile.',
      error: error.message
    });
  }
}

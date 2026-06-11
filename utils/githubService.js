import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Create an Axios instance with base configuration
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'github-profile-analyzer-api'
  }
});

// Attach GITHUB_TOKEN if it is available to increase rate limits
if (process.env.GITHUB_TOKEN) {
  githubApi.defaults.headers.common['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

/**
 * Fetches user profile data from GitHub.
 * @param {string} username - GitHub username.
 * @returns {Promise<Object>} User profile data.
 */
export async function fetchUserProfile(username) {
  try {
    const response = await githubApi.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`GitHub user "${username}" not found.`);
    }
    throw new Error(`Failed to fetch profile for "${username}": ${error.message}`);
  }
}

/**
 * Fetches all public repositories for a GitHub user (supports pagination up to 3 pages / 300 repos).
 * @param {string} username - GitHub username.
 * @returns {Promise<Array>} List of repositories.
 */
export async function fetchUserRepos(username) {
  const repos = [];
  let page = 1;
  const perPage = 100;
  const maxPages = 3; // Limit to 300 repos to prevent excessive API requests

  try {
    while (page <= maxPages) {
      const response = await githubApi.get(`/users/${username}/repos`, {
        params: {
          page,
          per_page: perPage,
          sort: 'updated'
        }
      });

      const pageRepos = response.data;
      if (!pageRepos || pageRepos.length === 0) {
        break;
      }

      repos.push(...pageRepos);

      // If we got fewer items than requested, we reached the end
      if (pageRepos.length < perPage) {
        break;
      }
      page++;
    }
    return repos;
  } catch (error) {
    throw new Error(`Failed to fetch repositories for "${username}": ${error.message}`);
  }
}

/**
 * Analyzes GitHub profile and repository data to extract useful insights.
 * @param {string} username - GitHub username.
 * @returns {Promise<Object>} Complete profile data & computed insights.
 */
export async function analyzeProfile(username) {
  // Fetch profile and repos in parallel
  const [profile, repos] = await Promise.all([
    fetchUserProfile(username),
    fetchUserRepos(username)
  ]);

  let totalStars = 0;
  let totalForks = 0;
  let openIssuesCount = 0;
  const languageCounts = {};
  let popularRepoName = null;
  let popularRepoStars = -1;

  // Process repository statistics
  repos.forEach(repo => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    openIssuesCount += repo.open_issues_count || 0;

    // Track language usage counts
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }

    // Determine the most popular repository
    if (repo.stargazers_count > popularRepoStars) {
      popularRepoStars = repo.stargazers_count;
      popularRepoName = repo.name;
    }
  });

  // Calculate language distribution percentages
  const totalLanguagesCount = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
  const repoLanguages = {};
  let primaryLanguage = null;
  let maxLangCount = 0;

  Object.entries(languageCounts).forEach(([lang, count]) => {
    const percentage = totalLanguagesCount > 0 
      ? parseFloat(((count / totalLanguagesCount) * 100).toFixed(1)) 
      : 0;
    
    repoLanguages[lang] = {
      count,
      percentage
    };

    if (count > maxLangCount) {
      maxLangCount = count;
      primaryLanguage = lang;
    }
  });

  return {
    username: profile.login,
    name: profile.name || null,
    avatar_url: profile.avatar_url || null,
    html_url: profile.html_url || null,
    bio: profile.bio || null,
    location: profile.location || null,
    blog: profile.blog || null,
    company: profile.company || null,
    followers: profile.followers || 0,
    following: profile.following || 0,
    public_repos: profile.public_repos || 0,
    total_stars: totalStars,
    total_forks: totalForks,
    primary_language: primaryLanguage,
    repo_languages: repoLanguages,
    popular_repo_name: popularRepoName,
    popular_repo_stars: popularRepoStars >= 0 ? popularRepoStars : 0,
    open_issues_count: openIssuesCount
  };
}

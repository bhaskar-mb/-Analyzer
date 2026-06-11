import db from '../config/db.js';

/**
 * Saves or updates a GitHub profile's analyzed insights in the database.
 * @param {Object} data - The analyzed profile data.
 * @returns {Promise<boolean>} True if successful.
 */
export async function saveProfile(data) {
  const query = `
    INSERT INTO github_profiles (
      username, name, avatar_url, html_url, bio, location, blog, company,
      followers, following, public_repos, total_stars, total_forks,
      primary_language, repo_languages, popular_repo_name, popular_repo_stars,
      open_issues_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      html_url = VALUES(html_url),
      bio = VALUES(bio),
      location = VALUES(location),
      blog = VALUES(blog),
      company = VALUES(company),
      followers = VALUES(followers),
      following = VALUES(following),
      public_repos = VALUES(public_repos),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      primary_language = VALUES(primary_language),
      repo_languages = VALUES(repo_languages),
      popular_repo_name = VALUES(popular_repo_name),
      popular_repo_stars = VALUES(popular_repo_stars),
      open_issues_count = VALUES(open_issues_count)
  `;

  const values = [
    data.username,
    data.name,
    data.avatar_url,
    data.html_url,
    data.bio,
    data.location,
    data.blog,
    data.company,
    data.followers,
    data.following,
    data.public_repos,
    data.total_stars,
    data.total_forks,
    data.primary_language,
    JSON.stringify(data.repo_languages), // Save languages JSON as string
    data.popular_repo_name,
    data.popular_repo_stars,
    data.open_issues_count
  ];

  const [result] = await db.execute(query, values);
  return result.affectedRows > 0;
}

/**
 * Retrieves a list of all analyzed profiles stored in the database.
 * @returns {Promise<Array>} List of basic profile info.
 */
export async function getAllProfiles() {
  const query = `
    SELECT 
      username, name, avatar_url, html_url, bio, location,
      followers, public_repos, total_stars, primary_language, updated_at
    FROM github_profiles
    ORDER BY updated_at DESC
  `;
  const [rows] = await db.execute(query);
  return rows;
}

/**
 * Retrieves the full insights details of a single profile.
 * @param {string} username - GitHub username.
 * @returns {Promise<Object|null>} The complete profile details, or null if not found.
 */
export async function getProfileByUsername(username) {
  const query = `SELECT * FROM github_profiles WHERE username = ?`;
  const [rows] = await db.execute(query, [username]);
  
  if (rows.length === 0) {
    return null;
  }

  const profile = rows[0];
  // Parse the languages JSON column back into a JavaScript object
  if (profile.repo_languages) {
    try {
      profile.repo_languages = JSON.parse(profile.repo_languages);
    } catch (e) {
      profile.repo_languages = {};
    }
  }
  
  return profile;
}

/**
 * Deletes an analyzed profile from the database.
 * @param {string} username - GitHub username.
 * @returns {Promise<boolean>} True if a row was deleted.
 */
export async function deleteProfileByUsername(username) {
  const query = `DELETE FROM github_profiles WHERE username = ?`;
  const [result] = await db.execute(query, [username]);
  return result.affectedRows > 0;
}

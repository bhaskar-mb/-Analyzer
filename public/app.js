// API client logic for GitHub Profile Analyzer Dashboard

const API_BASE = '/api';

// DOM elements
const searchForm = document.getElementById('search-form');
const usernameInput = document.getElementById('username-input');
const errorMessage = document.getElementById('error-message');
const analyzerResults = document.getElementById('analyzer-results');
const loadingOverlay = document.getElementById('loading-overlay');
const refreshHistoryBtn = document.getElementById('refresh-history-btn');
const historyTableBody = document.getElementById('history-table-body');

// Profile card elements
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userGithubLink = document.getElementById('user-github-link');
const userBio = document.getElementById('user-bio');
const userCompany = document.getElementById('user-company');
const userLocation = document.getElementById('user-location');
const userBlog = document.getElementById('user-blog');
const userFollowers = document.getElementById('user-followers');
const userFollowing = document.getElementById('user-following');
const userReposCount = document.getElementById('user-repos-count');

// Stats elements
const statTotalStars = document.getElementById('stat-total-stars');
const statTotalForks = document.getElementById('stat-total-forks');
const statOpenIssues = document.getElementById('stat-open-issues');
const primaryLanguageBadge = document.getElementById('primary-language-badge');
const languagesContainer = document.getElementById('languages-container');
const popularRepoName = document.getElementById('popular-repo-name');
const popularRepoStarsCount = document.getElementById('popular-repo-stars-count');

// Initial loading configuration
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});

// Submit Form Action (Analyze profile)
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) return;

  hideError();
  showLoader();

  try {
    const res = await fetch(`${API_BASE}/profiles/${username}`, {
      method: 'POST'
    });
    
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to analyze profile.');
    }

    displayResults(result.data);
    loadHistory();
  } catch (error) {
    showError(error.message);
    analyzerResults.classList.add('hidden');
  } finally {
    hideLoader();
  }
});

// Refresh History List Action
refreshHistoryBtn.addEventListener('click', () => {
  loadHistory();
});

// Loader overlays utilities
function showLoader() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoader() {
  loadingOverlay.classList.add('hidden');
}

// Error banners utilities
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

// Load List of Profiles
async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/profiles`);
    const result = await res.json();
    
    if (!res.ok) throw new Error(result.message);

    renderHistoryTable(result.data);
  } catch (error) {
    console.error('Failed to load history:', error.message);
  }
}

// Render Table Rows
function renderHistoryTable(profiles) {
  if (!profiles || profiles.length === 0) {
    historyTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">No analyzed profiles found. Perform your first search above!</td>
      </tr>
    `;
    return;
  }

  historyTableBody.innerHTML = '';
  profiles.forEach(profile => {
    const row = document.createElement('tr');
    
    const formattedDate = new Date(profile.updated_at).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    row.innerHTML = `
      <td>
        <div class="history-user">
          <img src="${profile.avatar_url}" alt="Avatar" class="history-avatar">
          <span>${profile.name || profile.username}</span>
          <span style="color: var(--text-secondary); font-size: 0.85rem;">(${profile.username})</span>
        </div>
      </td>
      <td>${profile.followers.toLocaleString()}</td>
      <td>${profile.public_repos}</td>
      <td>${profile.total_stars.toLocaleString()}</td>
      <td>
        <span class="badge" style="background: rgba(188, 140, 255, 0.15); border-color: rgba(188, 140, 255, 0.3); color: var(--accent-purple);">
          ${profile.primary_language || 'N/A'}
        </span>
      </td>
      <td>${formattedDate}</td>
      <td class="actions-col">
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm select-btn" data-username="${profile.username}">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="btn btn-secondary btn-sm refresh-btn" data-username="${profile.username}">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-btn" data-username="${profile.username}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    // Attach row events
    row.querySelector('.select-btn').addEventListener('click', () => viewProfileDetails(profile.username));
    row.querySelector('.refresh-btn').addEventListener('click', () => refreshProfileDetails(profile.username));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteProfileDetails(profile.username));

    historyTableBody.appendChild(row);
  });
}

// Fetch single profile and display
async function viewProfileDetails(username) {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/profiles/${username}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    displayResults(result.data);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

// Refresh Profile
async function refreshProfileDetails(username) {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/profiles/${username}/refresh`, {
      method: 'PUT'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    
    displayResults(result.data);
    loadHistory();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

// Delete Profile
async function deleteProfileDetails(username) {
  if (!confirm(`Are you sure you want to delete profile analysis for "${username}"?`)) {
    return;
  }
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/profiles/${username}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    // Hide result card if currently showing this user
    if (userName.textContent === username || userGithubLink.textContent.includes(username)) {
      analyzerResults.classList.add('hidden');
    }

    loadHistory();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

// Render Results inside DOM
function displayResults(data) {
  // Profile Meta mapping
  userAvatar.src = data.avatar_url || 'https://github.com/identicons/git.png';
  userName.textContent = data.name || data.username;
  userGithubLink.textContent = `@${data.username}`;
  userGithubLink.href = data.html_url;
  userBio.textContent = data.bio || 'This user has no public bio.';

  // Render company
  if (data.company) {
    userCompany.textContent = data.company;
    document.getElementById('meta-company-wrapper').classList.remove('hidden');
  } else {
    document.getElementById('meta-company-wrapper').classList.add('hidden');
  }

  // Render location
  if (data.location) {
    userLocation.textContent = data.location;
    document.getElementById('meta-location-wrapper').classList.remove('hidden');
  } else {
    document.getElementById('meta-location-wrapper').classList.add('hidden');
  }

  // Render blog
  if (data.blog) {
    userBlog.textContent = data.blog;
    userBlog.href = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
    document.getElementById('meta-blog-wrapper').classList.remove('hidden');
  } else {
    document.getElementById('meta-blog-wrapper').classList.add('hidden');
  }

  // Render quick stats
  userFollowers.textContent = data.followers.toLocaleString();
  userFollowing.textContent = data.following.toLocaleString();
  userReposCount.textContent = data.public_repos.toLocaleString();

  // Stats Card values
  statTotalStars.textContent = data.total_stars.toLocaleString();
  statTotalForks.textContent = data.total_forks.toLocaleString();
  statOpenIssues.textContent = data.open_issues_count.toLocaleString();

  // Primary language
  if (data.primary_language) {
    primaryLanguageBadge.textContent = `Primary: ${data.primary_language}`;
    primaryLanguageBadge.classList.remove('hidden');
  } else {
    primaryLanguageBadge.classList.add('hidden');
  }

  // Render language percentage bars
  languagesContainer.innerHTML = '';
  const languages = Object.entries(data.repo_languages || {});
  
  if (languages.length === 0) {
    languagesContainer.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No programming languages detected.</p>';
  } else {
    // Sort languages by count descending
    languages.sort((a, b) => b[1].count - a[1].count);

    // Color definitions for popular programming languages
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      HTML: '#e34c26',
      CSS: '#563d7c',
      C: '#555555',
      'C++': '#f34b7d',
      Go: '#00ADD8',
      Rust: '#dea584',
      PHP: '#4F5D95',
      Java: '#b07219',
      Ruby: '#701516',
      Shell: '#89e051'
    };

    languages.forEach(([lang, stats]) => {
      const color = colors[lang] || '#8b949e';
      
      const langItem = document.createElement('div');
      langItem.className = 'language-item';
      langItem.innerHTML = `
        <div class="language-info">
          <div class="language-name-wrap">
            <span class="lang-dot" style="background-color: ${color}"></span>
            <span style="font-weight: 500">${lang}</span>
          </div>
          <span style="color: var(--text-secondary)">${stats.count} repos (${stats.percentage}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${stats.percentage}%; background-color: ${color}"></div>
        </div>
      `;
      languagesContainer.appendChild(langItem);
    });
  }

  // Popular repo details
  if (data.popular_repo_name) {
    popularRepoName.textContent = data.popular_repo_name;
    popularRepoStarsCount.textContent = data.popular_repo_stars.toLocaleString();
    document.querySelector('.popular-repo-card').classList.remove('hidden');
  } else {
    document.querySelector('.popular-repo-card').classList.add('hidden');
  }

  // Unhide details grid
  analyzerResults.classList.remove('hidden');
}

// Site Management Utility - Handle localStorage operations for user sites

const STORAGE_KEY = 'ghosttrack_user_sites';

/**
 * Get all user sites from localStorage
 */
export const getAllSites = () => {
  try {
    const sites = localStorage.getItem(STORAGE_KEY);
    return sites ? JSON.parse(sites) : getDefaultSites();
  } catch (error) {
    console.error('Error reading sites from localStorage:', error);
    return getDefaultSites();
  }
};

/**
 * Get default sites (initial setup)
 * Only includes user's actual sites - user can add more via UI
 */
const getDefaultSites = () => {
  return [
    {
      id: 'kayvontennis-com',
      name: 'Kayvon Tennis',
      url: 'https://kayvontennis.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      url: 'https://cyberbykayvon.com',
      createdAt: new Date().toISOString()
    },
  ];
};

/**
 * Save sites to localStorage
 */
export const saveSites = (sites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    return true;
  } catch (error) {
    console.error('Error saving sites to localStorage:', error);
    return false;
  }
};

/**
 * Add a new site
 */
export const addSite = (name, url) => {
  const sites = getAllSites();

  // Generate site ID from name (lowercase, replace spaces with dashes)
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if site with this ID already exists
  if (sites.find(site => site.id === id)) {
    throw new Error('A site with this name already exists');
  }

  const newSite = {
    id,
    name,
    url: url.startsWith('http') ? url : `https://${url}`,
    createdAt: new Date().toISOString()
  };

  sites.push(newSite);
  saveSites(sites);

  return newSite;
};

/**
 * Update a site
 */
export const updateSite = (id, updates) => {
  const sites = getAllSites();
  const index = sites.findIndex(site => site.id === id);

  if (index === -1) {
    throw new Error('Site not found');
  }

  sites[index] = { ...sites[index], ...updates };
  saveSites(sites);

  return sites[index];
};

/**
 * Delete a site
 */
export const deleteSite = (id) => {
  const sites = getAllSites();
  const filteredSites = sites.filter(site => site.id !== id);

  if (filteredSites.length === sites.length) {
    throw new Error('Site not found');
  }

  saveSites(filteredSites);
  return true;
};

/**
 * Generate tracking snippet for a site
 */
export const generateTrackingSnippet = (siteId) => {
  const apiUrl = 'https://ghosttrack-analytics-production.up.railway.app';

  return `<!-- GhostTrack Analytics -->
<script
  src="${apiUrl}/tracker/ghosttrack.js"
  data-ghosttrack
  data-site-id="${siteId}"
  data-api-url="${apiUrl}"
  data-debug="false"
></script>`;
};

/**
 * Initialize localStorage with default sites if empty
 * Also migrates old data if needed
 */
export const initializeSites = () => {
  const sitesData = localStorage.getItem(STORAGE_KEY);

  if (!sitesData) {
    // First time - set defaults
    saveSites(getDefaultSites());
  } else {
    // Migrate existing data - remove old courtcrate if it exists
    try {
      const sites = JSON.parse(sitesData);
      const hasOldCourtCrate = sites.find(s => s.id === 'courtcrate' && s.url === 'https://courtcrate.com');

      if (hasOldCourtCrate) {
        // Remove old hardcoded courtcrate
        const updatedSites = sites.filter(s => s.id !== 'courtcrate');
        saveSites(updatedSites);
        console.log('Migrated: Removed old CourtCrate from defaults');
      }
    } catch (error) {
      console.error('Error migrating sites:', error);
    }
  }
};

/**
 * Remember last viewed site
 */
const LAST_SITE_KEY = 'ghosttrack_last_viewed_site';

export const setLastViewedSite = (siteId) => {
  try {
    localStorage.setItem(LAST_SITE_KEY, siteId);
  } catch (error) {
    console.error('Error saving last viewed site:', error);
  }
};

export const getLastViewedSite = () => {
  try {
    return localStorage.getItem(LAST_SITE_KEY);
  } catch (error) {
    console.error('Error reading last viewed site:', error);
    return null;
  }
};

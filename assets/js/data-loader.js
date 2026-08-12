/**
 * Data Loader - Loads JSON data files
 * Uses relative paths for GitHub Pages compatibility
 */
const DataLoader = {
  basePath: '',

  async load(url) {
    const resp = await fetch(this.basePath + url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.json();
  },

  async loadScenarios() {
    return this.load('data/scenarios.json');
  },

  async loadHotTopics() {
    return this.load('data/hot-topics.json');
  },

  async loadTopic(topicId) {
    return this.load(`data/topics/${topicId}.json`);
  }
};
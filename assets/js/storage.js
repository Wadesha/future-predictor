/**
 * Storage - LocalStorage wrapper for user data
 */
const Storage = {
  _prefix: 'fp_',

  get(key) {
    try {
      const val = localStorage.getItem(this._prefix + key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set(key, val) {
    try { localStorage.setItem(this._prefix + key, JSON.stringify(val)); } catch {}
  },

  getChoices() {
    return this.get('choices') || {};
  },

  saveChoice(topicId, predictionId) {
    const choices = this.getChoices();
    choices[topicId] = { predictionId, timestamp: new Date().toISOString() };
    this.set('choices', choices);
  },

  getObservations() {
    return this.get('observations') || [];
  },

  addObservation(obs) {
    const obsList = this.getObservations();
    obsList.unshift(obs);
    this.set('observations', obsList);
  },

  getResults() {
    return this.get('results') || {};
  },

  setResult(topicId, correct) {
    const results = this.getResults();
    results[topicId] = { correct, timestamp: new Date().toISOString() };
    this.set('results', results);
  },

  getProfile() {
    return this.get('profile') || { name: '探索者', joinDate: new Date().toISOString() };
  },

  updateProfile(updates) {
    const profile = this.getProfile();
    Object.assign(profile, updates);
    this.set('profile', profile);
  },

  getScore() {
    const results = this.getResults();
    const entries = Object.values(results);
    if (entries.length === 0) return { total: 0, correct: 0, rate: 0 };
    const correct = entries.filter(r => r.correct).length;
    return { total: entries.length, correct, rate: Math.round((correct / entries.length) * 100) };
  }
};
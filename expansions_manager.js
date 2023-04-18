class ExpansionsManager {
  async getExpansions() {
    const expansions = await this.loadFromLocalStorage();
    return expansions;
  }

  async loadFromLocalStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get("expansions", (result) => {
        resolve(result.expansions || {});
      });
    });
  }

  async saveToLocalStorage(expansions) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ expansions }, () => {
        resolve();
      });
    });
  }

  async addExpansion(key, value) {
    const expansions = await this.getExpansions();
    expansions[key] = value;
    await this.saveToLocalStorage(expansions);
  }

  async editExpansion(oldKey, newKey, newValue) {
    const expansions = await this.getExpansions();
    delete expansions[oldKey];
    expansions[newKey] = newValue;
    await this.saveToLocalStorage(expansions);
  }

  async deleteExpansion(key) {
    const expansions = await this.getExpansions();
    delete expansions[key];
    await this.saveToLocalStorage(expansions);
  }
}

window.expansionsManager = new ExpansionsManager();

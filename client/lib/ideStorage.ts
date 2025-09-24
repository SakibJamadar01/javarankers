// IDE Storage API Client
export class IDEStorage {
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

  // Save IDE Settings
  async saveSettings(settings: any) {
    try {
      await fetch('/api/ide/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, settings })
      });
    } catch (error) {
      console.error('Failed to save IDE settings:', error);
    }
  }

  // Load IDE Settings
  async loadSettings() {
    try {
      const response = await fetch(`/api/ide/settings/${this.username}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to load IDE settings:', error);
      return null;
    }
  }

  // Save Projects
  async saveProjects(projects: any[]) {
    try {
      await fetch('/api/ide/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, projects })
      });
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }

  // Load Projects
  async loadProjects() {
    try {
      const response = await fetch(`/api/ide/projects/${this.username}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }

  // Save IDE Session
  async saveSession(session: any) {
    try {
      await fetch('/api/ide/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, session })
      });
    } catch (error) {
      console.error('Failed to save IDE session:', error);
    }
  }

  // Load IDE Session
  async loadSession() {
    try {
      const response = await fetch(`/api/ide/session/${this.username}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to load IDE session:', error);
      return null;
    }
  }

  // Auto-save with debouncing
  private saveTimeout: NodeJS.Timeout | null = null;
  
  autoSave(type: 'settings' | 'projects' | 'session', data: any) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      switch (type) {
        case 'settings':
          this.saveSettings(data);
          break;
        case 'projects':
          this.saveProjects(data);
          break;
        case 'session':
          this.saveSession(data);
          break;
      }
    }, 2000); // 2 second debounce
  }
}
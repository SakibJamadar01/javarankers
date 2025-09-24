const USER_KEY = "jr.user";

export type User = { username: string; profilePhoto?: string | null } | null;

export function getUser(): User {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (raw && lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (timeDiff > oneHour) {
        // Auto logout after 1 hour of inactivity
        logoutUser();
        return null;
      }
      
      // Update last activity
      localStorage.setItem('lastActivity', Date.now().toString());
      try {
        return JSON.parse(raw) as User;
      } catch {
        // Invalid JSON, logout user
        logoutUser();
        return null;
      }
    }
    if (raw) {
      try {
        return JSON.parse(raw) as User;
      } catch {
        // Invalid JSON, logout user
        logoutUser();
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const u: User = data?.user ?? null;
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem('lastActivity', Date.now().toString());
  }
  return u;
}

export async function updateProfilePhoto(photo: string): Promise<boolean> {
  const user = getUser();
  if (!user) return false;
  
  try {
    // Get CSRF token
    const csrfRes = await fetch("/api/csrf-token");
    const csrfData = await csrfRes.json();
    
    const res = await fetch("/api/auth/profile-photo", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfData.csrfToken
      },
      body: JSON.stringify({ username: user.username, photo }),
    });
    
    if (res.ok) {
      const updatedUser = { ...user, profilePhoto: photo };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: USER_KEY,
        newValue: JSON.stringify(updatedUser)
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Profile photo update failed:', error);
    return false;
  }
}

export async function registerUser(
  username: string,
  password: string,
  email?: string
): Promise<User> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const u: User = data?.user ?? null;
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem('lastActivity', Date.now().toString());
  }
  return u;
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('lastActivity');
  // Trigger storage event for other components
  window.dispatchEvent(new StorageEvent('storage', {
    key: USER_KEY,
    newValue: null
  }));
}

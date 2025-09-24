const KEY = "jr.admin";
const ADMIN_DATA_KEY = "jr.admin.data";

function hasStorage() {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export type AdminData = { username: string; profilePhoto?: string | null } | null;

export function getAdminData(): AdminData {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAdminData(data: AdminData) {
  if (!hasStorage()) return;
  if (data) {
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(ADMIN_DATA_KEY);
  }
}

export function isAdmin(): boolean {
  if (!hasStorage()) return false;
  
  const adminStatus = localStorage.getItem(KEY);
  const lastActivity = localStorage.getItem('adminLastActivity');
  
  if (adminStatus === "1" && lastActivity) {
    const timeDiff = Date.now() - parseInt(lastActivity);
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (timeDiff > oneHour) {
      // Auto logout after 1 hour of inactivity
      logoutAdmin();
      return false;
    }
    
    // Update last activity
    localStorage.setItem('adminLastActivity', Date.now().toString());
  }
  
  return adminStatus === "1";
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (res.ok) {
      const data = await res.json();
      if (hasStorage()) {
        localStorage.setItem(KEY, "1");
        localStorage.setItem('adminLastActivity', Date.now().toString());
        setAdminData(data.admin);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  if (hasStorage()) {
    localStorage.removeItem(KEY);
    localStorage.removeItem('adminLastActivity');
    setAdminData(null);
    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: KEY,
      newValue: null
    }));
  }
}

export async function updateAdminProfilePhoto(photo: string): Promise<boolean> {
  const adminData = getAdminData();
  if (!adminData) return false;
  
  try {
    // Get CSRF token
    const csrfRes = await fetch("/api/csrf-token");
    const csrfData = await csrfRes.json();
    
    const res = await fetch("/api/auth/admin-profile-photo", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfData.csrfToken
      },
      body: JSON.stringify({ username: adminData.username, photo }),
    });
    
    if (res.ok) {
      const updatedAdmin = { ...adminData, profilePhoto: photo };
      setAdminData(updatedAdmin);
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: ADMIN_DATA_KEY,
        newValue: JSON.stringify(updatedAdmin)
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Admin profile photo update failed:', error);
    return false;
  }
}

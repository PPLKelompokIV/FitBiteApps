// ==============================================================================
// FITBITE AUTHENTICATION & AUTHORIZATION HELPER (auth.ts)
// Berdasarkan Prinsip 4A Keamanan Sistem Informasi:
// 1. Authentication (Pemeriksaan Token & Kredensial)
// 2. Authorization (Role-Based Access Control: 'admin' vs 'user')
// 3. Accountability (Pencatatan Jejak Sesi & User Identity)
// 4. Administration (Pengelolaan Session Lifecycle & Logout)
// ==============================================================================

export interface AuthUser {
  id_user: string;
  nama: string;
  email: string;
  role: "user" | "admin";
  status_akun?: string;
  created_at?: string;
}

export interface AuthSessionAudit {
  session_id: string;
  login_at: string;
  client_ip?: string;
}

export const AUTH_KEYS = {
  TOKEN: "fitbite_token",
  USER: "fitbite_user",
  ROLE: "fitbite_role",
  AUDIT: "fitbite_session",
} as const;

/**
 * Menyimpan data otentikasi & audit ke LocalStorage (4A: Authentication & Accountability)
 */
export const setAuthSession = (
  token: string,
  user: AuthUser,
  audit?: AuthSessionAudit
): void => {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.ROLE, user.role);
  if (audit) {
    localStorage.setItem(AUTH_KEYS.AUDIT, JSON.stringify(audit));
  }
};

/**
 * Mendapatkan token JWT yang tersimpan
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
};

/**
 * Mendapatkan profil pengguna yang sedang login
 */
export const getAuthUser = (): AuthUser | null => {
  const userStr = localStorage.getItem(AUTH_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * Memeriksa apakah pengguna saat ini sedang login secara valid
 */
export const isAuthenticated = (): boolean => {
  return Boolean(getAuthToken());
};

/**
 * Memeriksa apakah pengguna memiliki hak akses Administrator (4A: Authorization)
 */
export const isAdmin = (): boolean => {
  return localStorage.getItem(AUTH_KEYS.ROLE) === "admin";
};

/**
 * Membersihkan seluruh sesi otentikasi (4A: Administration - Logout)
 */
export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.ROLE);
  localStorage.removeItem(AUTH_KEYS.AUDIT);
};

/**
 * Helper Logout lengkap dengan pengalihan halaman ke /login
 */
export const logout = (navigate?: (path: string) => void): void => {
  clearAuthSession();
  if (navigate) {
    navigate("/login");
  } else {
    window.location.href = "/login";
  }
};

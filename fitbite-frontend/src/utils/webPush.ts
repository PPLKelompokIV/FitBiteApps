const API_BASE = "http://127.0.0.1:8000";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getActiveUserIdentity(): { id_user: number | string; email: string } {
  try {
    const rawUser =
      localStorage.getItem("fitbite_user") || localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id_user || parsed?.email) {
        return {
          id_user: parsed.id_user ?? 1,
          email: parsed.email ?? "nadia.putri@email.com",
        };
      }
    }
  } catch {
    // Gunakan akun demo default jika belum ada sesi login di localStorage
  }
  return { id_user: 1, email: "nadia.putri@email.com" };
}

export async function subscribeBrowserPush(
  overrideIdUser?: number | string,
  overrideEmail?: string
): Promise<{
  ok: boolean;
  permission: NotificationPermission;
  message: string;
}> {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return {
      ok: false,
      permission: "denied",
      message: "Browser tidak mendukung Service Worker atau Web Push API.",
    };
  }

  // 1. Minta izin notifikasi browser ke pengguna
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      permission,
      message:
        permission === "denied"
          ? "Izin notifikasi ditolak. Pengingat otomatis beralih ke In-App Notification."
          : "Permintaan izin notifikasi belum disetujui.",
    };
  }

  // 2. Daftarkan Service Worker (/sw.js)
  await navigator.serviceWorker.register("/sw.js");
  const registration = await navigator.serviceWorker.ready;

  // 3. Ambil VAPID Public Key dari backend FastAPI
  const keyRes = await fetch(`${API_BASE}/api/push/vapid-public-key`);
  if (!keyRes.ok) {
    const errData = await keyRes.json().catch(() => ({}));
    throw new Error(
      errData.detail || "Gagal mengambil VAPID Public Key dari server."
    );
  }
  const { public_key: vapidPublicKey } = await keyRes.json();

  // 4. Ambil subscription yang sudah ada atau buat langganan baru via PushManager
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  // 5. Simpan objek push_subscription (JSON) ke kolom push_subscription di tabel users
  const activeUser = getActiveUserIdentity();
  const saveRes = await fetch(`${API_BASE}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_user: overrideIdUser ?? activeUser.id_user,
      email: overrideEmail ?? activeUser.email,
      subscription: subscription.toJSON(),
    }),
  });

  if (!saveRes.ok) {
    const errData = await saveRes.json().catch(() => ({}));
    throw new Error(
      errData.detail || "Gagal menyimpan push_subscription ke database."
    );
  }

  return {
    ok: true,
    permission: "granted",
    message:
      "Service Worker dan Web Push aktif. Notifikasi tetap masuk meski tab ditutup.",
  };
}
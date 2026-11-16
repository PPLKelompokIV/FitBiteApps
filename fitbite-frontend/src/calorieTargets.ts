export type CalorieProfile = {
  age: number;
  sex: "female" | "male";
  heightCm: number;
  weightKg: number;
  activityFactor: number;
  goal: "lose" | "maintain" | "gain";
};

export const sampleCalorieProfile: CalorieProfile = {
  age: 28,
  sex: "female",
  heightCm: 160,
  weightKg: 64,
  activityFactor: 1.375,
  goal: "lose",
};

export type BackendCalorieTarget = {
  id_user: number;
  usia: number;
  jenis_kelamin: "laki-laki" | "perempuan";
  tinggi_cm: number;
  berat_kg: number;
  tingkat_aktivitas: string;
  bmr_kcal_per_hari: number;
  tdee_kcal_per_hari: number;
  sasaran_kalori_kcal_per_hari: number;
};

const API_BASE_URL = "http://localhost:8000";
let pendingCalorieTargetRequest: Promise<BackendCalorieTarget> | null = null;

const saveCalorieTarget = async (
  profile: Omit<BackendCalorieTarget, "bmr_kcal_per_hari" | "tdee_kcal_per_hari" | "sasaran_kalori_kcal_per_hari">,
) => {
  const response = await fetch(`${API_BASE_URL}/api/calorie-targets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Backend gagal menghitung sasaran kalori (${response.status}).`);
  }

  const result = await response.json();
  return result.data as BackendCalorieTarget;
};

export const loadCalorieTarget = () => {
  if (pendingCalorieTargetRequest) {
    return pendingCalorieTargetRequest;
  }

  pendingCalorieTargetRequest = (async () => {
    const weightFromBodyCheck = Number(
      localStorage.getItem("fitbite_berat_badan_kg"),
    );
    const profile = {
      id_user: 1,
      usia: sampleCalorieProfile.age,
      jenis_kelamin:
        sampleCalorieProfile.sex === "female" ? "perempuan" : "laki-laki",
      tinggi_cm: sampleCalorieProfile.heightCm,
      berat_kg:
        Number.isFinite(weightFromBodyCheck) && weightFromBodyCheck > 0
          ? weightFromBodyCheck
          : sampleCalorieProfile.weightKg,
      tingkat_aktivitas: "ringan",
    } as const;

    const response = await fetch(
      `${API_BASE_URL}/api/calorie-targets/${profile.id_user}`,
    );

    if (response.status === 404) {
      return saveCalorieTarget(profile);
    }
    if (!response.ok) {
      throw new Error(`Backend gagal memuat sasaran kalori (${response.status}).`);
    }

    const result = await response.json();
    const target = result.data as BackendCalorieTarget | undefined;
    if (
      !target ||
      target.id_user !== profile.id_user ||
      !Number.isFinite(target.bmr_kcal_per_hari) ||
      target.bmr_kcal_per_hari <= 0 ||
      !Number.isFinite(target.tdee_kcal_per_hari) ||
      target.tdee_kcal_per_hari <= 0 ||
      !Number.isFinite(target.sasaran_kalori_kcal_per_hari) ||
      target.sasaran_kalori_kcal_per_hari <= 0
    ) {
      throw new Error("Backend mengembalikan sasaran kalori yang tidak valid.");
    }

    return target;
  })().finally(() => {
    pendingCalorieTargetRequest = null;
  });

  return pendingCalorieTargetRequest;
};

export const calculateCalorieTargets = (profile: CalorieProfile) => {
  const bmr =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === "male" ? 5 : -161);
  const tdee = bmr * profile.activityFactor;
  const goalMultiplier =
    profile.goal === "lose" ? 0.85 : profile.goal === "gain" ? 1.1 : 1;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round((tdee * goalMultiplier) / 10) * 10,
  };
};

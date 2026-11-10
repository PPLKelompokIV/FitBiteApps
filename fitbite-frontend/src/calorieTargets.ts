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

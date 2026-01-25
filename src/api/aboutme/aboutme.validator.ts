import { k, kataxInfer } from "katax-core";
import type { ValidationResult } from "../../shared/api.utils.js";

// Schema for social media links
const socialSchema = k.object({
  icon: k.string().minLength(1),
  href: k.string().minLength(1),
  label: k.string().minLength(1),
});

// Schema for updating AboutMe
export const aboutMeUpdateSchema = k.object({
  name: k.string().minLength(1),
  title: k.string().minLength(1),
  location: k.string().minLength(1),
  bio: k.string().minLength(1),
  email: k.string().minLength(1),
  image: k.string().minLength(1),
  quote: k.string().optional(),
  skills: k.array(k.string()).optional(),
  interests: k.array(k.string()).optional(),
  socials: k.array(socialSchema).optional(),
});

export type AboutMeUpdate = kataxInfer<typeof aboutMeUpdateSchema>;

// Schema for adding a skill
export const addSkillSchema = k.object({
  skill: k.string().minLength(1),
});

export type AddSkillBody = kataxInfer<typeof addSkillSchema>;

// Schema for adding an interest
export const addInterestSchema = k.object({
  interest: k.string().minLength(1),
});

export type AddInterestBody = kataxInfer<typeof addInterestSchema>;

// Schema for adding a social
export const addSocialSchema = k.object({
  icon: k.string().minLength(1),
  href: k.string().minLength(1),
  label: k.string().minLength(1),
});

export type AddSocialBody = kataxInfer<typeof addSocialSchema>;

// ------------------ Validators ------------------
export async function validateAboutMeUpdateBody(
  data: unknown,
): Promise<ValidationResult<AboutMeUpdate>> {
  const result: ReturnType<typeof aboutMeUpdateSchema.safeParse> =
    aboutMeUpdateSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateAddSkillBody(
  data: unknown,
): Promise<ValidationResult<AddSkillBody>> {
  const result: ReturnType<typeof addSkillSchema.safeParse> =
    addSkillSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateAddInterestBody(
  data: unknown,
): Promise<ValidationResult<AddInterestBody>> {
  const result: ReturnType<typeof addInterestSchema.safeParse> =
    addInterestSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateAddSocialBody(
  data: unknown,
): Promise<ValidationResult<AddSocialBody>> {
  const result: ReturnType<typeof addSocialSchema.safeParse> =
    addSocialSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

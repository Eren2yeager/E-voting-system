import { z } from "zod";

const httpUrl = z.string().url("Must be a valid URL").max(2048);

/** Optional URL: omit, empty string, or valid http(s) URL. */
const optionalUserImageUrl = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  httpUrl.optional()
);

/** Omitted, empty string to clear, or a valid http(s) URL. */
const optionalCandidateMediaField = z
  .union([httpUrl, z.literal("")])
  .optional();

export const registerBodySchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(64, "Username is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password is too long"),
  imageUrl: optionalUserImageUrl,
});

export const profileImageBodySchema = z.object({
  imageUrl: z.union([httpUrl, z.literal("")]),
});

export const voteBodySchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
});

export const candidateCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  party: z.string().min(1, "Party is required").max(200),
  description: z.string().max(2000).optional(),
  imageUrl: optionalCandidateMediaField,
  posterUrl: optionalCandidateMediaField,
});

export const candidateUpdateSchema = candidateCreateSchema;

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(256, "New password is too long"),
    confirmNewPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

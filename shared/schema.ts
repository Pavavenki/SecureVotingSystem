
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  password: varchar("password").notNull(),
  role: varchar("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Citizens table for Aadhaar management
export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  aadhaarNumber: varchar("aadhaar_number").notNull().unique(),
  fullName: varchar("full_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender").notNull(),
  address: text("address").notNull(),
  district: varchar("district").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode").notNull(),
  photoUrl: varchar("photo_url"),
  fingerprintTemplates: jsonb("fingerprint_templates"),
  faceTemplate: text("face_template"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Voters table
export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  voterId: varchar("voter_id").notNull().unique(),
  aadhaarNumber: varchar("aadhaar_number").notNull(),
  password: varchar("password").notNull(),
  fullName: varchar("full_name").notNull(),
  constituency: varchar("constituency").notNull(),
  isActive: boolean("is_active").default(true),
  hasVoted: boolean("has_voted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  party: varchar("party").notNull(),
  constituency: varchar("constituency").notNull(),
  symbol: varchar("symbol"),
  qualification: text("qualification"),
  experience: text("experience"),
  photoUrl: varchar("photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Votes table for blockchain-style storage
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  voteId: varchar("vote_id").notNull().unique(),
  voterId: varchar("voter_id").notNull(),
  candidateId: integer("candidate_id"),
  constituency: varchar("constituency").notNull(),
  blockchainHash: varchar("blockchain_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isNota: boolean("is_nota").default(false),
});

// Biometric verification logs
export const biometricLogs = pgTable("biometric_logs", {
  id: serial("id").primaryKey(),
  aadhaarNumber: varchar("aadhaar_number").notNull(),
  verificationType: varchar("verification_type").notNull(), // 'fingerprint' | 'face'
  isSuccessful: boolean("is_successful").notNull(),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: varchar("session_id"),
});

// Insert schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  userId: true,
  password: true,
  role: true,
});

export const insertCitizenSchema = createInsertSchema(citizens).pick({
  aadhaarNumber: true,
  fullName: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  district: true,
  state: true,
  pincode: true,
  photoUrl: true,
  fingerprintTemplates: true,
  faceTemplate: true,
});

export const insertVoterSchema = createInsertSchema(voters).pick({
  voterId: true,
  aadhaarNumber: true,
  password: true,
  fullName: true,
  constituency: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  party: true,
  constituency: true,
  symbol: true,
  qualification: true,
  experience: true,
  photoUrl: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  voteId: true,
  voterId: true,
  candidateId: true,
  constituency: true,
  blockchainHash: true,
  isNota: true,
});

export const insertBiometricLogSchema = createInsertSchema(biometricLogs).pick({
  aadhaarNumber: true,
  verificationType: true,
  isSuccessful: true,
  confidence: true,
  sessionId: true,
});

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;

export type Voter = typeof voters.$inferSelect;
export type InsertVoter = typeof voters.$inferInsert;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type BiometricLog = typeof biometricLogs.$inferSelect;
export type InsertBiometricLog = z.infer<typeof insertBiometricLogSchema>;

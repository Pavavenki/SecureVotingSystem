import {
  adminUsers,
  citizens,
  voters,
  candidates,
  votes,
  biometricLogs,
  type AdminUser,
  type InsertAdminUser,
  type Citizen,
  type InsertCitizen,
  type Voter,
  type InsertVoter,
  type Candidate,
  type InsertCandidate,
  type Vote,
  type InsertVote,
  type BiometricLog,
  type InsertBiometricLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // Admin operations
  getAdminUser(userId: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  
  // Citizen operations
  getCitizen(aadhaarNumber: string): Promise<Citizen | undefined>;
  getAllCitizens(limit?: number, offset?: number): Promise<Citizen[]>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(aadhaarNumber: string, updates: Partial<InsertCitizen>): Promise<Citizen | undefined>;
  deleteCitizen(aadhaarNumber: string): Promise<boolean>;
  searchCitizens(query: string, district?: string): Promise<Citizen[]>;
  
  // Voter operations
  getVoter(voterId: string): Promise<Voter | undefined>;
  getVoterByAadhaar(aadhaarNumber: string): Promise<Voter | undefined>;
  getAllVoters(): Promise<Voter[]>;
  createVoter(voter: InsertVoter): Promise<Voter>;
  updateVoter(voterId: string, updates: Partial<InsertVoter>): Promise<Voter | undefined>;
  deleteVoter(voterId: string): Promise<boolean>;
  
  // Candidate operations
  getAllCandidates(): Promise<Candidate[]>;
  getCandidatesByConstituency(constituency: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, updates: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Voting operations
  castVote(vote: InsertVote): Promise<Vote>;
  getVotesByConstituency(constituency: string): Promise<Vote[]>;
  getVotingStats(): Promise<{ totalVotes: number; eligibleVoters: number; constituencies: number }>;
  
  // Biometric operations
  logBiometricVerification(log: InsertBiometricLog): Promise<BiometricLog>;
  verifyFingerprint(aadhaarNumber: string, fingerprintData: string): Promise<{ isMatch: boolean; confidence: number }>;
  verifyFace(aadhaarNumber: string, faceData: string): Promise<{ isMatch: boolean; confidence: number }>;
}

export class DatabaseStorage implements IStorage {
  // Admin operations
  async getAdminUser(userId: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.userId, userId));
    return user;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [newUser] = await db.insert(adminUsers).values(user).returning();
    return newUser;
  }

  // Citizen operations
  async getCitizen(aadhaarNumber: string): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.aadhaarNumber, aadhaarNumber));
    return citizen;
  }

  async getAllCitizens(limit = 50, offset = 0): Promise<Citizen[]> {
    return await db.select().from(citizens).limit(limit).offset(offset).orderBy(desc(citizens.createdAt));
  }

  async createCitizen(citizen: InsertCitizen): Promise<Citizen> {
    const [newCitizen] = await db.insert(citizens).values({
      ...citizen,
      updatedAt: new Date()
    }).returning();
    
    // Auto-create voter record with date of birth as authentication
    if (newCitizen.aadhaarNumber && newCitizen.dateOfBirth) {
      const voterId = citizen.voterId || `VOTER${Date.now().toString().slice(-6)}`;
      try {
        await db.insert(voters).values({
          voterId: voterId,
          aadhaarNumber: newCitizen.aadhaarNumber,
          fullName: newCitizen.fullName,
          dateOfBirth: newCitizen.dateOfBirth,
          gender: newCitizen.gender,
          phoneNumber: newCitizen.phoneNumber,
          email: newCitizen.email,
          address: newCitizen.address,
          district: newCitizen.district,
          state: newCitizen.state,
          pincode: newCitizen.pincode,
          constituency: newCitizen.constituency,
          password: newCitizen.dateOfBirth, // Use DOB as password
          isEligible: true,
          hasVoted: false
        });
      } catch (error) {
        console.log("Voter record may already exist for this citizen");
      }
    }
    
    return newCitizen;
  }

  async updateCitizen(aadhaarNumber: string, updates: Partial<InsertCitizen>): Promise<Citizen | undefined> {
    const [updatedCitizen] = await db
      .update(citizens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(citizens.aadhaarNumber, aadhaarNumber))
      .returning();
    return updatedCitizen;
  }

  async deleteCitizen(aadhaarNumber: string): Promise<boolean> {
    const result = await db.delete(citizens).where(eq(citizens.aadhaarNumber, aadhaarNumber));
    return result.rowCount > 0;
  }

  async searchCitizens(query: string, district?: string): Promise<Citizen[]> {
    let queryBuilder = db.select().from(citizens);
    
    if (district) {
      queryBuilder = queryBuilder.where(eq(citizens.district, district));
    }
    
    return await queryBuilder.orderBy(desc(citizens.createdAt));
  }

  // Voter operations
  async getVoter(voterId: string): Promise<Voter | undefined> {
    const [voter] = await db.select().from(voters).where(eq(voters.voterId, voterId));
    return voter;
  }

  async getVoterByAadhaar(aadhaarNumber: string): Promise<Voter | undefined> {
    const [voter] = await db.select().from(voters).where(eq(voters.aadhaarNumber, aadhaarNumber));
    return voter;
  }

  async getAllVoters(): Promise<Voter[]> {
    return await db.select().from(voters).orderBy(desc(voters.createdAt));
  }

  async createVoter(voter: InsertVoter): Promise<Voter> {
    const [newVoter] = await db.insert(voters).values(voter).returning();
    return newVoter;
  }

  async updateVoter(voterId: string, updates: Partial<InsertVoter>): Promise<Voter | undefined> {
    const [updatedVoter] = await db
      .update(voters)
      .set(updates)
      .where(eq(voters.voterId, voterId))
      .returning();
    return updatedVoter;
  }

  async deleteVoter(voterId: string): Promise<boolean> {
    const result = await db.delete(voters).where(eq(voters.voterId, voterId));
    return result.rowCount > 0;
  }

  // Candidate operations
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(candidateId: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(updates)
      .where(eq(candidates.id, parseInt(candidateId)))
      .returning();
    return updatedCandidate;
  }

  async deleteCandidate(candidateId: string): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, parseInt(candidateId)));
    return result.rowCount > 0;
  }

  async deleteVoter(voterId: string): Promise<boolean> {
    const result = await db.delete(voters).where(eq(voters.voterId, voterId));
    return result.rowCount > 0;
  }

  // Candidate operations
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.isActive, true));
  }

  async getCandidatesByConstituency(constituency: string): Promise<Candidate[]> {
    return await db.select().from(candidates)
      .where(and(eq(candidates.constituency, constituency), eq(candidates.isActive, true)));
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(updates)
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.update(candidates)
      .set({ isActive: false })
      .where(eq(candidates.id, id));
    return result.rowCount > 0;
  }

  // Voting operations
  async castVote(vote: InsertVote): Promise<Vote> {
    // Mark voter as having voted
    await db.update(voters)
      .set({ hasVoted: true })
      .where(eq(voters.voterId, vote.voterId));

    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async getVotesByConstituency(constituency: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.constituency, constituency));
  }

  async getVotingStats(): Promise<{ totalVotes: number; eligibleVoters: number; constituencies: number }> {
    const [totalVotesResult] = await db.select({ count: count() }).from(votes);
    const [eligibleVotersResult] = await db.select({ count: count() }).from(voters);
    
    // Get unique constituencies count
    const constituenciesResult = await db.selectDistinct({ constituency: candidates.constituency }).from(candidates);
    
    return {
      totalVotes: totalVotesResult.count,
      eligibleVoters: eligibleVotersResult.count,
      constituencies: constituenciesResult.length
    };
  }

  // Biometric operations
  async logBiometricVerification(log: InsertBiometricLog): Promise<BiometricLog> {
    const [newLog] = await db.insert(biometricLogs).values(log).returning();
    return newLog;
  }

  async verifyFingerprint(aadhaarNumber: string, fingerprintData: string): Promise<{ isMatch: boolean; confidence: number }> {
    const citizen = await this.getCitizen(aadhaarNumber);
    if (!citizen || !citizen.fingerprintTemplates) {
      return { isMatch: false, confidence: 0 };
    }

    // Simulate fingerprint matching (in real implementation, use biometric SDK)
    const templates = citizen.fingerprintTemplates as any;
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-99% confidence
    const isMatch = confidence > 75;

    // Log the verification attempt
    await this.logBiometricVerification({
      aadhaarNumber,
      verificationType: 'fingerprint',
      isSuccessful: isMatch,
      confidence,
      sessionId: Math.random().toString(36).substr(2, 9)
    });

    return { isMatch, confidence };
  }

  async verifyFace(aadhaarNumber: string, faceData: string): Promise<{ isMatch: boolean; confidence: number }> {
    const citizen = await this.getCitizen(aadhaarNumber);
    if (!citizen || !citizen.faceTemplate) {
      return { isMatch: false, confidence: 0 };
    }

    // Simulate face recognition (in real implementation, use face recognition SDK)
    const confidence = Math.floor(Math.random() * 35) + 65; // 65-99% confidence
    const isMatch = confidence > 80;

    // Log the verification attempt
    await this.logBiometricVerification({
      aadhaarNumber,
      verificationType: 'face',
      isSuccessful: isMatch,
      confidence,
      sessionId: Math.random().toString(36).substr(2, 9)
    });

    return { isMatch, confidence };
  }
}

export const storage = new DatabaseStorage();

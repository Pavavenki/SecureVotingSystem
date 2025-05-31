import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import {
  insertCitizenSchema,
  insertVoterSchema,
  insertCandidateSchema,
  insertVoteSchema,
  insertBiometricLogSchema
} from "@shared/schema";
import crypto from "crypto";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    user?: {
      userId: string;
      role: string;
      system: string;
    };
  }
}

interface AuthenticatedRequest extends Request {
  session: any;
}

// Demo data creation function
async function createDemoDataIfNeeded() {
  try {
    // Check if demo voter exists
    const existingVoter = await storage.getVoter("VOTER001");
    if (!existingVoter) {
      // Create demo citizen first
      await storage.createCitizen({
        aadhaarNumber: "1234-5678-9012",
        fullName: "Rajesh Kumar Singh",
        dateOfBirth: new Date("1990-05-15"),
        gender: "Male",
        phoneNumber: "9876543210",
        email: "rajesh.singh@email.com",
        address: "123 Main Street, Mumbai",
        district: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        fingerprintTemplate: "demo_fingerprint_template",
        faceTemplate: "demo_face_template"
      });

      // Create demo voter
      await storage.createVoter({
        voterId: "VOTER001",
        aadhaarNumber: "1234-5678-9012",
        password: "voter123",
        fullName: "Rajesh Kumar Singh",
        constituency: "Mumbai North - 24"
      });

      // Create demo candidates
      await storage.createCandidate({
        name: "Candidate A",
        party: "Party A",
        constituency: "Mumbai North - 24",
        qualification: "Graduate",
        experience: "5 years in social work"
      });

      await storage.createCandidate({
        name: "Candidate B", 
        party: "Party B",
        constituency: "Mumbai North - 24",
        qualification: "Post Graduate",
        experience: "10 years in public service"
      });

      console.log("Demo data created successfully");
    }
  } catch (error) {
    console.error("Error creating demo data:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticate = (req: AuthenticatedRequest, res: any, next: any) => {
    // Simple session-based auth
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Admin authentication endpoint
  app.post("/api/admin/login", async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, password } = req.body;
      
      // Demo admin credentials
      if (userId === "admin" && password === "admin123") {
        req.session.user = { userId, role: "admin", system: "aadhaar" };
        res.json({ success: true, user: req.session.user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Voting authentication endpoint
  app.post("/api/voting/login", async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, password, role } = req.body;
      
      if (role === "admin") {
        // Voting admin login
        if (userId === "votingadmin" && password === "admin123") {
          req.session.user = { userId, role: "admin", system: "voting" };
          res.json({ success: true, user: req.session.user });
        } else {
          res.status(401).json({ message: "Invalid admin credentials" });
        }
      } else {
        // Voter login - create demo data if needed
        await createDemoDataIfNeeded();
        
        const voter = await storage.getVoter(userId);
        if (voter && voter.password === password) {
          req.session.user = { userId: voter.voterId, role: "voter", system: "voting" };
          res.json({ success: true, user: req.session.user, voter });
        } else {
          res.status(401).json({ message: "Invalid voter credentials" });
        }
      }
    } catch (error) {
      console.error("Voting login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: AuthenticatedRequest, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.json({ success: true });
      }
    });
  });

  // Get current user
  app.get("/api/auth/user", (req: AuthenticatedRequest, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // === AADHAAR MANAGEMENT ROUTES ===

  // Get all citizens
  app.get("/api/citizens", authenticate, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      
      const citizens = await storage.getAllCitizens(limit, offset);
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch citizens" });
    }
  });

  // Get citizen by Aadhaar number
  app.get("/api/citizens/:aadhaar", authenticate, async (req, res) => {
    try {
      const citizen = await storage.getCitizen(req.params.aadhaar);
      if (!citizen) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch citizen" });
    }
  });

  // Create new citizen
  app.post("/api/citizens", authenticate, async (req, res) => {
    try {
      const validatedData = insertCitizenSchema.parse(req.body);
      const citizen = await storage.createCitizen(validatedData);
      res.status(201).json(citizen);
    } catch (error) {
      res.status(400).json({ message: "Invalid citizen data" });
    }
  });

  // Update citizen
  app.put("/api/citizens/:aadhaar", authenticate, async (req, res) => {
    try {
      const updates = insertCitizenSchema.partial().parse(req.body);
      const citizen = await storage.updateCitizen(req.params.aadhaar, updates);
      if (!citizen) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Delete citizen
  app.delete("/api/citizens/:aadhaar", authenticate, async (req, res) => {
    try {
      const success = await storage.deleteCitizen(req.params.aadhaar);
      if (!success) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete citizen" });
    }
  });

  // Search citizens
  app.get("/api/citizens/search", authenticate, async (req: any, res) => {
    try {
      const { q, district } = req.query;
      const citizens = await storage.searchCitizens(q || "", district);
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // === BIOMETRIC VERIFICATION ROUTES ===

  // Verify fingerprint
  app.post("/api/verify/fingerprint", async (req, res) => {
    try {
      const { aadhaarNumber, fingerprintData } = req.body;
      const result = await storage.verifyFingerprint(aadhaarNumber, fingerprintData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Fingerprint verification failed" });
    }
  });

  // Verify face
  app.post("/api/verify/face", async (req, res) => {
    try {
      const { aadhaarNumber, faceData } = req.body;
      const result = await storage.verifyFace(aadhaarNumber, faceData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Face verification failed" });
    }
  });

  // === VOTING SYSTEM ROUTES ===

  // Get all voters (admin only)
  app.get("/api/voters", authenticate, async (req, res) => {
    try {
      const voters = await storage.getAllVoters();
      res.json(voters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voters" });
    }
  });

  // Create new voter
  app.post("/api/voters", authenticate, async (req, res) => {
    try {
      const validatedData = insertVoterSchema.parse(req.body);
      const voter = await storage.createVoter(validatedData);
      res.status(201).json(voter);
    } catch (error) {
      res.status(400).json({ message: "Invalid voter data" });
    }
  });

  // Get candidates by constituency
  app.get("/api/candidates/:constituency", async (req, res) => {
    try {
      const candidates = await storage.getCandidatesByConstituency(req.params.constituency);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // Get all candidates
  app.get("/api/candidates", authenticate, async (req, res) => {
    try {
      const candidates = await storage.getAllCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // Create new candidate
  app.post("/api/candidates", authenticate, async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error) {
      res.status(400).json({ message: "Invalid candidate data" });
    }
  });

  // Cast vote
  app.post("/api/vote", authenticate, async (req: any, res) => {
    try {
      const { candidateId, isNota, constituency } = req.body;
      const voterId = req.session.user.userId;
      
      // Check if voter has already voted
      const voter = await storage.getVoter(voterId);
      if (!voter) {
        return res.status(404).json({ message: "Voter not found" });
      }
      if (voter.hasVoted) {
        return res.status(400).json({ message: "Vote already cast" });
      }

      // Generate blockchain hash
      const voteId = `VT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const blockchainHash = crypto.createHash('sha256')
        .update(`${voteId}${voterId}${candidateId || 'NOTA'}${Date.now()}`)
        .digest('hex');

      const voteData = {
        voteId,
        voterId,
        candidateId: isNota ? null : candidateId,
        constituency,
        blockchainHash,
        isNota: !!isNota
      };

      const vote = await storage.castVote(voteData);
      res.json(vote);
    } catch (error) {
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  // Get voting results
  app.get("/api/results/:constituency", authenticate, async (req, res) => {
    try {
      const votes = await storage.getVotesByConstituency(req.params.constituency);
      const candidates = await storage.getCandidatesByConstituency(req.params.constituency);
      
      // Calculate results
      const results = candidates.map(candidate => {
        const candidateVotes = votes.filter(vote => vote.candidateId === candidate.id);
        return {
          candidate,
          votes: candidateVotes.length,
          percentage: ((candidateVotes.length / votes.length) * 100).toFixed(1)
        };
      });

      const notaVotes = votes.filter(vote => vote.isNota);
      results.push({
        candidate: { id: -1, name: "NOTA", party: "None of the Above" },
        votes: notaVotes.length,
        percentage: ((notaVotes.length / votes.length) * 100).toFixed(1)
      } as any);

      res.json({
        constituency: req.params.constituency,
        totalVotes: votes.length,
        results: results.sort((a, b) => b.votes - a.votes)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Get voting statistics
  app.get("/api/stats", authenticate, async (req, res) => {
    try {
      const stats = await storage.getVotingStats();
      res.json({
        ...stats,
        turnoutRate: ((stats.totalVotes / stats.eligibleVoters) * 100).toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different WebSocket message types
        switch (data.type) {
          case 'subscribe_results':
            // Subscribe to real-time voting results
            ws.send(JSON.stringify({
              type: 'results_update',
              constituency: data.constituency,
              timestamp: new Date().toISOString()
            }));
            break;
          
          case 'biometric_status':
            // Real-time biometric verification status
            ws.send(JSON.stringify({
              type: 'biometric_update',
              status: data.status,
              timestamp: new Date().toISOString()
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to real-time server'
    }));
  });

  return httpServer;
}

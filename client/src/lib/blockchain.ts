import crypto from "crypto-js";

export interface BlockchainVote {
  voteId: string;
  voterId: string;
  candidateId?: number;
  constituency: string;
  timestamp: Date;
  isNota: boolean;
  blockchainHash: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: Date;
  votes: BlockchainVote[];
  previousHash: string;
  hash: string;
  nonce: number;
}

class BlockchainService {
  private blocks: BlockchainBlock[] = [];
  private difficulty = 4; // Mining difficulty

  constructor() {
    // Create genesis block
    this.createGenesisBlock();
  }

  private createGenesisBlock(): void {
    const genesisBlock: BlockchainBlock = {
      index: 0,
      timestamp: new Date(),
      votes: [],
      previousHash: "0",
      hash: this.calculateHash(0, new Date(), [], "0", 0),
      nonce: 0
    };
    this.blocks.push(genesisBlock);
  }

  private calculateHash(index: number, timestamp: Date, votes: BlockchainVote[], previousHash: string, nonce: number): string {
    const dataString = `${index}${timestamp.toISOString()}${JSON.stringify(votes)}${previousHash}${nonce}`;
    return crypto.SHA256(dataString).toString();
  }

  private mineBlock(block: BlockchainBlock): void {
    const target = Array(this.difficulty + 1).join("0");
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(
        block.index,
        block.timestamp,
        block.votes,
        block.previousHash,
        block.nonce
      );
    }
  }

  public addVote(vote: BlockchainVote): string {
    // Generate unique vote hash
    const voteHash = crypto.SHA256(
      `${vote.voteId}${vote.voterId}${vote.candidateId || 'NOTA'}${vote.timestamp.toISOString()}`
    ).toString();

    // Create new block for this vote
    const latestBlock = this.getLatestBlock();
    const newBlock: BlockchainBlock = {
      index: latestBlock.index + 1,
      timestamp: new Date(),
      votes: [{ ...vote, blockchainHash: voteHash }],
      previousHash: latestBlock.hash,
      hash: "",
      nonce: 0
    };

    // Mine the block
    this.mineBlock(newBlock);
    
    // Add to blockchain
    this.blocks.push(newBlock);

    return voteHash;
  }

  public getLatestBlock(): BlockchainBlock {
    return this.blocks[this.blocks.length - 1];
  }

  public getVotesByConstituency(constituency: string): BlockchainVote[] {
    const votes: BlockchainVote[] = [];
    
    this.blocks.forEach(block => {
      block.votes.forEach(vote => {
        if (vote.constituency === constituency) {
          votes.push(vote);
        }
      });
    });

    return votes;
  }

  public getAllVotes(): BlockchainVote[] {
    const votes: BlockchainVote[] = [];
    
    this.blocks.forEach(block => {
      votes.push(...block.votes);
    });

    return votes;
  }

  public validateChain(): boolean {
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      // Validate current block hash
      const calculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.votes,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== calculatedHash) {
        return false;
      }

      // Validate link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  public getBlockchainStats() {
    return {
      totalBlocks: this.blocks.length,
      totalVotes: this.getAllVotes().length,
      isValid: this.validateChain(),
      latestBlockHash: this.getLatestBlock().hash
    };
  }
}

// Create singleton instance
export const blockchain = new BlockchainService();

// Utility functions
export function generateVoteId(): string {
  return `VT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createBlockchainVote(
  voterId: string,
  candidateId: number | undefined,
  constituency: string,
  isNota: boolean = false
): BlockchainVote {
  return {
    voteId: generateVoteId(),
    voterId,
    candidateId,
    constituency,
    timestamp: new Date(),
    isNota,
    blockchainHash: "" // Will be set when added to blockchain
  };
}

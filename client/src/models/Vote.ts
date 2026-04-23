import { Schema, model, models } from "mongoose";

const VoteSchema = new Schema({
  /**
   * Encrypted string containing the candidateId.
   * Encryption ensures that even if someone has DB access, 
   * they can't easily tally votes without the system key.
   */
  encryptedBallot: {
    type: String,
    required: true,
  },
  /**
   * We do NOT store userId here to maintain anonymity.
   * Double voting is prevented by checking the 'hasVoted' field in the User model
   * during the voting process (using an atomic transaction).
   */
}, {
  timestamps: true,
});

const Vote = models.Vote || model("Vote", VoteSchema);

export default Vote;

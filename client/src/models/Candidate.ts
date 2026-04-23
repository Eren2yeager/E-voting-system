import { Schema, model, models } from "mongoose";

const CandidateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide candidate name'],
  },
  party: {
    type: String,
    required: [true, 'Please provide party name'],
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  posterUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Candidate = models.Candidate || model("Candidate", CandidateSchema);

export default Candidate;

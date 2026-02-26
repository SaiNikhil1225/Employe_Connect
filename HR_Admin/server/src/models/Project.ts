import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  client: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'on-hold', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String
  },
  projectManager: {
    employeeId: String,
    name: String
  },
  budget: {
    type: Number
  },
  utilization: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  requiredSkills: [{
    type: String
  }],
  teamSize: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);

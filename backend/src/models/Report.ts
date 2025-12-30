import mongoose, { Document, Schema } from 'mongoose';

export interface IScore {
  value: number; // 0-10
  confidence: 'low' | 'medium' | 'high';
}

export interface IMetric {
  label: string;
  score: IScore;
  notes?: string;
}

export interface ISection {
  title: string;
  weight: number; // relative importance
  metrics: IMetric[];
}

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  candidateName: string;
  role: string;
  overallScore: number; // weighted aggregate
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>({
  value: { type: Number, required: true, min: 0, max: 10 },
  confidence: { type: String, enum: ['low', 'medium', 'high'], required: true },
}, { _id: false });

const MetricSchema = new Schema<IMetric>({
  label: { type: String, required: true },
  score: { type: ScoreSchema, required: true },
  notes: { type: String },
}, { _id: false });

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  weight: { type: Number, required: true },
  metrics: [MetricSchema],
}, { _id: false });

const ReportSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidateName: { type: String, required: true },
    role: { type: String, required: true },
    overallScore: { type: Number, required: true, min: 0, max: 10 },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', ReportSchema);

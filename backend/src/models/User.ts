import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    github: string;
    password: string;

    onboardingCompleted: boolean;
    role?: string;
  experience?: string;
  techStack?: string[];
  goal?: string;
  interviewStyle?: 'friendly' | 'neutral' | 'strict';

    createdAt: Date;
    updatedAt: Date;
}
const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        github: { type: String, required: true, unique: true },
        password: { type: String, required: true }, 
        onboardingCompleted: { type: Boolean, default: false },
        role: { type: String },
        experience: { type: String },
        techStack: { type: [String] },
        goal: { type: String },
        interviewStyle: { type: String, enum: ['friendly', 'neutral', 'strict'], default: 'neutral' },
    },
    { timestamps: true }
);  

export default mongoose.model<IUser>('User', UserSchema);
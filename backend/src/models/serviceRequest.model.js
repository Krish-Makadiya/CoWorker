import mongoose, { Schema } from "mongoose";

const serviceRequestSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    scheduledAt: {
      type: Date,
      required: true,
    },

    preServicePhotos: {
      type: [String],
      default: [],
    },

    postServicePhotos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "accepted", "in_progress", "completed", "cancelled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

serviceRequestSchema.index({ location: "2dsphere" });

export const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

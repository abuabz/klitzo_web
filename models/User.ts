import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: false, // Optional for Google users
      sparse: true, // Only enforce unique if the value exists
      unique: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google users
    },
    authProvider: {
      type: String,
      default: "local",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Clear the model from mongoose to handle hot reloads during development
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model("User", UserSchema);

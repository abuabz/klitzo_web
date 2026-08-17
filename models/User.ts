import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
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

// Clear the model from mongoose if it doesn't have authProvider to handle hot reloads
if (mongoose.models.User && !mongoose.models.User.schema.paths.authProvider) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model("User", UserSchema);

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Schema
const userSchema = new mongoose.Schema({
  wallet: String,
  amount: Number,
  txHash: String,
  createdAt: { type: Date, default: Date.now }
});

const UserToken = mongoose.model("UserToken", userSchema);

// Webhook endpoint
app.post("/api/webhook", async (req, res) => {
  try {
    const { wallet, amount, txHash } = req.body;
    const newEntry = new UserToken({ wallet, amount, txHash });
    await newEntry.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kullanıcı token sorgulama
app.get("/api/user-tokens/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet;
    const tokens = await UserToken.find({ wallet });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sunucu başlat
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

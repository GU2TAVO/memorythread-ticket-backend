import express from "express";
import cors from "cors";
import { createSalesforceCase } from "./salesforce.js";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * =========================
 * CREATE CASE
 * =========================
 */
app.post("/api/case", async (req, res) => {
  try {
    const {
      subject,
      description,
      customerEmail,
      customerName,
      severity
    } = req.body;

    const payload = {
      subject,
      description,
      email: customerEmail,
      name: customerName,
      priority: severity
    };

    const caseId = await createSalesforceCase(payload);

    res.json({
      success: true,
      caseId
    });

  } catch (err) {
    console.error("Salesforce case error:", err);

    res.status(500).json({
      success: false,
      error: "Case creation failed"
    });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
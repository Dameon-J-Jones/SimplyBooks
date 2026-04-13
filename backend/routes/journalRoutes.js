import express from "express";
import {
  createJournalEntry,
  submitJournalEntry,
  approveJournalEntry,
  rejectJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  getLedgerByAccountId,
  uploadFile,
  getEventLogs,
  editJournalEntry
} from "../controllers/journalController.js";
import multer from "multer";

const upload = multer({ dest : "uploads/" });
const router = express.Router();

router.post("/create", createJournalEntry); // Create a journal entry (draft)
router.post("/:id/submit", submitJournalEntry); // Submit a journal entry
router.patch("/:id/approve", approveJournalEntry); // Approve a journal entry (manager)
router.patch("/:id/reject", rejectJournalEntry); // Reject a journal entry (manager)

router.get("/event-log", getEventLogs);
router.get("/ledger/:accountId", getLedgerByAccountId); // Get ledger for an account
router.get("/", getJournalEntries); // Get all journal entries (optionally filter by status/date)
router.get("/:id", getJournalEntryById); // Get a single journal entry with lines
router.post("/:id/upload", upload.single("file"), uploadFile); //upload file attachment to journal entry
router.put("/editjournal/:id", editJournalEntry); //edit journal entries, but ONLY if pending or draft

export default router;
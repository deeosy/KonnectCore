// Marks disbursed/approved loans as overdue once their dueDate has passed.
// Shared by the POST /api/loans/overdue endpoint (manual trigger) and the
// startup job in index.js so a single batch update runs periodically without
// a scheduler dependency.
import Loan from "../models/Loan.js";

export async function markOverdueLoans() {
  const now = new Date();
  const overdue = await Loan.find({
    status: { $in: ["disbursed", "approved"] },
    dueDate: { $lt: now },
  });

  if (overdue.length) {
    await Loan.updateMany(
      { _id: { $in: overdue.map((l) => l._id) } },
      { status: "overdue" },
    );
  }

  return overdue.length;
}
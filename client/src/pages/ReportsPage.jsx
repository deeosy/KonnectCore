import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const reports = [
  {
    key: "members",
    label: "Member Report",
    desc: "All members with contact details and status",
  },
  {
    key: "collections",
    label: "Collection / Harvest Report",
    desc: "Harvests by crop, date, group and member",
  },
  {
    key: "payments",
    label: "Payment Report",
    desc: "Payments by status and date range",
  },
  {
    key: "groups",
    label: "Group Summary",
    desc: "Members, harvest and payment summaries by group",
  },
  {
    key: "loans",
    label: "Loan Report",
    desc: "Loans outstanding, repaid and status",
  },
];

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState("");

  const handleExport = async (key) => {
    setExporting(key);
    try {
      const params = new URLSearchParams({ format: "xlsx" });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      // Uses raw fetch rather than the api axios instance so the response can
      // be read as a Blob without axios buffering it as JSON. The auth token
      // is attached manually since the request interceptor only runs on the
      // shared axios instance.
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reports/${key}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-report.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting("");
    }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export reports" />
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="From Date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="w-full"
            >
              Clear Dates
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-card"
          >
            <div>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-dark">{r.label}</h3>
              <p className="mt-1 text-sm text-muted">{r.desc}</p>
            </div>
            <Button
              variant="outline-primary"
              className="mt-5 w-full"
              loading={exporting === r.key}
              onClick={() => handleExport(r.key)}
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

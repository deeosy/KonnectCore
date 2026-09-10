import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileDown } from "lucide-react";
import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import DataTable from "../components/ui/DataTable";
import { formatCurrency, formatDate } from "../utils/format";
import {
  CROPS,
  LOAN_STATUSES,
  MEMBER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_TYPES,
} from "../utils/constants";

const REPORTS = [
  {
    key: "members",
    label: "Member Report",
    desc: "All members with contact details and status",
    filter: ["memberStatus", "group", "crop"],
  },
  {
    key: "collections",
    label: "Collection / Harvest Report",
    desc: "Harvests by crop, date, group and member",
    dates: true,
    filter: ["crop", "group"],
  },
  {
    key: "payments",
    label: "Payment Report",
    desc: "Payments by status, type and date range",
    dates: true,
    filter: ["paymentStatus", "type"],
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
    filter: ["loanStatus"],
  },
  {
    key: "expenses",
    label: "Expense Report",
    desc: "Recorded expenses by category and date",
    dates: true,
  },
];

const FILTER_FIELDS = {
  memberStatus: {
    label: "Status",
    options: MEMBER_STATUSES,
    param: "status",
  },
  paymentStatus: {
    label: "Payment Status",
    options: PAYMENT_STATUSES,
    param: "status",
  },
  loanStatus: {
    label: "Loan Status",
    options: LOAN_STATUSES,
    param: "status",
  },
  type: {
    label: "Payment Type",
    options: PAYMENT_TYPES,
    param: "type",
  },
  group: {
    label: "Group",
    options: [],
    param: "groupId",
    dynamic: "groups",
  },
  crop: {
    label: "Crop",
    options: CROPS.map((c) => ({ value: c, label: c })),
    param: "crop",
  },
};

const COLUMNS = {
  members: [
    { header: "Member", accessor: null, render: (r) => `${r.firstName} ${r.lastName || ""}` },
    { header: "Membership #", accessor: "membershipNumber" },
    { header: "Phone", accessor: "phone" },
    { header: "Location", accessor: "location" },
    { header: "Group", accessor: null, render: (r) => r.groupId?.name || "—" },
    { header: "Crops", accessor: null, render: (r) => (r.mainCrops || []).join(", ") || "—" },
    { header: "Officer", accessor: null, render: (r) => r.assignedOfficerId?.name || "—" },
    {
      header: "Status",
      accessor: "status",
      render: (r) => <span className="capitalize">{r.status}</span>,
    },
  ],
  collections: [
    { header: "Member", accessor: null, render: (r) => `${r.memberId?.firstName || ""} ${r.memberId?.lastName || ""}` },
    { header: "Membership #", accessor: null, render: (r) => r.memberId?.membershipNumber || "—" },
    { header: "Crop", accessor: "crop" },
    { header: "Quantity", accessor: null, render: (r) => `${r.quantity || 0} ${r.unit || "kg"}` },
    { header: "Grade", accessor: "qualityGrade" },
    { header: "Value", accessor: null, render: (r) => formatCurrency(r.totalValue) },
    { header: "Date", accessor: null, render: (r) => formatDate(r.date) },
    { header: "Captured By", accessor: null, render: (r) => r.capturedBy?.name || "—" },
  ],
  payments: [
    { header: "Member", accessor: null, render: (r) => `${r.memberId?.firstName || ""} ${r.memberId?.lastName || ""}` },
    { header: "Type", accessor: null, render: (r) => (r.type || "").replace(/_/g, " ") },
    { header: "Amount", accessor: null, render: (r) => formatCurrency(r.amount) },
    { header: "Amount Paid", accessor: null, render: (r) => formatCurrency(r.amountPaid) },
    {
      header: "Status",
      accessor: "status",
      render: (r) => <span className="capitalize">{r.status?.replace(/_/g, " ")}</span>,
    },
    {
      header: "Method",
      accessor: null,
      render: (r) => (r.method || "").replace(/_/g, " ") || "—",
    },
    { header: "Date", accessor: null, render: (r) => formatDate(r.paymentDate) },
  ],
  groups: [
    { header: "Name", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Leader", accessor: null, render: (r) => r.leaderId?.name || "—" },
    { header: "Members", accessor: "memberCount" },
    { header: "Collections", accessor: "totalCollections" },
    { header: "Harvest", accessor: null, render: (r) => `${r.totalHarvest || 0} kg` },
    { header: "Harvest Value", accessor: null, render: (r) => formatCurrency(r.totalHarvestValue) },
    { header: "Paid", accessor: null, render: (r) => formatCurrency(r.totalPaid) },
  ],
  loans: [
    { header: "Member", accessor: null, render: (r) => `${r.memberId?.firstName || ""} ${r.memberId?.lastName || ""}` },
    { header: "Type", accessor: null, render: (r) => (r.type || "").replace(/_/g, " ") },
    { header: "Amount", accessor: null, render: (r) => formatCurrency(r.amount) },
    { header: "Repaid", accessor: null, render: (r) => formatCurrency(r.amountRepaid) },
    { header: "Balance", accessor: null, render: (r) => formatCurrency(r.balance) },
    {
      header: "Status",
      accessor: "status",
      render: (r) => <span className="capitalize">{r.status}</span>,
    },
    { header: "Due", accessor: null, render: (r) => formatDate(r.dueDate) },
  ],
  expenses: [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: null, render: (r) => formatCurrency(r.amount) },
    { header: "Date", accessor: null, render: (r) => formatDate(r.date) },
    { header: "Created By", accessor: null, render: (r) => r.createdBy?.name || "—" },
  ],
};

export default function ReportsPage() {
  const [active, setActive] = useState(REPORTS[0]);
  const [filters, setFilters] = useState({ status: "", groupId: "", crop: "", type: "", from: "", to: "" });
  const [groups, setGroups] = useState([]);
  const [rows, setRows] = useState(null);
  const [count, setCount] = useState(0);
  const [exporting, setExporting] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/groups")
      .then(({ data }) =>
        setGroups((data.data || []).map((g) => ({ value: g._id, label: g.name })))
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    let stale = false;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api
      .get(`/reports/${active.key}${params.toString() ? `?${params}` : ""}`)
      .then(({ data }) => {
        if (stale) return;
        const list = data.data || [];
        setRows(list);
        setCount(data.count ?? list.length);
      })
      .catch(() => !stale && setRows([]))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [active, filters]);

  const setFilter = (key, value) => {
    setLoading(true);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const selectReport = (r) => {
    setLoading(true);
    setActive(r);
    setFilters({ status: "", groupId: "", crop: "", type: "", from: "", to: "" });
  };

  const clearFilters = () => {
    setLoading(true);
    setFilters({ status: "", groupId: "", crop: "", type: "", from: "", to: "" });
  };

  const exportFile = async (format) => {
    setExporting(format);
    try {
      const params = new URLSearchParams({ format });
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reports/${active.key}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${active.key}-report.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting("");
    }
  };

  const activeColumns = COLUMNS[active.key] || [];
  const filterFields = useMemo(
    () =>
      (active.filter || []).map((k) => ({
        ...FILTER_FIELDS[k],
        key: k,
        options: FILTER_FIELDS[k].dynamic ? groups : FILTER_FIELDS[k].options,
      })),
    [active, groups]
  );

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Filter, preview and export reports"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportFile("csv")} loading={exporting === "csv"}>
              <FileDown className="h-4 w-4" /> CSV
            </Button>
            <Button onClick={() => exportFile("xlsx")} loading={exporting === "xlsx"}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </div>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => selectReport(r)}
              className={`rounded-xl px-4 py-3 text-left transition-colors ${
                active.key === r.key
                  ? "bg-primary-50 text-primary ring-1 ring-primary-300"
                  : "text-muted hover:bg-subtle hover:text-dark"
              }`}
            >
              <p className="text-sm font-bold">{r.label.replace(" Report", "")}</p>
            </button>
          ))}
          <div className="hidden lg:block" />
        </div>
      </Card>

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {active.dates && (
            <>
              <Input
                label="From Date"
                type="date"
                value={filters.from}
                onChange={(e) => setFilter("from", e.target.value)}
              />
              <Input
                label="To Date"
                type="date"
                value={filters.to}
                onChange={(e) => setFilter("to", e.target.value)}
              />
            </>
          )}
          {filterFields.map((f) => (
            <div key={f.key}>
              <Select
                label={f.label}
                placeholder="All"
                options={f.options}
                value={filters[f.param]}
                onChange={(e) => setFilter(f.param, e.target.value || "")}
              />
            </div>
          ))}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card title={active.label} subtitle={`${count} record${count === 1 ? "" : "s"}`}>
        <div className="-mx-6 -mb-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted">
              Loading preview...
            </div>
          ) : (
            <DataTable
              columns={activeColumns}
              data={rows || []}
              emptyTitle="No matching records"
              emptyDescription="Try adjusting the filters above."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
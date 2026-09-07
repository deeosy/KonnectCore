import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { MEMBER_STATUSES, CROPS } from "../utils/constants";

// Debounce search input so we don't fire a server request on every keystroke.
// 300ms is a good balance — search still feels responsive while avoiding
// hammering the API while a user types a long name.
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    crop: "",
    location: "",
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      params.set("search", debouncedSearch);
      const { data } = await api.get(`/members?${params.toString()}`);
      setMembers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    try {
      const { data } = await api.get(`/members/export?${params.toString()}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "members.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${total} member${total === 1 ? "" : "s"} registered`}
        action={
          <>
            <Button variant="outline" onClick={handleExport} size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv,.xlsx";
                input.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  try {
                    await api.post("/members/import", fd, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    toast.success("Members imported successfully");
                    loadMembers();
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Import failed");
                  }
                };
                input.click();
              }}
              variant="secondary"
              size="sm"
            >
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button onClick={() => navigate("/members/new")} size="sm">
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <SearchBar
          placeholder="Search name, phone, ID..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        <Select
          placeholder="All statuses"
          options={MEMBER_STATUSES}
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        />
        <Select
          placeholder="All crops"
          options={CROPS}
          value={filters.crop}
          onChange={(e) => handleFilterChange("crop", e.target.value)}
        />
        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse-soft rounded-xl bg-subtle"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            title="No members found"
            description="Try adjusting your filters or add a new member."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Membership No.</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Crops</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {members.map((m) => (
                  <tr
                    key={m._id}
                    onClick={() => navigate(`/members/${m._id}`)}
                    className="cursor-pointer transition-colors hover:bg-primary-50/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${m.firstName} ${m.lastName}`}
                          src={m.photo}
                          size="sm"
                        />
                        <span className="font-semibold text-dark">
                          {m.firstName} {m.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {m.membershipNumber}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {m.phone}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {m.location || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(m.mainCrops || []).slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="rounded-lg bg-subtle px-2 py-0.5 text-xs font-medium text-muted"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-light px-5 py-3.5">
            <p className="text-sm text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

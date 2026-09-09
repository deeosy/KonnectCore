import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Hash,
  Sprout,
  FileText,
  Upload,
  Package,
  Wallet,
  HandCoins,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Avatar from "../components/ui/Avatar";
import { formatCurrency, formatDate } from "../utils/format";
import { CROPS } from "../utils/constants";
import CollectionModal from "../components/collections/CollectionModal";
import LoanRequestModal from "../components/loans/LoanRequestModal";

const tabs = [
  { key: "overview", label: "Overview", icon: User },
  { key: "farm", label: "Farm & Crops", icon: Sprout },
  { key: "collections", label: "Collections", icon: Package },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "loans", label: "Loans", icon: HandCoins },
  { key: "documents", label: "Documents", icon: FileText },
];

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState(null);
  const [farm, setFarm] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [memberRes, historyRes] = await Promise.all([
        api.get(`/members/${id}`),
        api.get(`/members/${id}/history`),
      ]);
      setMember(memberRes.data.data);
      setHistory(historyRes.data.data);
      // A farm profile may legitimately not exist for a member, so a 404 here
      // is expected and not an error â€” leave farm as null and let the tab
      // render its empty state.
      const farmRes = await api.get(`/farms/member/${id}`).catch(() => null);
      setFarm(farmRes?.data?.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse-soft rounded-xl bg-subtle" />
        <div className="h-48 animate-pulse-soft rounded-3xl bg-subtle" />
      </div>
    );
  }

  if (!member) {
    return <div className="text-muted">Member not found</div>;
  }

  const infoItems = [
    { icon: Phone, label: "Phone", value: member.phone || "â€”" },
    {
      icon: Hash,
      label: "ID Number",
      value: `${member.idType || ""} ${member.idNumber || ""}`.trim() || "â€”",
    },
    {
      icon: MapPin,
      label: "Location",
      value:
        [member.location, member.district, member.region]
          .filter(Boolean)
          .join(", ") || "â€”",
    },
    {
      icon: MapPin,
      label: "GPS",
      value: member.gpsLat ? `${member.gpsLat}, ${member.gpsLng}` : "â€”",
    },
  ];

  return (
    <div>
      <button
        onClick={() => navigate("/members")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </button>

      {/* Header card */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${member.firstName} ${member.lastName}`}
            src={member.photo}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dark">
              {member.firstName} {member.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge status={member.status} />
              <span className="text-sm text-muted">
                #{member.membershipNumber}
              </span>
              {member.groupId && (
                <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                  {member.groupId.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/members/${member._id}/edit`)}
          >
            Edit
          </Button>
          <Button size="sm" onClick={() => setCollectionOpen(true)}>
            Record Collection
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card"
          >
            <div className="flex items-center gap-2 text-muted">
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-dark">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              tab === t.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-subtle hover:text-dark"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === "overview" && (
          <OverviewTab member={member} farm={farm} history={history} />
        )}
        {tab === "farm" && (
          <FarmTab member={member} farm={farm} onRefresh={load} />
        )}
        {tab === "collections" && (
          <CollectionsTab member={member} collections={history?.collections || []} onRefresh={load} />
        )}
        {tab === "payments" && (
          <PaymentsTab payments={history?.payments || []} />
        )}
        {tab === "loans" && <LoansTab member={member} loans={history?.loans || []} onRefresh={load} />}
        {tab === "documents" && (
          <DocumentsTab member={member} onRefresh={load} />
        )}
      </Card>

      <CollectionModal
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        member={member}
        onSaved={() => {
          setCollectionOpen(false);
          load();
          setTab("collections");
        }}
      />
    </div>
  );
}

function OverviewTab({ member, farm, history }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-base font-bold text-dark">
          Agriculture Summary
        </h3>
        <div className="space-y-2 text-sm">
          {[
            {
              label: "Farm Size",
              value: `${farm?.farmSize ?? member.farmSize ?? "â€”"} ha`,
            },
            {
              label: "Main Crops",
              value: (member.mainCrops || []).join(", ") || "â€”",
            },
            {
              label: "Assigned Officer",
              value: member.assignedOfficerId?.name || "â€”",
            },
            { label: "Registered", value: formatDate(member.createdAt) },
          ].map((item) => (
            <p
              key={item.label}
              className="flex justify-between border-b border-border-light pb-2"
            >
              <span className="text-muted">{item.label}</span>
              <span className="font-semibold text-dark">{item.value}</span>
            </p>
          ))}
        </div>
        {member.notes && (
          <div className="mt-4 rounded-xl bg-subtle p-3 text-sm text-muted">
            {member.notes}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 text-base font-bold text-dark">Timeline</h3>
        {!history || !history.timeline || history.timeline.length === 0 ? (
          <p className="text-sm text-muted">No activity yet</p>
        ) : (
          <ul className="space-y-3">
            {history.timeline.slice(0, 8).map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-semibold text-dark capitalize">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted">{item.detail}</p>
                  <p className="text-xs text-muted-light">
                    {formatDate(item.date, true)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const CROP_STATUSES = [
  { value: "planted", label: "Planted" },
  { value: "growing", label: "Growing" },
  { value: "harvested", label: "Harvested" },
  { value: "failed", label: "Failed" },
]

const CROP_STATUS_STYLES = {
  planted: "bg-primary-50 text-primary-700 border-primary-200",
  growing: "bg-info-50 text-secondary-700 border-info-100",
  harvested: "bg-success-50 text-success-700 border-success-200",
  failed: "bg-danger-50 text-danger-700 border-danger-200",
}

function formatDateToInput(date) {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

function FarmTab({ member, farm, onRefresh }) {
  const [cropModal, setCropModal] = useState({ open: false, crop: null })
  const [farmModal, setFarmModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const crops = farm?.crops || []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">
          Farm Profile {farm?.farmSize ? `- ${farm.farmSize} ha` : ""}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setFarmModal(true)}
          >
            {farm ? "Edit Farm Details" : "Add Farm Details"}
          </Button>
          <Button
            size="sm"
            onClick={() => setCropModal({ open: true, crop: null })}
          >
            Add Crop
          </Button>
        </div>
      </div>

      {/* Farm details summary */}
      {farm && (
        <div className="mb-6 grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Farm size</p>
            <p className="mt-1 text-sm font-bold text-dark">{farm.farmSize ? `${farm.farmSize} ha` : "â€”"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Location</p>
            <p className="mt-1 text-sm font-bold text-dark">{farm.location || "â€”"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">GPS</p>
            <p className="mt-1 text-sm font-bold text-dark">
              {farm.gpsLat && farm.gpsLng ? `${farm.gpsLat.toFixed(5)}, ${farm.gpsLng.toFixed(5)}` : "â€”"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Season</p>
            <p className="mt-1 text-sm font-bold text-dark">{farm.currentSeason || "â€”"}</p>
          </div>
          {farm.notes && (
            <p className="text-sm text-muted sm:col-span-2 lg:col-span-4">{farm.notes}</p>
          )}
        </div>
      )}

      {crops.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No crops recorded yet</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {crops.map((crop) => (
            <div key={crop._id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold capitalize ${CROP_STATUS_STYLES[crop.status] || "bg-subtle text-muted"}`}>
                    {crop.status}
                  </span>
                  <h4 className="font-semibold text-dark">{crop.cropName}</h4>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCropModal({ open: true, crop })}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                    title="Edit crop"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(crop)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-50 hover:text-danger"
                    title="Delete crop"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {crop.variety && <p className="text-sm text-muted">{crop.variety}</p>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted">Area: <span className="font-semibold text-dark">{crop.areaHectares || "â€”"} ha</span></p>
                <p className="text-muted">Season: <span className="font-semibold text-dark">{crop.season || "â€”"}</span></p>
                <p className="text-muted">Planted: <span className="font-semibold text-dark">{formatDate(crop.plantingDate)}</span></p>
                <p className="text-muted">Harvest: <span className="font-semibold text-dark">{formatDate(crop.expectedHarvestDate)}</span></p>
                <p className="text-muted">Est. Yield: <span className="font-semibold text-dark">{crop.estimatedYield ?? "â€”"}</span></p>
                <p className="text-muted">Actual: <span className="font-semibold text-dark">{crop.actualYield ?? "â€”"}</span></p>
              </div>
              {crop.notes && <p className="mt-2 border-t border-border-light pt-2 text-xs text-muted">{crop.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <CropFormModal
        key={cropModal.open ? (cropModal.crop?._id || "new") : "closed"}
        open={cropModal.open}
        crop={cropModal.crop}
        memberId={member._id}
        onClose={() => setCropModal({ open: false, crop: null })}
        onSaved={onRefresh}
      />
      <FarmDetailsModal
        open={farmModal}
        farm={farm}
        memberId={member._id}
        onClose={() => setFarmModal(false)}
        onSaved={onRefresh}
      />
      <DeleteCropModal
        crop={deleteTarget}
        memberId={member._id}
        onClose={() => setDeleteTarget(null)}
        onDeleted={onRefresh}
      />
    </div>
  )
}

function CropFormModal({ open, crop, memberId, onClose, onSaved }) {
  const [form, setForm] = useState({
    cropName: "",
    variety: "",
    areaHectares: "",
    plantingDate: "",
    season: "",
    expectedHarvestDate: "",
    status: "planted",
    estimatedYield: "",
    actualYield: "",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      setForm(
        crop
          ? {
              cropName: crop.cropName || "",
              variety: crop.variety || "",
              areaHectares: crop.areaHectares || "",
              plantingDate: formatDateToInput(crop.plantingDate),
              season: crop.season || "",
              expectedHarvestDate: formatDateToInput(crop.expectedHarvestDate),
              status: crop.status || "planted",
              estimatedYield: crop.estimatedYield || "",
              actualYield: crop.actualYield || "",
              notes: crop.notes || "",
            }
          : {
              cropName: "",
              variety: "",
              areaHectares: "",
              plantingDate: "",
              season: "",
              expectedHarvestDate: "",
              status: "planted",
              estimatedYield: "",
              actualYield: "",
              notes: "",
            },
      )
    }
  }, [open, crop])

  const submit = async () => {
    if (!form.cropName) {
      toast.error("Select a crop")
      return
    }
    const payload = {
      ...form,
      areaHectares: form.areaHectares ? Number(form.areaHectares) : undefined,
      estimatedYield: form.estimatedYield ? Number(form.estimatedYield) : undefined,
      actualYield: form.actualYield ? Number(form.actualYield) : undefined,
    }
    try {
      if (crop) {
        await api.put(`/farms/member/${memberId}/crops/${crop._id}`, payload)
        toast.success("Crop updated")
      } else {
        await api.post(`/farms/member/${memberId}/crops`, payload)
        toast.success("Crop added")
      }
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save crop")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={crop ? `Edit ${crop.cropName}` : "Add Crop"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{crop ? "Save Changes" : "Add Crop"}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Crop *"
          options={CROPS.map((c) => ({ value: c, label: c }))}
          value={form.cropName}
          onChange={(e) => setForm((f) => ({ ...f, cropName: e.target.value }))}
        />
        <Input
          label="Variety"
          value={form.variety}
          onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))}
        />
        <Input
          label="Area (ha)"
          type="number"
          min="0"
          step="0.01"
          value={form.areaHectares}
          onChange={(e) => setForm((f) => ({ ...f, areaHectares: e.target.value }))}
        />
        <Input
          label="Planting date"
          type="date"
          value={form.plantingDate}
          onChange={(e) => setForm((f) => ({ ...f, plantingDate: e.target.value }))}
        />
        <Input
          label="Expected harvest date"
          type="date"
          value={form.expectedHarvestDate}
          onChange={(e) => setForm((f) => ({ ...f, expectedHarvestDate: e.target.value }))}
        />
        <Select
          label="Status"
          options={CROP_STATUSES}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        />
        <Input
          label="Season"
          placeholder="e.g. 2026A, Major"
          value={form.season}
          onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
        />
        <Input
          label="Estimated yield"
          type="number"
          min="0"
          value={form.estimatedYield}
          onChange={(e) => setForm((f) => ({ ...f, estimatedYield: e.target.value }))}
        />
        <Input
          label="Actual yield"
          type="number"
          min="0"
          value={form.actualYield}
          onChange={(e) => setForm((f) => ({ ...f, actualYield: e.target.value }))}
        />
        <div className="sm:col-span-2">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  )
}

function FarmDetailsModal({ open, farm, memberId, onClose, onSaved }) {
  const [form, setForm] = useState({
    farmSize: "",
    location: "",
    gpsLat: "",
    gpsLng: "",
    currentSeason: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        farmSize: farm?.farmSize || "",
        location: farm?.location || "",
        gpsLat: farm?.gpsLat || "",
        gpsLng: farm?.gpsLng || "",
        currentSeason: farm?.currentSeason || "",
        notes: farm?.notes || "",
      })
    }
  }, [open, farm])

  const submit = async () => {
    setSaving(true)
    const payload = {
      ...form,
      farmSize: form.farmSize ? Number(form.farmSize) : undefined,
      gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
      gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined,
    }
    try {
      if (farm) {
        await api.put(`/farms/${farm._id}`, payload)
        toast.success("Farm details updated")
      } else {
        await api.post(`/farms/member/${memberId}`, payload)
        toast.success("Farm profile created")
      }
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save farm details")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={farm ? "Edit Farm Details" : "Add Farm Details"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Farm size (ha)"
          type="number"
          min="0"
          step="0.01"
          value={form.farmSize}
          onChange={(e) => setForm((f) => ({ ...f, farmSize: e.target.value }))}
          hint="Total farm area in hectares"
        />
        <Input
          label="Location"
          value={form.location}
          placeholder="Village / town"
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <Input
          label="GPS latitude"
          type="number"
          step="any"
          value={form.gpsLat}
          onChange={(e) => setForm((f) => ({ ...f, gpsLat: e.target.value }))}
          placeholder="e.g. 6.6938"
        />
        <Input
          label="GPS longitude"
          type="number"
          step="any"
          value={form.gpsLng}
          onChange={(e) => setForm((f) => ({ ...f, gpsLng: e.target.value }))}
          placeholder="e.g. -1.6309"
        />
        <Input
          label="Current season"
          value={form.currentSeason}
          placeholder="e.g. 2026A"
          onChange={(e) => setForm((f) => ({ ...f, currentSeason: e.target.value }))}
        />
        <div className="sm:col-span-2">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  )
}

function DeleteCropModal({ crop, memberId, onClose, onDeleted }) {
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api.delete(`/farms/member/${memberId}/crops/${crop._id}`)
      toast.success("Crop removed")
      onClose()
      if (onDeleted) onDeleted()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove crop")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!crop}
      onClose={onClose}
      title="Delete Crop"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={saving} onClick={submit}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        Remove <span className="font-semibold text-dark">{crop?.cropName}</span> from this farm? This does not affect collection history.
      </p>
    </Modal>
  )
}

function CollectionsTab({ member, collections, onRefresh }) {
  const [settleOpen, setSettleOpen] = useState(false)
  const [settling, setSettling] = useState(false)
  const [settleForm, setSettleForm] = useState({ method: "cash", paymentDate: formatDateToInput(new Date()) })
  const [checked, setChecked] = useState({})

  const selectedCollectionIds = Object.keys(checked || {}).filter((id) => checked[id])
  const selected = collections.filter((c) => selectedCollectionIds.includes(c._id))
  const settleTotal = selected.reduce((s, c) => s + (c.totalValue || 0), 0)

  const toggleAll = () => {
    const allOn = selectedCollectionIds.length === collections.length
    setChecked(
      Object.fromEntries(collections.map((c) => [c._id, !allOn])),
    )
  }

  const submitSettle = async () => {
    if (!selectedCollectionIds.length) {
      toast.error("Select at least one collection")
      return
    }
    setSettling(true)
    try {
      await api.post("/payments/produce", {
        memberId: member._id,
        collectionIds: selectedCollectionIds,
        method: settleForm.method,
        paymentDate: settleForm.paymentDate || new Date(),
      })
      toast.success("Produce payment recorded")
      setSettleOpen(false)
      setChecked({})
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to settle collections")
    } finally {
      setSettling(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">Collection History</h3>
        {collections.length > 0 && (
          <Button size="sm" onClick={() => setSettleOpen(true)}>
            Settle Produce
          </Button>
        )}
      </div>
      {collections.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No collections recorded
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border-light">
            <thead>
              <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Crop</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {collections.map((c) => (
                <tr key={c._id} className="hover:bg-subtle/30">
                  <td className="px-4 py-3 text-sm text-muted">
                    {formatDate(c.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">
                    {c.crop}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.quantity} {c.unit}
                  </td>
                  <td className="px-4 py-3 text-sm">{c.qualityGrade}</td>
                  <td className="px-4 py-3 text-sm">{c.pricePerUnit}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">
                    {formatCurrency(c.totalValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        title="Settle Produce Collections"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>
              Cancel
            </Button>
            <Button loading={settling} onClick={submitSettle}>
              Record Produce Payment ({formatCurrency(settleTotal)})
            </Button>
          </>
        }
      >
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={toggleAll}
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedCollectionIds.length === collections.length ? "border-primary bg-primary" : "border-border bg-surface"}`}
          >
            {selectedCollectionIds.length === collections.length && <span className="text-[10px] font-bold text-white">✓</span>}
          </button>
          <span className="text-sm font-semibold text-dark">Select all ({collections.length})</span>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {collections.map((c) => {
            const isOn = !!checked[c._id]
            return (
              <label
                key={c._id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${isOn ? "border-primary bg-primary-50" : "border-border hover:bg-subtle/50"}`}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => setChecked((x) => ({ ...x, [c._id]: !isOn }))}
                  className="h-4 w-4 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark">{c.crop}</p>
                  <p className="text-xs text-muted">
                    {formatDate(c.date)} · {c.quantity} {c.unit} · Grade {c.qualityGrade}
                  </p>
                </div>
                <span className="text-sm font-bold text-dark">{formatCurrency(c.totalValue)}</span>
              </label>
            )
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Select
            label="Payout method"
            options={[
              { value: "cash", label: "Cash" },
              { value: "mobile_money", label: "Mobile Money (Hubtel)" },
              { value: "bank_transfer", label: "Bank Transfer" },
              { value: "cheque", label: "Cheque" },
              { value: "other", label: "Other" },
            ]}
            value={settleForm.method}
            onChange={(e) => setSettleForm((f) => ({ ...f, method: e.target.value }))}
          />
          <Input
            label="Payment date"
            type="date"
            value={settleForm.paymentDate}
            onChange={(e) => setSettleForm((f) => ({ ...f, paymentDate: e.target.value }))}
          />
        </div>
        {settleForm.method === "mobile_money" && (
          <div className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-xs text-primary">
            <span className="font-semibold">Hubtel send: </span>
            payout lands in the member's wallet
            {member.phone ? (
              <> via <span className="font-bold">{member.phone}</span></>
            ) : (
              <span className="font-semibold text-danger"> — this member has no phone number on file.</span>
            )}
            . In demo mode (no Hubtel credentials) the transaction is simulated.
          </div>
        )}
      </Modal>
    </div>
  );
}

function PaymentsTab({ payments }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-dark">Payment History</h3>
      {payments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No payments recorded
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border-light">
            <thead>
              <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-subtle/30">
                  <td className="px-4 py-3 text-sm text-muted">
                    {formatDate(p.paymentDate)}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {p.type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {p.method.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoansTab({ member, loans, onRefresh }) {
  const [requestOpen, setRequestOpen] = useState(false)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">Loans</h3>
        <Button size="sm" onClick={() => setRequestOpen(true)}>
          Request Loan
        </Button>
      </div>
      {loans.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No loans</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {loans.map((l) => (
            <div key={l._id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize text-dark">
                  {l.type} Loan
                </h4>
                <Badge status={l.status} />
              </div>
              {l.purpose && <p className="mt-0.5 text-xs text-muted">{l.purpose}</p>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted">
                  Amount:{" "}
                  <span className="font-semibold text-dark">
                    {formatCurrency(l.amount)}
                  </span>
                </p>
                <p className="text-muted">
                  Balance:{" "}
                  <span className="font-semibold text-dark">
                    {formatCurrency(l.balance)}
                  </span>
                </p>
                <p className="text-muted">
                  Due:{" "}
                  <span className="font-semibold text-dark">
                    {formatDate(l.dueDate)}
                  </span>
                </p>
                <p className="text-muted">
                  Repayments:{" "}
                  <span className="font-semibold text-dark">
                    {(l.repaymentSchedule || []).length}
                  </span>
                </p>
              </div>
              {l.repaymentSchedule?.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border-light pt-2 text-xs text-muted">
                  {l.repaymentSchedule.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="capitalize">{r.method.replace(/_/g, " ")} · {formatDate(r.date)}</span>
                      <span className="font-semibold text-dark">{formatCurrency(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to={`/loans/${l._id}`}
                className="mt-3 inline-flex text-xs font-semibold text-primary hover:text-primary-hover"
              >
                View full schedule →
              </Link>
            </div>
          ))}
        </div>
      )}
      <LoanRequestModal
        open={requestOpen}
        member={member}
        onClose={() => setRequestOpen(false)}
        onSaved={() => {
          setRequestOpen(false)
          if (onRefresh) onRefresh()
        }}
      />
    </div>
  );
}

function DocumentsTab({ member, onRefresh }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      fd.append("title", file.name);
      await api.post(`/members/${member._id}/documents`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">Documents & Photos</h3>
        <Button
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById("doc-upload").click()}
        >
          <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          id="doc-upload"
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {member.documents?.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No documents attached
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {member.documents.map((doc) => (
            <a
              key={doc._id}
              href={doc.filePath}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
            >
              <FileText className="h-8 w-8 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dark">
                  {doc.title || doc.fileName}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(doc.createdAt)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


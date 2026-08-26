import { useState } from "react";
import { Card, CardHeader, CardBody, Button, Input, Select } from "./ui.jsx";
import { api } from "../lib/api.js";
import { CheckCircle2 } from "lucide-react";

const CITY_OPTIONS = [
  "Sacramento, CA", "Fresno, CA", "Stockton, CA", "Modesto, CA", "Manteca, CA",
  "Hayward, CA", "Oakland, CA", "San Jose, CA", "Los Angeles, CA", "San Diego, CA",
  "Bakersfield, CA", "San Francisco, CA", "Merced, CA", "Turlock, CA",
];

const initialState = {
  carrier_name: "",
  origin: CITY_OPTIONS[0],
  destination: CITY_OPTIONS[1],
  earliest_date: "",
  latest_date: "",
  capacity_lbs: "",
  truck_type: "Dry Van",
};

export default function PostEmptyLeg() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createEmptyLeg({
        ...form,
        capacity_lbs: form.capacity_lbs ? Number(form.capacity_lbs) : null,
      });
      setSuccess(`Empty leg posted: ${form.origin} → ${form.destination}`);
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">For Carrier</h2>
        <p className="mt-1 text-sm text-slate-500">
          Let shippers along this route know your truck is heading back empty.
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-slate-700">Carrier details</span>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Carrier name"
              placeholder="e.g. Valley Freight Co."
              value={form.carrier_name}
              onChange={update("carrier_name")}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Origin" value={form.origin} onChange={update("origin")}>
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Destination" value={form.destination} onChange={update("destination")}>
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Earliest available date"
                type="date"
                value={form.earliest_date}
                onChange={update("earliest_date")}
                required
              />
              <Input
                label="Latest available date"
                type="date"
                value={form.latest_date}
                onChange={update("latest_date")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capacity (lbs)"
                type="number"
                placeholder="e.g. 40000"
                value={form.capacity_lbs}
                onChange={update("capacity_lbs")}
              />
              <Select label="Truck type" value={form.truck_type} onChange={update("truck_type")}>
                <option>Dry Van</option>
                <option>Flatbed</option>
                <option>Box Truck</option>
                <option>Reefer</option>
              </Select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Posting..." : "Submit"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

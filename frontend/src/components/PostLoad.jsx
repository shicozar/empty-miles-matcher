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
  shipper_name: "",
  origin: CITY_OPTIONS[0],
  destination: CITY_OPTIONS[1],
  cargo_type: "",
  weight_lbs: "",
  needed_by: "",
  urgency: "standard",
  notes: "",
};

export default function PostLoad() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createLoad({
        ...form,
        weight_lbs: form.weight_lbs ? Number(form.weight_lbs) : null,
      });
      setResult(res);
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
        <h2 className="text-lg font-semibold text-slate-900">For shippers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what you need moved — we'll check it against trucks already heading that way.
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-slate-700">Shipment details</span>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Shipper name"
              placeholder="e.g. Foothill Foods Co."
              value={form.shipper_name}
              onChange={update("shipper_name")}
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
                label="Cargo type"
                placeholder="e.g. Packaged food"
                value={form.cargo_type}
                onChange={update("cargo_type")}
                required
              />
              <Input
                label="Weight (lbs)"
                type="number"
                placeholder="e.g. 12000"
                value={form.weight_lbs}
                onChange={update("weight_lbs")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Needed by"
                type="date"
                value={form.needed_by}
                onChange={update("needed_by")}
                required
              />
              <Select label="Urgency" value={form.urgency} onChange={update("urgency")}>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <Input
              label="Notes (optional)"
              placeholder="Anything a carrier should know"
              value={form.notes}
              onChange={update("notes")}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {result && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 size={16} />
                Load posted — {result.potentialMatches} potential match{result.potentialMatches === 1 ? "" : "es"} found. Check the Matches tab.
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

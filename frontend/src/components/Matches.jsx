import { useEffect, useState } from "react";
import { Card, CardBody, Badge, Button } from "./ui.jsx";
import { api } from "../lib/api.js";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRecovered = matches.reduce((sum, m) => sum + (m.suggestedPrice || 0), 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Matches</h2>
          <p className="mt-1 text-sm text-slate-500">
            Empty return legs matched with loads along the same route.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {matches.length > 0 && (
        <Card className="mb-6 bg-brand-50 border-brand-100">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-700">Revenue recovered from empty miles</p>
              <p className="text-2xl font-semibold text-brand-900">
                ${totalRecovered.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-brand-700">
              across {matches.length} matched trip{matches.length === 1 ? "" : "s"}
            </p>
          </CardBody>
        </Card>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Finding matches...</p>}

      {!loading && matches.length === 0 && !error && (
        <Card>
          <CardBody className="text-center text-sm text-slate-500 py-10">
            No matches yet. Post an empty leg and a load along a similar route to see a match appear here.
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {matches.map((m) => (
          <Card key={`${m.leg.id}-${m.load.id}`}>
            <CardBody>
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    {m.leg.origin}
                    <ArrowRight size={14} className="text-slate-400" />
                    {m.leg.destination}
                    <Badge tone="slate">{Math.round(m.legDistanceMiles)} mi</Badge>
                    {m.load.urgency === "urgent" && <Badge tone="amber">Urgent</Badge>}
                    <Badge tone="green">{m.score}% match</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{m.leg.carrier_name}</span>'s empty leg
                    matched with <span className="font-medium text-slate-900">{m.load.shipper_name}</span>'s
                    load of {m.load.cargo_type.toLowerCase()}
                    {m.load.weight_lbs ? ` (${m.load.weight_lbs.toLocaleString()} lbs)` : ""}.
                  </p>
                  <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <Sparkles size={13} className="mt-0.5 shrink-0 text-brand-500" />
                    {m.rationale}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Suggested price</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    ${m.suggestedPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-6";

/**
 * Ask Claude for a suggested price + one-line rationale for a matched leg/load pair.
 * Falls back to a simple heuristic if no API key is set, so the app still runs
 * end-to-end for local testing without a key.
 */
export async function suggestPrice({ leg, load, legDistanceMiles, score, dateSlackDays }) {
  if (!ANTHROPIC_API_KEY) {
    return heuristicPrice({ legDistanceMiles, score, load });
  }

  const prompt = `You are a pricing assistant for a trucking backhaul marketplace.
A carrier has an empty return leg and a shipper has a load that matches it.

Route: ${leg.origin} -> ${leg.destination} (~${Math.round(legDistanceMiles)} miles)
Cargo: ${load.cargo_type}, ${load.weight_lbs || "unknown"} lbs
Urgency: ${load.urgency}
Match quality score: ${score}/100
Date fit slack: ${dateSlackDays} day(s)

Since this truck was already driving this route empty, any price is pure upside for the carrier,
so it should be priced BELOW a normal dedicated haul to be attractive to the shipper -
think 40-65% of what a full dedicated truck rate would cost for this distance.

Respond with ONLY a JSON object, no other text:
{"suggested_price": <number, USD>, "rationale": "<one short sentence, under 20 words>"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return heuristicPrice({ legDistanceMiles, score, load });
    }

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      suggested_price: Math.round(parsed.suggested_price),
      rationale: parsed.rationale,
    };
  } catch (err) {
    console.error("Pricing call failed, falling back to heuristic:", err.message);
    return heuristicPrice({ legDistanceMiles, score, load });
  }
}

// Simple fallback so the app is fully runnable without an API key set.

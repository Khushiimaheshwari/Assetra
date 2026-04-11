/**
 * PYTHON_AI_SERVICE_URL may be base (http://host:5000) or full predict URL.
 */
export function getPythonPredictUrl() {
  const base = process.env.PYTHON_AI_SERVICE_URL;
  if (!base) return null;
  const trimmed = base.trim();
  return trimmed.endsWith("/predict")
    ? trimmed
    : `${trimmed.replace(/\/$/, "")}/predict`;
}

export function explainAiFetchFailure(err) {
  const code = err?.cause?.code ?? err?.code;
  if (code === "ECONNREFUSED") {
    return "AI service is not running. In another terminal, from the platform folder, run: npm run ai-service";
  }
  return "AI prediction failed during asset creation";
}

import { ContractAnalysis, ChatQueryResponse } from "@/types/contract";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  geminiConfigured: boolean;
  model: string;
}

/**
 * Check backend connection and Gemini configuration status
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Backend health check failed:", err);
    return null;
  }
}

/**
 * Upload a contract file (PDF, DOCX, or text) to the backend for structured AI analysis
 */
export async function analyzeContractFile(file: File): Promise<ContractAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/analyze/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to the Signwise backend at ${API_BASE_URL}. Please ensure the backend server is running.`
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Contract analysis failed with status ${res.status}`
    );
  }

  return await res.json();
}

/**
 * Send raw contract text to the backend for analysis
 */
export async function analyzeContractText(
  text: string,
  fileName: string = "Pasted_Contract.txt"
): Promise<ContractAnalysis> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/analyze/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ text, fileName }),
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to the Signwise backend at ${API_BASE_URL}. Please ensure the backend server is running.`
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Text analysis failed with status ${res.status}`
    );
  }

  return await res.json();
}

/**
 * Ask a conversational question about an analyzed contract
 */
export async function askContractQuestion(
  question: string,
  documentText?: string,
  analysis?: ContractAnalysis
): Promise<ChatQueryResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        question,
        documentText,
        analysis,
      }),
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to the Signwise backend at ${API_BASE_URL}. Please ensure the backend server is running.`
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Chat request failed with status ${res.status}`
    );
  }

  return await res.json();
}

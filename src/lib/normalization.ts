import { createHash } from "crypto";

export interface NormalizableMetadata {
  studentName: string;
  studentEmail: string;
  issuerId: string;
  issuerName: string;
  title: string;
  credentialType: string;
  issueDate: string;
  expiryDate: string;
}

export function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // collapse multiple spaces to a single space
}

export function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (trimmed.toLowerCase() === "never" || trimmed.toLowerCase() === "never expired" || trimmed === "") {
    return "never";
  }
  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return trimmed.toLowerCase();
    }
    // Return standard YYYY-MM-DD
    return d.toISOString().split("T")[0];
  } catch (e) {
    return trimmed.toLowerCase();
  }
}

export function getNormalizedMetadata(data: NormalizableMetadata) {
  // Enforce consistent field ordering by returning an object with sorted keys
  return {
    credentialType: normalizeString(data.credentialType),
    expiryDate: normalizeDate(data.expiryDate),
    issueDate: normalizeDate(data.issueDate),
    issuerId: normalizeString(data.issuerId),
    issuerName: normalizeString(data.issuerName),
    studentEmail: normalizeString(data.studentEmail),
    studentName: normalizeString(data.studentName),
    title: normalizeString(data.title),
  };
}

export function getSerializedNormalizedMetadata(data: NormalizableMetadata): string {
  const normalized = getNormalizedMetadata(data);
  return JSON.stringify(normalized);
}

export function calculateMetadataHashServer(data: NormalizableMetadata): string {
  const serialized = getSerializedNormalizedMetadata(data);
  const hash = createHash("sha256").update(serialized).digest("hex");
  return `0x${hash}`;
}

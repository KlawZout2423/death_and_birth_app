type RecordStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "NOTIFIED"
  | "CERTIFICATE_ISSUED"
  | string;

export type MetricRecord = {
  status: RecordStatus;
};

export function isVerifiedStage(status: RecordStatus) {
  return status === "VERIFIED" || status === "NOTIFIED" || status === "CERTIFICATE_ISSUED";
}

export function isPendingStage(status: RecordStatus) {
  return status === "PENDING_VERIFICATION";
}

export function getRecordMetrics(records: MetricRecord[]) {
  const totalRecords = records.length;
  const pendingVerification = records.filter((r) => isPendingStage(r.status)).length;
  const verifiedRecords = records.filter((r) => isVerifiedStage(r.status)).length;

  return {
    totalRecords,
    pendingVerification,
    verifiedRecords,
  };
}


export function mapUltravoxStatusToLabel(status: string | undefined): string {
  if (!status) return "Offline";

  const s = status.toLowerCase();

  switch (true) {
    case s.includes("connected"):
      return "Connected";

    case s.includes("verifying"):
      return "Verifying patient details";

    case s.includes("checking"):
      return "Checking availability";

    case s.includes("confirm"):
      return "Finalizing appointment";

    case s.includes("end"):
      return "Call ended";

    case s.includes("error"):
    case s.includes("403"):
    case s.includes("unauthorized"):
    case s.includes("invalid api"):
      return "We're having trouble connecting. Please try again later.";

    default:
      return "Connecting...";
  }
}

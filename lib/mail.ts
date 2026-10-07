/** Email sender. Uses Resend if RESEND_API_KEY is set, otherwise logs to the server console. */
export async function sendMail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ")}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "VERANO <no-reply@example.com>", to, subject, html }),
  });
  if (!res.ok) console.error("[mail] send failed", res.status);
}

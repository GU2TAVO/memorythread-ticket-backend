const SF_ENDPOINT =
  "https://YOUR_INSTANCE.my.salesforce.com/services/apexrest/memorythread/case";

export async function createSalesforceCase(ticket: any) {
  const payload = {
    subject: ticket.subject,
    description: ticket.description,
    severity: ticket.severity.toUpperCase(),
    customerName: ticket.customerName,
    customerEmail: ticket.customerEmail
  };

  const res = await fetch(SF_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // TEMP ONLY (for dev)
      // Replace with OAuth later
      "Authorization": "Bearer YOUR_SESSION_ID"
    },
    body: JSON.stringify(payload)
  });

  return await res.json();
}
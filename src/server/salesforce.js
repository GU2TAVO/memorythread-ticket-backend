import fetch from "node-fetch";

/**
 * Replace with your real Salesforce instance
 */
const SF_INSTANCE = "https://orgfarm-0a03ae8731-dev-ed.develop.my.salesforce.com";
const SF_TOKEN = "zIBu2tkUzPrwTp3ZFWqy9f2z";

export async function createSalesforceCase(payload) {
  const res = await fetch(`${SF_INSTANCE}/services/data/v60.0/sobjects/Case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SF_TOKEN}`
    },
    body: JSON.stringify({
      Subject: payload.subject,
      Description: payload.description,
      SuppliedEmail: payload.email,
      SuppliedName: payload.name,
      Priority: payload.priority,
      Origin: "Web"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.id;
}
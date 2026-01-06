export async function handler(event) {
  try {
    // Only allow POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    // Parse body safely
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON" })
      };
    }

    const { prompt } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Empty prompt" })
      };
    }

    // Call Cloudflare Worker (Stable Diffusion XL)
    const res = await fetch(
      "https://hackoai-img.tariqmtaezeem.workers.dev",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: "Image API Error",
          details: text
        })
      };
    }

    const data = await res.json();

    // data = { image: "base64..." }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server crashed 💀",
        details: err.message
      })
    };
  }
}

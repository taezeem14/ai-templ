export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { prompt, model } = JSON.parse(event.body || "{}");

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Prompt is required" })
    };
  }

  try {
    // SubNP Free API endpoint
    const res = await fetch("https://t2i.mcpcore.xyz/api/free/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        model: model || "turbo" // default model
      })
    });

    if (!res.ok) throw new Error(`SubNP API returned ${res.status}`);

    // Streamed response parsing (if using SSE)
    const reader = res.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            // split lines and parse SSE
            const lines = chunk.split("\n");
            lines.forEach((line) => {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  // only send back complete image URL
                  if (data.status === "complete") {
                    controller.enqueue(data.imageUrl + "\n");
                  }
                } catch {}
              }
            });
          },
        })
      );

    const readerStream = reader.getReader();
    let imageUrl = "";

    while (true) {
      const { done, value } = await readerStream.read();
      if (done) break;
      imageUrl += value;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: imageUrl.trim() })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

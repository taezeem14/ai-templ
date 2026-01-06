export async function handler(event) {
  const { prompt } = JSON.parse(event.body);
  const SUBNP_KEY = process.env.SUBNP_KEY;

  const subnpRes = await fetch("https://subnp.com/api/free/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "A cyberpunk hacker room",
    model: "turbo"
  })
});

const SELLER_ID = "798153629";
const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ML_REFRESH_TOKEN;

async function getAccessToken() {
  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Token error");
  return data.access_token;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const offset = parseInt(req.query.offset || "0");
  const limit = parseInt(req.query.limit || "50");

  try {
    const token = await getAccessToken();

    // Buscar IDs de items del vendedor
    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?seller_id=${SELLER_ID}&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();

    console.log("search status:", searchRes.status);
    console.log("search paging:", JSON.stringify(searchData.paging));
    console.log("results count:", searchData.results?.length);

    const products = searchData.results || [];
    const paging = searchData.paging || { total: 0 };

    res.status(200).json({ products, paging });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

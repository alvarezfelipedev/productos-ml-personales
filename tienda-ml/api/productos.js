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

    const mlRes = await fetch(
      `https://api.mercadolibre.com/users/${SELLER_ID}/items/search?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { results: ids, paging } = await mlRes.json();

    if (!ids || ids.length === 0) {
      return res.status(200).json({ products: [], paging: { total: 0 } });
    }

    // Fetch product details in batch
    const detailRes = await fetch(
      `https://api.mercadolibre.com/items?ids=${ids.join(",")}&attributes=id,title,price,thumbnail,permalink,condition,shipping,currency_id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const details = await detailRes.json();
    const products = details
      .filter((d) => d.code === 200)
      .map((d) => d.body);

    res.status(200).json({ products, paging });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

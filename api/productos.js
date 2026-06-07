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
  if (!res.ok) throw new Error("Token error: " + JSON.stringify(data));
  return { token: data.access_token, newRefresh: data.refresh_token };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // 1. Verificar env vars
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        CLIENT_ID: !!CLIENT_ID,
        CLIENT_SECRET: !!CLIENT_SECRET,
        REFRESH_TOKEN: !!REFRESH_TOKEN,
      });
    }

    // 2. Obtener token
    const { token } = await getAccessToken();

    // 3. Probar con search público (sin token)
    const pubRes = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?seller_id=${SELLER_ID}&limit=5`
    );
    const pubData = await pubRes.json();

    // 4. Probar con items privados (con token)
    const privRes = await fetch(
      `https://api.mercadolibre.com/users/${SELLER_ID}/items/search?limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const privData = await privRes.json();

    // 5. Probar con myfeeds
    const myRes = await fetch(
      `https://api.mercadolibre.com/users/${SELLER_ID}/items/search?status=active&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const myData = await myRes.json();

    res.status(200).json({
      debug: true,
      env_ok: { CLIENT_ID: !!CLIENT_ID, CLIENT_SECRET: !!CLIENT_SECRET, REFRESH_TOKEN: !!REFRESH_TOKEN },
      token_ok: !!token,
      public_search: { status: pubRes.status, total: pubData.paging?.total, results: pubData.results?.length, error: pubData.error },
      private_items: { status: privRes.status, total: privData.paging?.total, results: privData.results?.length, error: privData.error, message: privData.message },
      active_items: { status: myRes.status, total: myData.paging?.total, results: myData.results?.length, error: myData.error, message: myData.message },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

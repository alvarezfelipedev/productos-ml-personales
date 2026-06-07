# Tienda ML — Deploy en Vercel

## Estructura
```
tienda-ml/
├── api/
│   └── productos.js     ← serverless function (proxy a ML API)
├── public/
│   └── index.html       ← frontend de la tienda
├── vercel.json
└── README.md
```

## Pasos para publicar

### 1. Obtener el Refresh Token de Mercado Libre

Necesitás el `refresh_token` que ML devuelve junto con el access token.
Ejecutá este comando en tu terminal (reemplazando el code si venció):

```bash
curl -X POST https://api.mercadolibre.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=4996491493111836" \
  -d "client_secret=bodsVZbHhYH4Q1Rm437YueW8iDrsMaZt" \
  -d "code=TG-TUCODIGO" \
  -d "redirect_uri=https://localhost"
```

Copiá el valor de `refresh_token` de la respuesta.

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "tienda ml"
git remote add origin https://github.com/TUUSUARIO/tienda-ml.git
git push -u origin main
```

### 3. Deploy en Vercel

1. Entrá a [vercel.com](https://vercel.com) → New Project → importá tu repo
2. En **Environment Variables** agregá estas tres:

| Variable | Valor |
|---|---|
| `ML_CLIENT_ID` | `4996491493111836` |
| `ML_CLIENT_SECRET` | `bodsVZbHhYH4Q1Rm437YueW8iDrsMaZt` |
| `ML_REFRESH_TOKEN` | el refresh_token que obtuviste en el paso 1 |

3. Click en **Deploy** — listo ✓

## Notas
- El access token se renueva automáticamente en cada request usando el refresh_token.
- El refresh_token de ML dura 6 meses; si vence, repetí el paso 1.

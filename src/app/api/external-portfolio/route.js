// Server-side proxy for the CAMS account-aggregator redirect call.
//
// The bearer token lives in .env.local and is read here only — it is never
// shipped to the browser. The route returns just what the UI needs: the CAMS
// redirection URL and its handles.

const BASE_URL = process.env.CAMS_AGGREGATOR_URL;
const TOKEN = process.env.CAMS_API_TOKEN;
// CAMS validates the calling origin, so the call is made as the front-end the
// token was issued for.
const ORIGIN =
  process.env.CAMS_ALLOWED_ORIGIN || 'https://user-frontend-dev.allvestfinance.in';

export async function GET() {
  if (!BASE_URL || !TOKEN) {
    return Response.json(
      { success: false, error: 'CAMS_AGGREGATOR_URL / CAMS_API_TOKEN are not set in .env.local.' },
      { status: 500 }
    );
  }

  try {
    const upstream = await fetch(`${BASE_URL}/api/v2/redirect/redirectAA`, {
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en',
        authorization: `Bearer ${TOKEN}`,
        origin: ORIGIN,
        referer: `${ORIGIN}/`,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    if (!upstream.ok) {
      return Response.json(
        {
          success: false,
          error:
            payload?.msg || payload?.message || `CAMS responded with ${upstream.status}.`,
          status: upstream.status,
        },
        { status: 502 }
      );
    }

    // CAMS wraps the useful bits in `data`; keep the envelope flags too.
    const data = payload?.data ?? payload;

    return Response.json({
      success: true,
      hasRedirectionUrl: payload?.hasRedirectionUrl ?? Boolean(data?.redirectionurl),
      redirectionUrl: data?.redirectionurl ?? null,
      consentHandle: data?.consentHandle ?? null,
      clientTxnId: data?.clienttxnid ?? null,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error?.message || 'Could not reach the CAMS aggregator.' },
      { status: 502 }
    );
  }
}

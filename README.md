<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ID-Link Studio

Generate CR80 ID-card PDFs directly or deliver a card as a password-protected browser link.

## Pages

- `/` — product landing page
- `/docs` — interactive API documentation and card playground
- `/contact` — public project contact details
- `/card?data=...` — password unlock, preview, and client-side PDF download

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `PUBLIC_APP_URL` to the public origin used in generated links.
3. Run the app:
   `npm run dev`

## Encrypted workflow links

The browser-only `/card?data=...` flow asks for its separately generated password, decrypts and renders the ID card locally, then downloads its two-sided PDF without calling the PDF API. See [the Flowable encrypted-link guide](docs/FLOWABLE_ENCRYPTED_CARD_LINK.md) for the paste-ready script task.

Generate credentials over HTTP with `POST /api/id-card/encrypted-link`. The interactive `/docs` page includes complete cURL, JavaScript, and Flowable examples.

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);

const getSiteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const renderEmail = (content: string, preheader: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;background:#f5f5f2;color:#1d1e1b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f2;background-image:linear-gradient(rgba(94,116,98,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(94,116,98,.09) 1px,transparent 1px);background-size:24px 24px;padding:48px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background-color:#fffefa;background-image:linear-gradient(rgba(94,116,98,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(94,116,98,.07) 1px,transparent 1px);background-size:24px 24px;border:1px solid #e6e5df;border-radius:16px;">
          <tr><td style="padding:34px 46px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="color:#6e826f;font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:1px;">Ibi no Noto</td>
                <td align="right" style="color:#a3a69d;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">&#10022; &nbsp; 2026</td>
              </tr>
            </table>
            <div style="height:1px;background:#e6e5df;margin-top:26px;font-size:0;">&nbsp;</div>
          </td></tr>
          <tr><td style="padding:0 46px;"><div style="height:86px;margin:0 -46px 48px;overflow:hidden;background:rgba(217,229,216,.42);background-image:linear-gradient(rgba(94,116,98,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(94,116,98,.11) 1px,transparent 1px);background-size:24px 24px;">
            <svg width="100%" height="86" viewBox="0 0 620 86" preserveAspectRatio="none" aria-hidden="true" style="display:block;">
              <path d="M0 55 C90 12 150 82 245 42 S420 15 620 55" fill="none" stroke="#6e826f" stroke-opacity=".34" stroke-width="3"/>
              <path d="M0 70 C100 33 165 94 270 55 S450 28 620 66" fill="none" stroke="#6e826f" stroke-opacity=".2" stroke-width="1.5"/>
              <path d="M0 39 C80 2 165 63 250 29 S445 4 620 42" fill="none" stroke="#6e826f" stroke-opacity=".16" stroke-width="1"/>
            </svg>
          </div></td></tr>
          <tr><td style="padding:0 46px 58px;">${content}</td></tr>
          <tr><td style="padding:22px 46px 30px;border-top:1px solid #eeece6;color:#9a9c94;font-size:12px;line-height:1.6;">
            A small journal from a passerby.<br>
            <span style="color:#6e826f;">Sent with care from Ibi.</span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const button = (url: string, label: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:34px 0 0;">
    <tr><td align="center" bgcolor="#1d1e1b" style="border-radius:999px;background:#1d1e1b;">
      <a href="${escapeHtml(url)}" target="_blank" style="display:block;padding:15px 25px;color:#fffefa;font-size:13px;font-weight:600;line-height:16px;letter-spacing:.1px;text-decoration:none;">${escapeHtml(label)} &nbsp; <span style="font-size:16px;line-height:16px;">&#8594;</span></a>
    </td></tr>
  </table>`;

const publicationGif = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:34px 0 0;">
    <tr><td align="center" style="background:#e8eee6;border:1px solid #d9e2d8;border-radius:14px;padding:12px;">
      <a href="https://tenor.com/view/picmix-gto-gm-onizuka-famasito-gm-famasito-gif-8362333373928394365" style="display:block;text-decoration:none;">
        <img src="https://media1.tenor.com/m/dAz55eZlTn0AAAAC/picmix-gto.gif" width="100%" alt="Picmix GTO animated GIF on Tenor" style="display:block;width:100%;max-width:498px;height:auto;border-radius:8px;border:0;">
      </a>
      <p style="margin:9px 0 0;color:#6e826f;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Open on Tenor</p>
    </td></tr>
  </table>`;

export const welcomeEmail = () => {
  const url = getSiteUrl();
  return {
    html: renderEmail(`
      <p style="margin:0 0 18px;color:#6e826f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">A quiet invitation</p>
      <h1 style="margin:0;color:#1d1e1b;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;letter-spacing:-.8px;line-height:1.1;">Welcome to the notes.</h1>
      <p style="margin:22px 0 0;color:#676a63;font-size:16px;line-height:1.75;">Thank you for joining Ibi no Noto. Every so often, I will send a quiet note about life, learning, and the things worth noticing.</p>
      ${button(url, "Visit Ibi no Noto")}
    `, "Welcome to Ibi no Noto — thank you for subscribing."),
    text: `Welcome to Ibi no Noto.\n\nThank you for subscribing. Every so often, I will send a quiet note about life, learning, and the things worth noticing.\n\nVisit Ibi no Noto: ${url}`,
  };
};

export const publishedNoteEmail = (post: { title: string; excerpt: string; slug: string }) => {
  const url = `${getSiteUrl()}/posts/${encodeURIComponent(post.slug)}`;
  const title = escapeHtml(post.title);
  const excerpt = escapeHtml(post.excerpt);
  return {
    html: renderEmail(`
      <p style="margin:0 0 18px;color:#6e826f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">A new journal entry</p>
      <h1 style="margin:0;color:#1d1e1b;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;letter-spacing:-.8px;line-height:1.1;">${title}</h1>
      <p style="margin:22px 0 0;color:#676a63;font-size:16px;line-height:1.75;">${excerpt}</p>
      ${publicationGif}
      ${button(url, "Read the full note")}
    `, `A new note from Ibi: ${post.title}`),
    text: `${post.title}\n\n${post.excerpt}\n\nRead the full note: ${url}`,
  };
};

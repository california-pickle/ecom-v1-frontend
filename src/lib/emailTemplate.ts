const LOGO_URL =
  "https://res.cloudinary.com/dngag0zog/image/upload/pickle-logo_mp20aq.png";

export function buildBrandedEmail(
  recipientName: string,
  bodyText: string,
): string {
  const year = new Date().getFullYear();
  const name = recipientName?.trim() || "there";
  const bodyHtml = bodyText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body{margin:0;padding:0;}
  table{border-collapse:collapse;}
  @media only screen and (max-width:600px){
    .container{width:100%!important;}
    .padding{padding:30px 24px!important;}
  }
</style>
</head>
<body style="background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;">A message from The California Pickle.</div>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 20px;">
<tr><td align="center">

<table width="550" class="container" cellpadding="0" cellspacing="0" role="presentation"
  style="width:550px;max-width:550px;background-color:#ffffff;border:3px solid #000000;border-radius:10px;overflow:hidden;">

<!-- HEADER -->
<tr>
<td align="center" style="background-color:#8CE000;padding:32px 20px;border-bottom:3px solid #000000;">
  <img src="${LOGO_URL}" width="155" alt="The California Pickle"
    style="display:block;max-width:100%;height:auto;"/>
</td>
</tr>

<!-- BODY -->
<tr>
<td class="padding" style="padding:42px 40px;">

  <p style="margin:0 0 24px;font-size:22px;font-weight:900;font-family:'Arial Black',Impact,sans-serif;color:#111827;">
    Hi ${name},
  </p>

  <div style="font-size:15px;line-height:1.75;color:#4b5563;">
    ${bodyHtml}
  </div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="background-color:#000000;padding:26px 20px;">
  <p style="margin:0;font-size:11px;color:#ffffff;font-family:'Arial Black',Impact,sans-serif;text-transform:uppercase;letter-spacing:1.5px;">
    &copy; ${year} The California Pickle.<br/>All Rights Reserved.
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

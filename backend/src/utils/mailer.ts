import nodemailer from "nodemailer";

const parsedPort = Number((process.env.SMTP_PORT ?? "").trim());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 1025,
  secure: false,
});

export async function sendPasswordResetEmail(to: string, link: string) {
  const from = process.env.MAIL_FROM ?? "no-reply@hmz.local";
  await transporter.sendMail({
    from,
    to,
    subject: "Redefinição de senha",
    text: `Recebemos um pedido para redefinir sua senha. Acesse o link: ${link}`,
    html: `<!doctype html>
<html lang="pt">
  <body style="font-family: Arial, sans-serif; color: #111;">
    <h1 style="font-size: 18px;">Redefinição de senha</h1>
    <p>Recebemos um pedido para redefinir sua senha.</p>
    <p><a href="${link}">Redefinir minha senha</a></p>
    <p style="color: #666; font-size: 12px;">Se você não solicitou, ignore este e-mail.</p>
  </body>
</html>`,
  });
}

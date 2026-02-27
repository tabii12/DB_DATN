const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "Pick Your Way <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📩 RESEND RESPONSE:", response);
  } catch (error) {
    console.error("Resend Error:", error);
    throw error;
  }
};

module.exports = sendEmail;

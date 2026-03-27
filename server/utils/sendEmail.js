const { Resend } = require("resend");

// Instantiate the Resend transactional email client using secure environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a beautifully formatted confirmation email to users upon successful court booking.
 */
const sendConfirmationEmail = async (userEmail, userName, courtName, address, dateTime, price = 0, reference) => {
    try {
        // Standardise date and time formatting for the UK locale
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = gameDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // Dynamically compute display values for the email template
        const displayPrice = parseFloat(price) > 0 ? `£${parseFloat(price).toFixed(2)}` : "FREE";
        const displayReference = reference ? reference : "Free Game (No Reference Required)";
        const displayAddress = address ? address : "Address not provided";

        // Dispatch the payload to the Resend API
        const data = await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "🎟️ CourtLink: Booking Confirmed!",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        
                        <div style="background-color: #ff5722; padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">You're on the Roster! 🏀</h1>
                        </div>

                        <div style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">
                                Hey <strong>${userName}</strong>,<br><br>
                                Your spot has been officially secured. Get ready to lace up and hit the court. Here are your game details:
                            </p>

                            <div style="background-color: #f8fafc; border-left: 4px solid #ff5722; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">📍 ${courtName}</h3>
                                <p style="margin: 5px 0; color: #475569; font-size: 15px;"><strong>Address:</strong> ${displayAddress}</p>
                                <p style="margin: 5px 0; color: #475569; font-size: 15px;"><strong>Date:</strong> ${formattedDate}</p>
                                <p style="margin: 5px 0; color: #475569; font-size: 15px;"><strong>Tip-off:</strong> ${formattedTime}</p>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 15px;">
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Tickets:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">1</td>
                                </tr>
                                
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Order Ref:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500; font-family: monospace; font-size: 12px; color: #94a3b8;">${displayReference}</td>
                                </tr>

                                <tr style="background-color: #f8fafc;">
                                    <td style="padding: 15px 10px; color: #0f172a; font-weight: bold; font-size: 16px;">Total Paid:</td>
                                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #0f172a;">${displayPrice}</td>
                                </tr>
                            </table>

                        </div>
                    </div>
                </div>
            `
        });
        
        console.log("Confirmation email dispatched successfully. ID:", data.id);
        return data;
    } catch (error) {
        console.error("Failed to dispatch confirmation email:", error);
    }
};

module.exports = sendConfirmationEmail;
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendConfirmationEmail = async (userEmail, userName, courtName, dateTime, price = 0) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = gameDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        const displayPrice = parseFloat(price) > 0 ? `£${parseFloat(price).toFixed(2)}` : "FREE";

        const data = await resend.emails.send({
            // 🚀 Using your official domain now! 
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "🎟️ CourtLink: Booking Confirmed!",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        
                        <div style="background-color: #ff5722; color: #ffffff; padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">CourtLink Game</p>
                        </div>

                        <div style="padding: 30px;">
                            <p style="text-align: center; font-size: 16px; margin-bottom: 10px; color: #333;">Hi ${userName},</p>
                            <p style="text-align: center; font-size: 15px; margin-bottom: 30px; color: #555;">
                                Thank you for registering! Your booking has been confirmed. Your ticket details are below.
                            </p>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px; color: #333;">
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Event:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">Pickup Basketball</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Date:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">${formattedDate}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Time:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">${formattedTime}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Location:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">${courtName}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 15px 5px; color: #64748b; font-weight: bold;">Tickets:</td>
                                    <td style="padding: 15px 5px; text-align: right; font-weight: 500;">1</td>
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
        console.log("Email sent successfully:", data.id);
        return data;
    } catch (error) {
        console.error("Resend Email Error:", error);
    }
};

module.exports = sendConfirmationEmail;
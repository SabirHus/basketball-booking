const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. CONFIRMATION EMAIL
const sendConfirmationEmail = async (userEmail, userName, courtName, address, dateTime, price = 0, reference) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = gameDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const displayPrice = parseFloat(price) > 0 ? `£${parseFloat(price).toFixed(2)}` : "FREE";
        const displayReference = reference ? reference : "Free Game";
        const displayAddress = address ? address : "Address not provided";

        await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "🎟️ CourtLink: Booking Confirmed!",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #ff5722; padding: 20px; text-align: center; color: white;">
                            <h2>You're on the Roster! 🏀</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hey <strong>${userName}</strong>,</p>
                            <p>Your spot has been secured. Here are your game details:</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #ff5722; margin: 20px 0;">
                                <h3>📍 ${courtName}</h3>
                                <p><strong>Address:</strong> ${displayAddress}</p>
                                <p><strong>Date:</strong> ${formattedDate} at ${formattedTime}</p>
                            </div>
                            <p><strong>Total Paid:</strong> ${displayPrice} (Ref: ${displayReference})</p>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) { console.error("Confirmation email failed:", error); }
};

// 2. CANCELLATION EMAIL (Game Deleted)
const sendCancellationEmail = async (userEmail, userName, courtName, dateTime, wasPaid) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "🛑 CourtLink: Game Cancelled",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #d63031; padding: 20px; text-align: center; color: white;">
                            <h2>Game Cancelled</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hey <strong>${userName}</strong>,</p>
                            <p>Unfortunately, the host has cancelled the upcoming game at <strong>${courtName}</strong> on <strong>${formattedDate}</strong>.</p>
                            ${wasPaid ? `<p style="color: #d63031; font-weight: bold;">Since this was a paid game, a full refund has been automatically initiated to your original payment method. It may take 5-10 business days to appear on your statement.</p>` : `<p>Since this was a free game, no further action is required.</p>`}
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) { console.error("Cancellation email failed:", error); }
};

// 3. KICKED EMAIL
const sendKickedEmail = async (userEmail, userName, courtName, dateTime, wasPaid) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "⚠️ CourtLink: Roster Update",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #fdcb6e; padding: 20px; text-align: center; color: #2d3436;">
                            <h2>Roster Update</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hey <strong>${userName}</strong>,</p>
                            <p>You have been removed from the roster for the game at <strong>${courtName}</strong> on <strong>${formattedDate}</strong> by the host.</p>
                            ${wasPaid ? `<p style="color: #d63031; font-weight: bold;">A full refund has been automatically initiated to your original payment method.</p>` : ``}
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) { console.error("Kicked email failed:", error); }
};

module.exports = { sendConfirmationEmail, sendCancellationEmail, sendKickedEmail };
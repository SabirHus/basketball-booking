const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. CONFIRMATION EMAIL
const sendConfirmationEmail = async (userEmail, userName, courtName, address, dateTime, price = 0, reference, currentPlayers, minPlayers, maxPlayers) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = gameDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const displayPrice = parseFloat(price) > 0 ? `£${parseFloat(price).toFixed(2)}` : "FREE";
        const displayAddress = address ? address : "Address not provided";
        const displayReference = reference ? reference : "Free Game";

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
                                <p><strong>Roster Status:</strong> ${currentPlayers} / ${maxPlayers} Players Joined <br>
                                <small style="color: #666;">(Game needs a minimum of ${minPlayers} to go ahead)</small></p>
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

// 4. UPDATE EMAIL (Game Edited)
const sendUpdateEmail = async (userEmail, userName, courtName, newDateTime, newAddress, newMinPlayers, newMaxPlayers, newPrice, newSkillLevel) => {
    try {
        const gameDate = new Date(newDateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = gameDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const displayAddress = newAddress ? newAddress : "Address not provided";
        const displayPrice = parseFloat(newPrice) > 0 ? `£${parseFloat(newPrice).toFixed(2)}` : "FREE";

        await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "🔄 CourtLink: Game Details Updated",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #0984e3; padding: 20px; text-align: center; color: white;">
                            <h2>Game Details Updated 🔄</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hey <strong>${userName}</strong>,</p>
                            <p>The host has updated the details for an upcoming game you are joined to. Here is the latest information:</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0984e3; margin: 20px 0;">
                                <h3>📍 ${courtName}</h3>
                                <p><strong>Address:</strong> ${displayAddress}</p>
                                <p><strong>Date/Time:</strong> ${formattedDate} at ${formattedTime}</p>
                                <p><strong>Price:</strong> ${displayPrice}</p>
                                <p><strong>Skill Level:</strong> ${newSkillLevel}</p>
                                <p><strong>Capacity Requirements:</strong> Min ${newMinPlayers} / Max ${newMaxPlayers} players</p>
                            </div>
                            <p>If these new details no longer work for you, you can leave the roster from your Profile page.</p>
                            <p>See you on the court!</p>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) { console.error("Update email failed:", error); }
};

// 5. GAME IS ON EMAIL (Target Hit)
const sendGameOnEmail = async (userEmail, userName, courtName, dateTime) => {
    try {
        const gameDate = new Date(dateTime);
        const formattedDate = gameDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        await resend.emails.send({
            from: process.env.MAIL_FROM, 
            to: userEmail,
            subject: "✅ CourtLink: Game is ON!",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #27ae60; padding: 20px; text-align: center; color: white;">
                            <h2>Game is Officially ON! ✅</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hey <strong>${userName}</strong>,</p>
                            <p>Great news! The upcoming game at <strong>${courtName}</strong> on <strong>${formattedDate}</strong> has just hit its minimum player requirement.</p>
                            <p>The game is officially going ahead. See you on the court!</p>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) { console.error("Game ON email failed:", error); }
};

module.exports = { sendConfirmationEmail, sendCancellationEmail, sendKickedEmail, sendUpdateEmail, sendGameOnEmail };
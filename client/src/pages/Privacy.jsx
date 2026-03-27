const Privacy = () => {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6", color: "var(--text-main)" }}>
            <h1 style={{ color: "var(--primary)" }}>Privacy Policy</h1>
            <p>Your privacy is important to us. This policy outlines how we handle your data.</p>
            <h3>1. Data Collection</h3>
            <p>We collect essential data required to facilitate game bookings, including your email address, username, and encrypted payment tokens (handled entirely by Stripe).</p>
            <h3>2. Data Usage</h3>
            <p>Your data is used strictly for platform operations: sending booking confirmations, processing refunds, and displaying your profile picture to your teammates. We do not sell your personal data to third parties.</p>
            <h3>3. Cookies</h3>
            <p>We use local storage (JWT tokens) to keep you securely logged into your account.</p>
        </div>
    );
};
export default Privacy;
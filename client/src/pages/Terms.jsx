const Terms = () => {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6", color: "var(--text-main)" }}>
            <h1 style={{ color: "var(--primary)" }}>Terms and Conditions</h1>
            <p>Welcome to CourtLink. By using our platform, you agree to the following terms:</p>
            <h3>1. Booking and Payments</h3>
            <p>All payments are processed securely via Stripe. By booking a paid game, you agree to the listed price. If a host cancels a game, you will automatically receive a full refund.</p>
            <h3>2. Code of Conduct</h3>
            <p>CourtLink promotes a safe and inclusive environment. Harassment, violence, or unsportsmanlike conduct will result in account suspension. Hosts reserve the right to remove players from their games.</p>
            <h3>3. Liability</h3>
            <p>Basketball is a physical sport. By participating in games booked through CourtLink, you assume all risks associated with physical injury. CourtLink is not liable for any injuries sustained during events.</p>
            <p><em>Last Updated: March 2026</em></p>
        </div>
    );
};
export default Terms;
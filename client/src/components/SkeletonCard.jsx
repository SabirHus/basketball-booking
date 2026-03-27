const SkeletonCard = () => {
  // Placeholder card with a CSS animation while game data is being fetched
  return (
    <div className="card skeleton-pulse">
      
      {/* Top section: Placeholders for the back button, game title and price badge */}
      <div className="skel-bg skel-btn"></div>
      <div className="skel-bg skel-title"></div>
      <div className="skel-bg skel-price"></div>
      
      {/* Middle section: Placeholders for the text rows like address, skill level and date */}
      <div className="skel-row">
        <div className="skel-bg skel-text" style={{ width: "50%" }}></div>
        <div className="skel-bg skel-text" style={{ width: "30%" }}></div>
        <div className="skel-bg skel-text" style={{ width: "80%" }}></div>
      </div>
      
      {/* Bottom section: Placeholders for the host information box and the main call-to-action button */}
      <div className="skel-bg skel-box"></div>
      <div className="skel-bg skel-button"></div>
      
    </div>
  );
};

export default SkeletonCard;
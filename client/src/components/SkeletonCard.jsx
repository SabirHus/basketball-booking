const SkeletonCard = () => {
  return (
    <div className="card skeleton-pulse">
      <div className="skel-bg skel-btn"></div>
      <div className="skel-bg skel-title"></div>
      <div className="skel-bg skel-price"></div>
      
      <div className="skel-row">
        <div className="skel-bg skel-text" style={{width: "50%"}}></div>
        <div className="skel-bg skel-text" style={{width: "30%"}}></div>
        <div className="skel-bg skel-text" style={{width: "80%"}}></div>
      </div>
      
      <div className="skel-bg skel-box"></div>
      <div className="skel-bg skel-button"></div>
    </div>
  );
};

export default SkeletonCard;
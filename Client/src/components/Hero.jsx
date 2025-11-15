import './Hero.css';
import HERO_CONFIG from '../config/heroConfig';

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{HERO_CONFIG.title}</h1>
          <p className="hero-subtitle">
            {HERO_CONFIG.subtitle}
          </p>
        </div>

        <div className="hero-video">
          <video
            className="hero-video-element"
            autoPlay={HERO_CONFIG.videoAttributes.autoPlay}
            muted={HERO_CONFIG.videoAttributes.muted}
            loop={HERO_CONFIG.videoAttributes.loop}
            playsInline={HERO_CONFIG.videoAttributes.playsInline}
          >
            <source src={HERO_CONFIG.videoUrl} type={HERO_CONFIG.videoType} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Hero;

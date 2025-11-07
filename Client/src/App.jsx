import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ImageUpload from './components/ImageUpload';
import VideoTypeSelector from './components/VideoTypeSelector';
import CustomizationPanel from './components/CustomizationPanel';
import GenerateButton from './components/GenerateButton';

function App() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedVideoType, setSelectedVideoType] = useState(null);
  const [customization, setCustomization] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!uploadedImages.length) {
      alert('Please upload at least one image');
      return;
    }

    if (!selectedVideoType) {
      alert('Please select a video generation type');
      return;
    }

    setIsGenerating(true);

    // Simulate video generation
    console.log('Generating video with:', {
      images: uploadedImages,
      videoType: selectedVideoType,
      customization: customization
    });

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      alert('Video generation completed! (This is a demo)');
    }, 3000);
  };

  const isGenerateDisabled = !uploadedImages.length || !selectedVideoType;

  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <div className="container">
          <div className="hero-section">
            <h1 className="hero-title">Transform Images into Stunning Videos</h1>
            <p className="hero-subtitle">
              Upload your images, choose your style, and let AI create professional videos
            </p>
          </div>

          <ImageUpload onImagesChange={setUploadedImages} />

          <VideoTypeSelector onTypeSelect={setSelectedVideoType} />

          <CustomizationPanel onCustomizationChange={setCustomization} />

          <GenerateButton
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerateDisabled}
          />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">VideoGen - AI-Powered Video Generation</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

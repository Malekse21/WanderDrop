import { useState } from 'react';
import html2canvas from 'html2canvas';

export function useShareProfile() {
  const [sharing, setSharing] = useState(false);

  const getOrGenerateToken = () => {
    let token = localStorage.getItem('wanderdrop_share_token');
    if (!token) {
      // Mock generating a unique random 8 char hex string
      token = Math.random().toString(16).substring(2, 10);
      localStorage.setItem('wanderdrop_share_token', token);
    }
    return token;
  };

  const shareProfile = async (elementId: string) => {
    setSharing(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error("Share card element not found");
      
      // Ensure local token exists
      const token = getOrGenerateToken();
      const shareUrl = `${window.location.origin}/profile/${token}`;

      // Convert the hidden DOM node into a canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#1C1612', // ink
        scale: 2, // Retina resolution
        useCORS: true,
        logging: false,
      });

      // Convert canvas to a blob
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to generate image blob");

      const file = new File([blob], 'wanderdrop_profile.png', { type: 'image/png' });

      // If mobile supports Web Share API with files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My WanderDrop Travel Profile',
          text: `Check out my travel DNA on WanderDrop! ${shareUrl}`,
          files: [file],
        });
      } else {
        // Fallback: Download the PNG directly on Desktop/unsupported browsers
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'wanderdrop_profile.png';
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error("Failed to share profile", err);
      alert("Failed to create share card. Try again.");
    } finally {
      setSharing(false);
    }
  };

  return { sharing, shareProfile, getOrGenerateToken };
}

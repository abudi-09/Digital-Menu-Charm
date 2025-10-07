import React from "react";
import { useNavigate } from "react-router-dom";
import QRScanner from "@/components/QRScanner";
import { Footer } from "@/components/Footer";

const Scan = () => {
  const navigate = useNavigate();

  const handleDetected = (value: string) => {
    // If value looks like a slug (no scheme), navigate to backend redirect route
    try {
      const url = new URL(value);
      // absolute URL -> go directly
      window.location.href = value;
    } catch (err) {
      // not an absolute URL -> treat as slug
      navigate(`/qr/${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-6">Scan QR</h1>
        <div className="max-w-xl mx-auto">
          <QRScanner onDetected={handleDetected} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Scan;

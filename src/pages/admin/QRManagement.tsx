import { useState } from 'react';
import { Download, QrCode as QrIcon, TrendingUp, Users, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/StatsCard';
import { useToast } from '@/hooks/use-toast';

const QRManagement = () => {
  const { toast } = useToast();
  const [qrGenerated, setQrGenerated] = useState(true);

  // Mock QR code URL (would be generated from actual menu URL)
  const menuUrl = `${window.location.origin}/`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;

  const stats = {
    totalScans: 1247,
    scansToday: 34,
    scansThisWeek: 187,
    uniqueVisitors: 892,
    lastScanTime: '2 minutes ago',
  };

  const handleDownloadQR = () => {
    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'grand-vista-menu-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'QR Code Downloaded',
      description: 'Your QR code has been saved successfully',
    });
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Grand Vista Hotel - Menu QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: sans-serif;
              }
              .print-container {
                text-align: center;
                padding: 40px;
              }
              h1 {
                margin-bottom: 10px;
                font-size: 32px;
              }
              p {
                margin-bottom: 30px;
                color: #666;
                font-size: 18px;
              }
              img {
                max-width: 400px;
                height: auto;
                border: 2px solid #000;
                border-radius: 8px;
              }
              .instructions {
                margin-top: 30px;
                font-size: 16px;
                color: #666;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>Grand Vista Hotel</h1>
              <p>Scan to view our digital menu</p>
              <img src="${qrCodeUrl}" alt="Menu QR Code" />
              <div class="instructions">
                <p>Scan this QR code with your smartphone camera to access our menu</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: 'Print Dialog Opened',
      description: 'Print or save as PDF from the print dialog',
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">QR Code Management</h1>
        <p className="text-muted-foreground">Generate and manage your digital menu QR code</p>
      </div>

      {/* Analytics Stats */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Scans"
            value={stats.totalScans}
            icon={QrIcon}
            trend={{ value: '+12% this month', positive: true }}
          />
          <StatsCard
            title="Scans Today"
            value={stats.scansToday}
            icon={TrendingUp}
            description="Last 24 hours"
          />
          <StatsCard
            title="This Week"
            value={stats.scansThisWeek}
            icon={Calendar}
            description="Last 7 days"
          />
          <StatsCard
            title="Unique Visitors"
            value={stats.uniqueVisitors}
            icon={Users}
            description="All time"
          />
        </div>
      </div>

      {/* QR Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Card */}
        <Card className="p-8 bg-gradient-card border-border space-y-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold font-serif text-foreground">Your Menu QR Code</h3>
            <p className="text-sm text-muted-foreground">
              Customers can scan this code to access your digital menu
            </p>
          </div>

          {qrGenerated ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-background rounded-lg border-2 border-border shadow-soft">
                  <img
                    src={qrCodeUrl}
                    alt="Menu QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleDownloadQR}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download QR Code
                </Button>
                <Button
                  onClick={handlePrintQR}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <QrIcon className="w-5 h-5" />
                  Print QR Code
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground break-all">
                  <strong>Menu URL:</strong><br />
                  {menuUrl}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No QR code generated yet</p>
              <Button
                onClick={() => setQrGenerated(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Generate QR Code
              </Button>
            </div>
          )}
        </Card>

        {/* Instructions & Tips */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border">
            <h3 className="text-xl font-semibold font-serif text-foreground mb-4">How to Use</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Download or print the QR code using the buttons provided</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Display the QR code at your reception, tables, or entrance</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Customers can scan it with their smartphone camera to view the menu</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Track scans and visitor analytics in real-time</span>
              </li>
            </ol>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Last Scan</h4>
                <p className="text-sm text-muted-foreground">{stats.lastScanTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Place QR codes in well-lit, easily accessible locations</li>
              <li>• Print in high quality (at least 300 DPI) for best results</li>
              <li>• Test the QR code regularly to ensure it works</li>
              <li>• Consider laminating printed codes for durability</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRManagement;

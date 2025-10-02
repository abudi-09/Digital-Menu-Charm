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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in">
      {/* Header with Title and Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
            QR Code Management
          </h1>
          <p className="text-muted-foreground">Generate and manage your digital menu QR code</p>
        </div>
        <Button
          onClick={() => setQrGenerated(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto"
          aria-label="Generate QR code for hotel menu"
        >
          <QrIcon className="w-5 h-5" />
          {qrGenerated ? 'Regenerate QR Code' : 'Generate QR Code'}
        </Button>
      </div>

      {/* QR Preview Panel and Analytics Section */}
      {qrGenerated && (
        <>
          {/* QR Preview Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QR Code Preview - Takes 2 columns on desktop */}
            <Card className="lg:col-span-2 p-6 md:p-8 bg-card border-border">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold font-serif text-foreground mb-2">
                    Your Menu QR Code
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customers can scan this code to access your digital menu
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* QR Image */}
                  <div className="flex-shrink-0">
                    <div className="p-4 bg-background rounded-lg border-2 border-border shadow-sm">
                      <img
                        src={qrCodeUrl}
                        alt="QR code preview"
                        className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64"
                      />
                    </div>
                  </div>

                  {/* QR Info and Actions */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground break-all">
                        <strong className="text-foreground">Menu URL:</strong>
                        <br />
                        {menuUrl}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleDownloadQR}
                        variant="outline"
                        className="w-full sm:flex-1 gap-2"
                        aria-label="Download QR code image"
                      >
                        <Download className="w-5 h-5" />
                        Download QR
                      </Button>
                      <Button
                        onClick={handlePrintQR}
                        variant="outline"
                        className="w-full sm:flex-1 gap-2"
                        aria-label="Print QR code"
                      >
                        <QrIcon className="w-5 h-5" />
                        Print QR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructions Card - 1 column on desktop */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold font-serif text-foreground mb-4">How to Use</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Download or print the QR code</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Display at reception, tables, or entrance</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Customers scan with smartphone camera</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Track scans in analytics below</span>
                </li>
              </ol>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">Last Scan</h4>
                    <p className="text-sm text-muted-foreground">{stats.lastScanTime}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Analytics Summary Cards */}
          <div>
            <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Pro Tips Card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Place QR codes in well-lit, easily accessible locations</li>
              <li>• Print in high quality (at least 300 DPI) for best results</li>
              <li>• Test the QR code regularly to ensure it works correctly</li>
              <li>• Consider laminating printed codes for durability</li>
            </ul>
          </Card>
        </>
      )}

      {/* Empty State when no QR generated */}
      {!qrGenerated && (
        <Card className="p-12 md:p-16 text-center bg-card border-border">
          <QrIcon className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No QR Code Generated</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click the "Generate QR Code" button above to create a QR code for your digital menu.
          </p>
        </Card>
      )}
    </div>
  );
};

export default QRManagement;

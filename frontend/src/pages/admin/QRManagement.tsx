import { useEffect, useMemo, useState } from "react";
import {
  Download,
  QrCode as QrIcon,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Loader2,
  RefreshCcw,
  FileText,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { QRCodeRecord, QRFormat, QRStats } from "@/types/admin";
import {
  createQRCode,
  fetchQRCodes,
  fetchQRStats,
  fetchQRCodeById,
  updateQRCode,
} from "@/lib/qrApi";
import { useQRStats } from "@/hooks/useQRApi";
import { useTranslation } from "react-i18next";

type TargetType = "menu" | "table" | "custom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, "").replace(/\/+$/, "");

const toAbsoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_ORIGIN}${path}`;

const QRManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [targetType, setTargetType] = useState<TargetType>("menu");
  const [tableId, setTableId] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [format, setFormat] = useState<QRFormat>("png");
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const {
    data: qrCodes,
    isLoading: codesLoading,
    isFetching: codesFetching,
  } = useQuery({
    queryKey: ["qr-codes"],
    queryFn: fetchQRCodes,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useQRStats();

  const currentCode: QRCodeRecord | null = useMemo(() => {
    if (!qrCodes?.length) return null;
    if (selectedCodeId) {
      return qrCodes.find((code) => code.id === selectedCodeId) ?? qrCodes[0];
    }
    return qrCodes[0];
  }, [qrCodes, selectedCodeId]);

  useEffect(() => {
    if (!selectedCodeId && qrCodes?.length) {
      setSelectedCodeId(qrCodes[0].id);
    }
  }, [qrCodes, selectedCodeId]);

  useEffect(() => {
    if (!currentCode) {
      return;
    }

    setFormat(currentCode.format);

    const origin = window.location.origin;
    if (currentCode.url.startsWith(`${origin}/menu/`)) {
      setTargetType("table");
      setTableId(currentCode.url.replace(`${origin}/menu/`, ""));
      setCustomUrl("");
      return;
    }

    if (currentCode.url === `${origin}/menu`) {
      setTargetType("menu");
      setTableId("");
      setCustomUrl("");
      return;
    }

    setTargetType("custom");
    setCustomUrl(currentCode.url);
  }, [currentCode]);

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewChecking, setPreviewChecking] = useState(false);

  // Verify that the signed URL for the current code is reachable.
  const verifyPreview = async (signedUrl?: string) => {
    setPreviewError(null);
    if (!signedUrl) return;
    const fileUrl = toAbsoluteUrl(signedUrl);
    try {
      setPreviewChecking(true);
      const resp = await fetch(fileUrl, {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
      });
      if (!resp.ok) {
        setPreviewError(`Preview failed: ${resp.status} ${resp.statusText}`);
      } else {
        setPreviewError(null);
      }
    } catch (err) {
      setPreviewError(`Preview error: ${(err as Error).message}`);
    } finally {
      setPreviewChecking(false);
    }
  };

  useEffect(() => {
    if (currentCode?.signedUrl) verifyPreview(currentCode.signedUrl);
  }, [currentCode?.signedUrl]);

  const targetUrl = useMemo(() => {
    const origin = window.location.origin;
    if (targetType === "menu") {
      return `${origin}/menu`;
    }
    if (targetType === "table") {
      const id = tableId.trim();
      return id ? `${origin}/menu/${id}` : "";
    }
    return customUrl.trim();
  }, [targetType, tableId, customUrl]);

  const isTargetValid = targetUrl.length > 0;

  const mutation = useMutation<
    QRCodeRecord,
    Error,
    { mode: "create" | "update"; id?: string; url: string; format: QRFormat }
  >({
    mutationFn: async (variables) => {
      if (variables.mode === "create") {
        return createQRCode({ url: variables.url, format: variables.format });
      }
      if (!variables.id) {
        throw new Error("QR code id is required for update");
      }
      return updateQRCode(variables.id, {
        url: variables.url,
        format: variables.format,
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title:
          variables.mode === "create"
            ? t("qrMgmt.toasts.created")
            : t("qrMgmt.toasts.updated"),
        description: t("qrMgmt.toasts.share"),
      });
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["qr-stats"] });
      if (variables.mode === "create") {
        setSelectedCodeId(data.id);
      }
    },
    onError: (error) => {
      const message = error.message || t("qrMgmt.toasts.unable");
      toast({
        title: t("qrMgmt.toasts.failed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (mode: "create" | "update") => {
    if (!isTargetValid) {
      toast({
        title: t("qrMgmt.toasts.missing_url"),
        description: t("qrMgmt.toasts.provide_url"),
        variant: "destructive",
      });
      return;
    }

    if (mode === "update" && !currentCode) {
      toast({
        title: t("qrMgmt.toasts.no_qr_selected"),
        description: t("qrMgmt.toasts.create_first"),
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      mode,
      id: mode === "update" ? currentCode?.id : undefined,
      url: targetUrl,
      format,
    });
  };

  const handleDownload = async () => {
    if (!currentCode) return;
    try {
      const fileUrl = toAbsoluteUrl(currentCode.signedUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download QR file");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      const extension =
        currentCode.format === "png" ? "png" : currentCode.format;
      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      link.download = `grand-vista-qr-${currentCode.slug}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      toast({
        title: t("qrMgmt.toasts.downloaded"),
        description: t("qrMgmt.toasts.download_check"),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("qrMgmt.toasts.download_unable");
      toast({
        title: t("qrMgmt.toasts.download_failed"),
        description: message,
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!currentCode) return;
    const fileUrl = toAbsoluteUrl(currentCode.signedUrl);
    const printWindow = window.open(fileUrl, "_blank");
    if (!printWindow) {
      toast({
        title: t("qrMgmt.toasts.popup_blocked"),
        description: t("qrMgmt.toasts.allow_popups"),
        variant: "destructive",
      });
      return;
    }
    toast({
      title: t("qrMgmt.toasts.print_opened"),
      description: t("qrMgmt.toasts.print_desc"),
    });
  };

  const renderPreview = () => {
    if (!currentCode) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Generate a QR code to preview it here.
          </p>
        </div>
      );
    }

    const fileUrl = toAbsoluteUrl(currentCode.signedUrl);

    if (currentCode.format === "pdf") {
      return (
        <iframe
          src={fileUrl}
          title="QR preview"
          className="h-64 w-full rounded-lg border border-border"
        />
      );
    }

    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-border bg-background p-4">
        {previewError ? (
          <div className="w-full text-center text-sm text-destructive space-y-2">
            <p>{t("qrMgmt.preview_error", "Preview unavailable")}</p>
            <p className="text-xs text-muted-foreground">{previewError}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!currentCode) return;
                  try {
                    setPreviewChecking(true);
                    // fetch a fresh record with a new signedUrl
                    const fresh = await fetchQRCodeById(currentCode.id);
                    await verifyPreview(fresh.signedUrl);
                    // also refresh the list in background
                    queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
                  } catch (e) {
                    // fall back to invalidating list if direct fetch fails
                    queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
                  } finally {
                    setPreviewChecking(false);
                  }
                }}
                disabled={previewChecking}
              >
                {t("qrMgmt.retry_preview", "Retry preview")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => verifyPreview(currentCode.signedUrl)}
                disabled={previewChecking}
              >
                {previewChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("qrMgmt.check_preview", "Check")
                )}
              </Button>
            </div>
          </div>
        ) : (
          <img
            src={fileUrl}
            alt="QR code preview"
            className="h-60 w-60 object-contain"
          />
        )}
      </div>
    );
  };

  const statsData: QRStats | undefined = stats;
  const isBusy = mutation.isPending || codesFetching;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
            {t("qrMgmt.title")}
          </h1>
          <p className="text-muted-foreground">{t("qrMgmt.subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            onClick={() => handleGenerate(currentCode ? "update" : "create")}
            className="gap-2"
            disabled={!isTargetValid || isBusy}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <QrIcon className="h-4 w-4" />
            {currentCode ? t("qrMgmt.update") : t("qrMgmt.create")}
          </Button>
          {currentCode && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => handleGenerate("create")}
              disabled={!isTargetValid || mutation.isPending}
            >
              <RefreshCcw className="h-4 w-4" />
              {t("qrMgmt.create_new")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6 p-6 md:p-8 bg-card border-border">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              {t("qrMgmt.config")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-type">
                  {t("qrMgmt.menu_destination")}
                </Label>
                <Select
                  value={targetType}
                  onValueChange={(value: TargetType) => setTargetType(value)}
                >
                  <SelectTrigger id="target-type">
                    <SelectValue placeholder={t("qrMgmt.select_destination")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menu">
                      {t("qrMgmt.full_menu")}
                    </SelectItem>
                    <SelectItem value="table">
                      {t("qrMgmt.menu_by_table")}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t("qrMgmt.custom_url")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">{t("qrMgmt.file_format")}</Label>
                <Select
                  value={format}
                  onValueChange={(value: QRFormat) => setFormat(value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder={t("qrMgmt.select_format")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">{t("qrMgmt.png")}</SelectItem>
                    <SelectItem value="svg">{t("qrMgmt.svg")}</SelectItem>
                    <SelectItem value="pdf">{t("qrMgmt.pdf")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {targetType === "table" && (
              <div className="space-y-2">
                <Label htmlFor="table-id">{t("qrMgmt.table_identifier")}</Label>
                <Input
                  id="table-id"
                  placeholder="e.g. table-12"
                  value={tableId}
                  onChange={(event) => setTableId(event.target.value)}
                />
              </div>
            )}

            {targetType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-url">
                  {t("qrMgmt.custom_url_label")}
                </Label>
                <Input
                  id="custom-url"
                  placeholder="https://example.com/menu"
                  value={customUrl}
                  onChange={(event) => setCustomUrl(event.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("qrMgmt.final_url")}</Label>
              <Input value={targetUrl} readOnly className="font-mono text-xs" />
            </div>

            {qrCodes?.length ? (
              <div className="space-y-2">
                <Label htmlFor="qr-select">{t("qrMgmt.existing_qr")}</Label>
                <Select
                  value={currentCode?.id ?? ""}
                  onValueChange={(value) => setSelectedCodeId(value || null)}
                >
                  <SelectTrigger id="qr-select">
                    <SelectValue placeholder={t("qrMgmt.select_qr")} />
                  </SelectTrigger>
                  <SelectContent>
                    {qrCodes.map((code) => (
                      <SelectItem key={code.id} value={code.id}>
                        {`${code.slug} • ${new Date(
                          code.createdAt
                        ).toLocaleString()}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                {t("qrMgmt.preview_title", "QR preview")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "qrMgmt.preview_desc",
                  "Signed QR assets expire automatically after ten minutes for secure sharing."
                )}
              </p>
            </div>

            {renderPreview()}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleDownload}
                disabled={!currentCode || mutation.isPending}
              >
                <Download className="h-4 w-4" />
                {t("qrMgmt.download")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handlePrint}
                disabled={!currentCode || mutation.isPending}
              >
                <FileText className="h-4 w-4" />
                {t("qrMgmt.print")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-6 p-6 bg-card border-border">
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-semibold text-foreground">
              {t("qrMgmt.how_to_deploy", "How to deploy")}
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>
                  {t(
                    "qrMgmt.step_generate",
                    "Generate the QR in your preferred format."
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>
                  {t(
                    "qrMgmt.step_download",
                    "Download or print the branded poster template."
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>
                  {t(
                    "qrMgmt.step_display",
                    "Display codes at entrances, tables, elevators, and rooms."
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>
                  {t(
                    "qrMgmt.step_analytics",
                    "Use the analytics dashboard to monitor engagement."
                  )}
                </span>
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {t("qrMgmt.last_scan", "Last scan")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {statsData?.lastScanTime
                    ? new Date(statsData.lastScanTime).toLocaleString()
                    : t("qrMgmt.no_scans", "No scans logged yet")}
                </p>
              </div>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <span className="text-lg">💡</span>
              {t("qrMgmt.activation_tips", "Activation tips")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                {t(
                  "qrMgmt.tip_laminate",
                  "Laminate table-top QR cards to protect them from spills."
                )}
              </li>
              <li>
                {t(
                  "qrMgmt.tip_refresh",
                  "Refresh the QR asset every quarter to rotate campaign tracking."
                )}
              </li>
              <li>
                {t(
                  "qrMgmt.tip_table",
                  "Use the table identifier option to personalise guest journeys."
                )}
              </li>
              <li>
                {t(
                  "qrMgmt.tip_embed",
                  "Embed the signed URL in your concierge emails for contactless access."
                )}
              </li>
            </ul>
          </Card>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-semibold text-foreground">
            {t("qrMgmt.analytics_overview", "Analytics overview")}
          </h2>
          {(statsLoading || statsFetching) && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />{" "}
              {t("qrMgmt.refreshing", "Refreshing")}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t("qrMgmt.stat_qr_codes", "QR Codes")}
            value={statsData?.totalCodes ?? 0}
            icon={QrIcon}
            description={t("qrMgmt.stat_qr_desc", "Active digital touchpoints")}
          />
          <StatsCard
            title={t("qrMgmt.stat_total_scans", "Total Scans")}
            value={statsData?.totalScans ?? 0}
            icon={TrendingUp}
            description={t(
              "qrMgmt.stat_total_scans_desc",
              "Lifetime engagement"
            )}
          />
          <StatsCard
            title={t("qrMgmt.stat_scans_today", "Scans Today")}
            value={statsData?.scansToday ?? 0}
            icon={Clock}
            description={t("qrMgmt.stat_scans_today_desc", "Rolling 24 hours")}
          />
          <StatsCard
            title={t("qrMgmt.stat_unique_qr", "Unique QR codes")}
            value={statsData?.uniqueVisitors ?? 0}
            icon={Users}
            description={t(
              "qrMgmt.stat_unique_qr_desc",
              "Codes scanned at least once"
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title={t("qrMgmt.stat_scans_week", "Scans this week")}
            value={statsData?.scansThisWeek ?? 0}
            icon={Calendar}
            description={t("qrMgmt.stat_scans_week_desc", "Past 7 days")}
          />
        </div>
      </div>
    </div>
  );
};

export default QRManagement;

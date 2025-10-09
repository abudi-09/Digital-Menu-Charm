import { useEffect, useMemo, useState, useCallback } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
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
  useQRCodes,
  useQRStats,
  useCreateQRCode,
  useUpdateQRCode,
  useQRCode,
} from "@/api/useQRApi";
import { useTranslation } from "react-i18next";
import { getToken } from "@/lib/auth";
import { fetchQRCodeById } from "@/lib/qrApi";

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
  } = useQRCodes();

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
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [lastVerifiedId, setLastVerifiedId] = useState<string | null>(null);

  const clearPreviewBlob = useCallback(() => {
    setPreviewBlobUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const setPreviewBlobFromBlob = useCallback((blob: Blob) => {
    const objectUrl = URL.createObjectURL(blob);
    setPreviewBlobUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
  }, []);

  // Verify that the signed URL for the current code is reachable.
  const verifyPreview = useCallback(
    async (
      input?: { signedUrl?: string | null; id?: string | null },
      attempt = 0
    ) => {
      const codeId = input?.id ?? currentCode?.id ?? null;
      let signedUrl = input?.signedUrl ?? currentCode?.signedUrl ?? null;
      setPreviewError(null);

      if (!signedUrl && codeId) {
        try {
          const fresh = await fetchQRCodeById(codeId);
          signedUrl = fresh?.signedUrl ?? null;
        } catch (e) {
          // ignore and let the flow below report the error
        }
      }

      if (!signedUrl) {
        clearPreviewBlob();
        return;
      }

      const fileUrl = toAbsoluteUrl(signedUrl);
      try {
        setPreviewChecking(true);
        const headers: Record<string, string> = {};
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const resp = await fetch(fileUrl, {
          method: "GET",
          credentials: "omit",
          cache: "no-store",
          headers,
          // follow redirects explicitly and use CORS mode
          redirect: "follow",
          mode: "cors",
        });

        // If token expired/invalid or file missing, try to refresh the signedUrl once
        // by re-fetching the QR record. This handles 401/403 (auth) and 404 (missing file)
        if (
          !resp.ok &&
          (resp.status === 401 || resp.status === 403 || resp.status === 404) &&
          codeId &&
          attempt === 0
        ) {
          try {
            const fresh = await fetchQRCodeById(codeId);
            if (fresh?.signedUrl && fresh.signedUrl !== signedUrl) {
              // retry with fresh signed url
              return verifyPreview(
                { signedUrl: fresh.signedUrl, id: fresh.id ?? codeId },
                attempt + 1
              );
            }
          } catch (e) {
            // fall through and report the original error
          }
        }

        if (!resp.ok) {
          if (resp.status === 401) {
            // Unauthorized - notify and redirect to admin login
            toast({
              title: t(
                "qrMgmt.errors.unauthorized",
                "Unauthorized — please log in again"
              ),
              variant: "destructive",
            });
            window.location.href = "/admin/login";
            return;
          }
          setPreviewError(`Preview failed: ${resp.status} ${resp.statusText}`);
          clearPreviewBlob();
        } else {
          setPreviewError(null);
          try {
            const blob = await resp.blob();
            setPreviewBlobFromBlob(blob);
            setLastVerifiedId(codeId);
          } catch (e) {
            clearPreviewBlob();
          }
        }
      } catch (err) {
        // Provide a clearer error and log full details for debugging.
        const name = (err as any)?.name ?? "Error";
        const message = (err as any)?.message ?? String(err);
        console.error("Preview fetch failed", { fileUrl, name, err });
        if (message === "Failed to fetch" || name === "TypeError") {
          setPreviewError(
            `Preview error: Network or CORS error when requesting ${fileUrl}. Click 'Open raw' or check the browser console/network tab.`
          );
          toast({
            title: t("qrMgmt.errors.network", "Network error"),
            description: t(
              "qrMgmt.errors.network_desc",
              "Network or CORS error when fetching the signed asset."
            ),
            variant: "destructive",
          });
        } else {
          setPreviewError(`Preview error: ${name} - ${message}.`);
        }
        clearPreviewBlob();
      } finally {
        setPreviewChecking(false);
      }
    },
    [currentCode, clearPreviewBlob, setPreviewBlobFromBlob, toast, t]
  );

  useEffect(() => {
    return () => {
      clearPreviewBlob();
    };
  }, [clearPreviewBlob]);

  useEffect(() => {
    if (!selectedCodeId || selectedCodeId !== lastVerifiedId) {
      clearPreviewBlob();
      setPreviewError(null);
      setPreviewChecking(false);
    }
  }, [selectedCodeId, lastVerifiedId, clearPreviewBlob]);

  useEffect(() => {
    if (!currentCode?.id) return;
    if (lastVerifiedId === currentCode.id) return;
    if (previewChecking) return;
    verifyPreview({
      signedUrl: currentCode.signedUrl,
      id: currentCode.id,
    });
  }, [
    currentCode?.id,
    currentCode?.signedUrl,
    lastVerifiedId,
    previewChecking,
    verifyPreview,
  ]);

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

  const createMutation = useCreateQRCode();
  const updateMutation = useUpdateQRCode();
  // Use a type-safe check for pending state. Different versions of React Query
  // may expose different boolean flags; check status and fall back to any.
  const mutationIsPending = Boolean(
    (createMutation as any)?.isLoading ||
      createMutation?.status === "loading" ||
      (updateMutation as any)?.isLoading ||
      updateMutation?.status === "loading"
  );

  const handleGenerate = async (mode: "create" | "update") => {
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

    if (mode === "create") {
      try {
        const created = await createMutation.mutateAsync({
          url: targetUrl,
          format,
        });
        if (created?.id) {
          setSelectedCodeId(created.id);
        }
        if (created?.signedUrl) {
          await verifyPreview({
            signedUrl: created.signedUrl,
            id: created?.id ?? null,
          });
        }
        toast({
          title: t("qrMgmt.toasts.generated", "QR code ready"),
          description: t(
            "qrMgmt.toasts.generated_desc",
            "Preview the refreshed QR below."
          ),
        });
      } catch (error: any) {
        const message = error?.message ?? t("qrMgmt.toasts.generate_failed");
        toast({
          title: t("qrMgmt.toasts.generate_failed_title", "Unable to create"),
          description: message,
          variant: "destructive",
        });
      }
      return;
    }
    if (!currentCode) return;
    try {
      const updated = await updateMutation.mutateAsync({
        id: currentCode.id,
        url: targetUrl,
        format,
      });
      if (updated?.signedUrl) {
        await verifyPreview({
          signedUrl: updated.signedUrl,
          id: updated?.id ?? currentCode.id,
        });
      }
      toast({
        title: t("qrMgmt.toasts.updated", "QR code updated"),
        description: t(
          "qrMgmt.toasts.updated_desc",
          "Review the refreshed QR below."
        ),
      });
    } catch (error: any) {
      const message = error?.message ?? t("qrMgmt.toasts.update_failed");
      toast({
        title: t("qrMgmt.toasts.update_failed_title", "Unable to update"),
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!currentCode) return;
    try {
      setDownloadLoading(true);
      toast({
        title: t("qrMgmt.toasts.starting_download", "Starting download..."),
      });
      const fileUrl = toAbsoluteUrl(currentCode.signedUrl);
      const headers: Record<string, string> = {};
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(fileUrl, {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        headers,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to download QR file: ${response.status} ${response.statusText}`
        );
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
      // release after a short delay to ensure the download has been handled by browser
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
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
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!currentCode) return;
    try {
      setPrintLoading(true);
      toast({
        title: t("qrMgmt.toasts.preparing_print", "Preparing print..."),
      });
      const fileUrl = toAbsoluteUrl(currentCode.signedUrl);
      const headers: Record<string, string> = {};
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(fileUrl, {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        headers,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch for print: ${response.status} ${response.statusText}`
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (!printWindow) {
        URL.revokeObjectURL(url);
        toast({
          title: t("qrMgmt.toasts.popup_blocked"),
          description: t("qrMgmt.toasts.allow_popups"),
          variant: "destructive",
        });
        return;
      }
      // revoke when window unloads
      const revoke = () => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
      };
      printWindow.addEventListener("beforeunload", revoke);
      toast({
        title: t("qrMgmt.toasts.print_opened"),
        description: t("qrMgmt.toasts.print_desc"),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("qrMgmt.toasts.print_unable");
      toast({
        title: t("qrMgmt.toasts.print_failed"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setPrintLoading(false);
    }
  };

  const renderPreview = () => {
    if (!currentCode) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Generate a QR code to preview it here.
          </p>
        </div>
      );
    }

    const fileUrl = toAbsoluteUrl(currentCode.signedUrl);

    if (currentCode.format === "pdf") {
      if (previewBlobUrl) {
        return (
          <iframe
            src={previewBlobUrl}
            title="QR preview"
            className="h-64 w-full rounded-lg border border-border"
          />
        );
      }
      if (previewChecking) {
        return (
          <div className="text-sm text-muted-foreground">
            {t("qrMgmt.checking_preview", "Checking...")}
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-border bg-background p-4 text-center sm:flex-row sm:gap-6 sm:text-left">
        {previewError ? (
          <div className="w-full space-y-2 text-sm text-destructive">
            <p>{t("qrMgmt.preview_error", "Preview unavailable")}</p>
            <p className="text-xs text-muted-foreground">{previewError}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!currentCode) return;
                  try {
                    setPreviewChecking(true);
                    // fetch a fresh record with a new signedUrl
                    const fresh = await fetchQRCodeById(currentCode.id);
                    await verifyPreview({
                      signedUrl: fresh?.signedUrl,
                      id: fresh?.id ?? currentCode.id,
                    });
                    // also refresh the list in background
                    queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
                  } catch (e: any) {
                    // detect common network/auth issues
                    const status = e?.response?.status;
                    if (status === 401) {
                      toast({
                        title: t(
                          "qrMgmt.errors.unauthorized",
                          "Unauthorized — please log in again"
                        ),
                        variant: "destructive",
                      });
                      return;
                    }
                    toast({
                      title: t("qrMgmt.errors.network", "Network error"),
                      description: e?.message ?? String(e),
                      variant: "destructive",
                    });
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
                onClick={() =>
                  verifyPreview({
                    signedUrl: currentCode.signedUrl,
                    id: currentCode.id,
                  })
                }
                disabled={previewChecking}
              >
                {previewChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("qrMgmt.check_preview", "Check")
                )}
              </Button>
              {/* Open the signed URL in a new tab for manual inspection (helps debugging CORS/network) */}
              <Button
                size="sm"
                variant="link"
                onClick={() => {
                  try {
                    const src = fileUrl;
                    window.open(src, "_blank");
                  } catch (e) {
                    // ignore
                  }
                }}
              >
                Open raw
              </Button>
            </div>
          </div>
        ) : previewBlobUrl ? (
          <img
            src={previewBlobUrl}
            alt="QR code preview"
            className="mx-auto h-48 w-48 object-contain sm:h-60 sm:w-60"
          />
        ) : previewChecking ? (
          <div className="text-sm text-muted-foreground">
            {t("qrMgmt.checking_preview", "Checking...")}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {t("qrMgmt.preview_unavailable", "Preview unavailable")}
          </div>
        )}
      </div>
    );
  };

  const statsData: QRStats | undefined = stats;
  const isBusy = mutationIsPending || codesFetching;

  return (
    <div className="space-y-6 p-4 md:space-y-8 md:p-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-serif font-bold text-foreground md:text-4xl">
            {t("qrMgmt.title")}
          </h1>
          <p className="text-muted-foreground">{t("qrMgmt.subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/admin")}
            className="w-full sm:mr-2 sm:w-auto"
          >
            ← {t("qrMgmt.back", "Back to Dashboard")}
          </Button>
          <Button
            onClick={() => handleGenerate(currentCode ? "update" : "create")}
            className="w-full gap-2 sm:w-auto"
            disabled={!isTargetValid || isBusy}
          >
            {mutationIsPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <QrIcon className="h-4 w-4" />
            {currentCode ? t("qrMgmt.update") : t("qrMgmt.create")}
          </Button>
          {currentCode && (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              onClick={() => handleGenerate("create")}
              disabled={!isTargetValid || mutationIsPending}
            >
              <RefreshCcw className="h-4 w-4" />
              {t("qrMgmt.create_new")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Card className="space-y-6 border border-border bg-card p-6 shadow-sm md:col-span-7 md:p-8 lg:col-span-8">
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
                className="w-full gap-2 sm:w-auto"
                onClick={handleDownload}
                disabled={!currentCode || mutationIsPending || downloadLoading}
              >
                {downloadLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t("qrMgmt.download")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 sm:w-auto"
                onClick={handlePrint}
                disabled={!currentCode || mutationIsPending || printLoading}
              >
                {printLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {t("qrMgmt.print")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-6 border border-border bg-card p-6 shadow-sm md:col-span-5 lg:col-span-4">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

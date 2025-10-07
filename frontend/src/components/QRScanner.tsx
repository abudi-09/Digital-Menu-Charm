/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  onDetected: (value: string) => void;
  className?: string;
};

const QRScanner: React.FC<Props> = ({ onDetected, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  useEffect(() => {
    let cancelled = false;

    const enumerate = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const videoDevices = list.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);
        if (!deviceId && videoDevices.length > 0) {
          setDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        // ignore
      }
    };

    enumerate();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setStatus("requesting");
      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: "environment" } },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("scanning");
        tick();
      } catch (err: any) {
        if (err && err.name === "NotAllowedError") {
          setStatus("permission-denied");
        } else if (err && err.name === "NotFoundError") {
          setStatus("no-camera");
        } else {
          setStatus("error");
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const decodeImageData = async (
    imageData: ImageData,
    canvas?: HTMLCanvasElement | null
  ) => {
    // Use native BarcodeDetector if available. Prefer passing a CanvasImageSource (the canvas)
    // because some implementations expect an ImageBitmap or Canvas rather than raw ImageData.
    if ("BarcodeDetector" in window) {
      try {
        // access via any because the global type may not exist in older TS libs
        const Detector = (window as any).BarcodeDetector as any;
        const detector = new Detector({ formats: ["qr_code"] });
        let result: any = null;
        if (canvas) {
          // pass the canvas element (CanvasImageSource) which is supported by BarcodeDetector
          result = await detector.detect(canvas as any);
        } else {
          // fall back to passing an ImageBitmap if available
          try {
            // create ImageBitmap from ImageData where supported
            // createImageBitmap may throw in some environments, so guard it
            // eslint-disable-next-line no-undef
            const bitmap = await createImageBitmap(
              new ImageData(imageData.data, imageData.width, imageData.height)
            );
            result = await detector.detect(bitmap as any);
          } catch (err) {
            // if createImageBitmap isn't available or fails, skip native detector
            result = null;
          }
        }
        if (result && result.length > 0) {
          return (result[0].rawValue as string) || null;
        }
      } catch (err: unknown) {
        // no-op, fall through to jsQR
      }
    }
    // Try jsQR fallback (dynamic import to avoid bundling when not needed)
    try {
      const mod = await import("jsqr");
      const jsqr = (mod as any).default ?? mod;
      const code = jsqr(imageData.data, imageData.width, imageData.height);
      if (code && code.data) return code.data as string;
    } catch (err) {
      // fallback not available
    }
    return null;
  };

  const tick = async () => {
    if (!videoRef.current || !canvasRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = Math.min(640, video.videoWidth || 640);
    const h = Math.min(480, video.videoHeight || 480);
    if (w === 0 || h === 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      // pass canvas so native BarcodeDetector can operate on a CanvasImageSource
      const decoded = await decodeImageData(imageData, canvas);
      if (decoded) {
        setStatus("found");
        stopStream();
        onDetected(decoded);
        return;
      }
    } catch (err) {
      // continue
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setStatus("scanning-image");
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const decoded = await decodeImageData(imageData, canvas);
      if (decoded) {
        setStatus("found");
        onDetected(decoded);
        return;
      }
      setStatus("no-code");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className={className}>
      <div className="rounded-md overflow-hidden bg-black/80 relative">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {status === "requesting" && (
            <div className="text-sm text-white">Requesting camera…</div>
          )}
          {status === "permission-denied" && (
            <div className="text-sm text-white">Camera access denied.</div>
          )}
          {status === "no-camera" && (
            <div className="text-sm text-white">No camera found.</div>
          )}
          {status === "scanning" && (
            <div className="text-sm text-white">Point camera at a QR code</div>
          )}
          {status === "scanning-image" && (
            <div className="text-sm text-white">Scanning image…</div>
          )}
          {status === "no-code" && (
            <div className="text-sm text-white">No QR code found in image</div>
          )}
        </div>

        {/* Debug overlay: shows current scanner status and camera count */}
        <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
          <div>
            Status: <span className="font-mono">{status}</span>
          </div>
          <div>
            Devices: <span className="font-mono">{devices.length}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <button className="px-3 py-2 rounded bg-muted text-sm">
            Upload image
          </button>
        </label>

        {devices.length > 1 && (
          <select
            value={deviceId ?? ""}
            onChange={(e) => setDeviceId(e.target.value)}
            className="px-3 py-2 rounded bg-muted text-sm"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || d.deviceId}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => {
            stopStream();
            setStatus("idle");
          }}
          className="px-3 py-2 rounded bg-muted text-sm ml-auto"
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default QRScanner;

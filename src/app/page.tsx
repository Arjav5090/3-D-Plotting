"use client";

/**
 * Home page. The 3D viewer is loaded with `ssr: false` because React Three
 * Fiber needs the browser's WebGL context — it must not render on the server.
 */
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { PlotInfoCard } from "@/ui/PlotInfoCard";
import { CameraControls } from "@/ui/CameraControls";
import { BrandHeader } from "@/ui/BrandHeader";
import { PoweredBy } from "@/ui/PoweredBy";
import { LoadingOverlay } from "@/ui/LoadingOverlay";
import { SiteDataBridge } from "@/ui/SiteDataBridge";
import { useLoadingStore } from "@/store/useLoadingStore";
import { APP_BACKGROUND_CLASS } from "@/ui/appTheme";

const SiteViewer = dynamic(
  () => import("@/rendering/SiteViewer").then((m) => m.SiteViewer),
  { ssr: false, loading: () => null },
);

function SiteViewerWrapper() {
  const setViewerReady = useLoadingStore((s) => s.setViewerReady);

  useEffect(() => {
    setViewerReady(true);
    return () => setViewerReady(false);
  }, [setViewerReady]);

  return <SiteViewer />;
}

export default function Home() {
  return (
    <main className={`relative h-screen w-screen overflow-hidden ${APP_BACKGROUND_CLASS}`}>
      <SiteDataBridge />
      <BrandHeader />
      <PoweredBy />
      <LoadingOverlay />
      <PlotInfoCard />
      <CameraControls />
      <SiteViewerWrapper />
    </main>
  );
}

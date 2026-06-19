import { useEffect, useMemo, useState } from "react"
import {
  Ion,
  Cartesian3,
  Color,
  UrlTemplateImageryProvider,
  ImageryLayer,
  HeightReference,
  VerticalOrigin,
  createWorldTerrainAsync,
  type TerrainProvider,
} from "cesium"
import { Viewer, Entity, EntityDescription, CameraFlyTo } from "resium"
import { formatDateTime } from "@/lib/utils"
import type { MidiaResponse } from "@/lib/types"

const TOKEN = import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN
if (TOKEN) Ion.defaultAccessToken = TOKEN

export function CesiumGlobe({
  centerLat,
  centerLon,
  fotos,
  height = 360,
}: {
  centerLat: number
  centerLon: number
  fotos: MidiaResponse[]
  height?: number
}) {
  // OSM como camada base — funciona mesmo sem token Ion.
  const baseLayer = useMemo(
    () =>
      new ImageryLayer(
        new UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          maximumLevel: 19,
          credit: "© OpenStreetMap",
        })
      ),
    []
  )

  // Relevo 3D realista só quando há token Ion.
  const [terrain, setTerrain] = useState<TerrainProvider | undefined>()
  useEffect(() => {
    if (!TOKEN) return
    let alive = true
    createWorldTerrainAsync()
      .then((t) => alive && setTerrain(t))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <Viewer
        full={false}
        style={{ height: "100%", width: "100%" }}
        baseLayer={baseLayer}
        terrainProvider={terrain}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        timeline={false}
        animation={false}
        fullscreenButton={false}
        infoBox
        selectionIndicator
      >
        <CameraFlyTo
          destination={Cartesian3.fromDegrees(centerLon, centerLat, 900)}
          duration={2}
          once
        />
        {fotos.map((f) => (
          <Entity
            key={f.id_midia}
            name={formatDateTime(f.data_hora_captura)}
            position={Cartesian3.fromDegrees(f.longitude, f.latitude, 4)}
            point={{
              pixelSize: 12,
              color: Color.fromCssColorString("#F5A623"),
              outlineColor: Color.WHITE,
              outlineWidth: 2,
              heightReference: HeightReference.CLAMP_TO_GROUND,
            }}
            billboard={{
              image: f.storage_url,
              width: 56,
              height: 56,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: new Cartesian3(0, -8, 0),
              heightReference: HeightReference.CLAMP_TO_GROUND,
            }}
          >
            <EntityDescription>
              <div style={{ fontFamily: "sans-serif", color: "#0f172a" }}>
                <img
                  src={f.storage_url}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    marginBottom: 8,
                    display: "block",
                  }}
                />
                <p style={{ margin: "2px 0", fontSize: 13 }}>
                  📍 {f.latitude.toFixed(5)}, {f.longitude.toFixed(5)}
                </p>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#64748b" }}>
                  🕑 {formatDateTime(f.data_hora_captura)}
                </p>
                {f.ai_analise && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      padding: 8,
                      background: "#eff6ff",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    ✨ {f.ai_analise}
                  </p>
                )}
              </div>
            </EntityDescription>
          </Entity>
        ))}
      </Viewer>
    </div>
  )
}

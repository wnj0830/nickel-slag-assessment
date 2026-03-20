import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import AMapLoader from '@amap/amap-jsapi-loader';

declare global {
  interface Window {
    _AMapSecurityConfig?: any;
    AMap?: any;
  }
}

const DangerLocationMap = ({ width = '100%', height = '600px' }) => {
  const { sensors } = useAppSelector((state: any) => state.realtimeData);
  const criticalSensor = sensors.find((s: any) => s.status === 'critical');

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 初始化地图（只执行一次）
  useEffect(() => {
    console.log('useEffect 执行，mapContainer.current =', mapContainer.current);
    if (!mapContainer.current) {
      console.log('mapContainer.current 为空，退出');
      return;
    }

    let isMounted = true;

    // 安全密钥（如果不需要，可以注释或删除）
    window._AMapSecurityConfig = {
      securityJsCode: '77730d81c81d6ce88059e96526c925bf',
    };

    AMapLoader.load({
      key: '1e9054cd60a76d7f2140f081c74f38be', // 替换为你的完整 Key
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })
      .then((AMap) => {
        if (!isMounted || !mapContainer.current) return;
        console.log('高德地图加载成功');

        // 创建地图实例
        mapInstance.current = new AMap.Map(mapContainer.current, {
          zoom: 17,
          center: [111.9835, 21.8646], // 先设一个默认中心，后面会根据 criticalSensor 更新
          viewMode: '3D',
        });

        mapInstance.current.addControl(new AMap.Scale());
        mapInstance.current.addControl(new AMap.ToolBar());

        setMapLoaded(true);

        // 如果已经有危险传感器，立即添加标记
        if (criticalSensor) {
          addMarkerAndInfoWindow(AMap);
        }
      })
      .catch((e) => {
        console.error('高德地图加载失败', e);
        setLoadError('地图加载失败，请检查网络或稍后重试');
      });

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []); // 空依赖，只执行一次

  // 当危险传感器变化时，更新地图中心并添加/更新标记
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !criticalSensor) return;
    const AMap = window.AMap;
    if (!AMap) return;

    // 移除旧的标记和信息窗口
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 移动地图中心到危险位置
    const { lng, lat } = criticalSensor.gpsCoordinates;
    mapInstance.current.setCenter([lng, lat]);

    // 添加新标记和信息窗口
    addMarkerAndInfoWindow(AMap);
  }, [criticalSensor, mapLoaded]);

  const addMarkerAndInfoWindow = (AMap: any) => {
    if (!mapInstance.current || !criticalSensor) return;

    const { lng, lat } = criticalSensor.gpsCoordinates;

    const marker = new AMap.Marker({
      position: [lng, lat],
      title: criticalSensor.locationName,
      icon: new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0ZGNzY3Yi8+PHBhdGggZD0iTTE2IDhWMTZNMTYgMjRWNjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
        imageOffset: new AMap.Pixel(0, 0),
      }),
    });
    marker.setMap(mapInstance.current);
    markerRef.current = marker;

    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="padding: 12px; background: #1a1d21; border-radius: 8px; color: #e4e8ec;">
          <h4 style="margin:0 0 8px; color:#ff4d4f;">⚠️ 危险位置</h4>
          <p style="margin:4px 0;"><strong>位置：</strong>${criticalSensor.locationName}</p>
          <p style="margin:4px 0;"><strong>经纬度：</strong>${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
          <p style="margin:4px 0;"><strong>压实度：</strong>${criticalSensor.actualCompactionDegree}%</p>
          <p style="margin:4px 0;"><strong>含水率：</strong>${criticalSensor.fieldMoistureContent}%</p>
        </div>
      `,
      offset: new AMap.Pixel(0, -30),
      position: [lng, lat],
    });

    marker.on('click', () => {
      infoWindow.open(mapInstance.current, [lng, lat]);
    });

    infoWindow.open(mapInstance.current, [lng, lat]);
    infoWindowRef.current = infoWindow;
  };

  // 关键：地图容器始终渲染，用绝对定位的浮层覆盖显示各种状态
  return (
    <div style={{ position: 'relative', width, height, borderRadius: '10px', overflow: 'hidden' }}>
      {/* 地图容器始终存在 */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* 加载中浮层 */}
      {!mapLoaded && !loadError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1d21',
          zIndex: 10,
        }}>
          地图加载中...
        </div>
      )}

      {/* 错误浮层 */}
      {loadError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1d21',
          color: '#ef4444',
          zIndex: 10,
        }}>
          {loadError}
        </div>
      )}

      {/* 无危险传感器浮层 */}
      {!criticalSensor && mapLoaded && !loadError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1d21',
          zIndex: 10,
        }}>
          暂无危险位置
        </div>
      )}
    </div>
  );
};

export default DangerLocationMap;
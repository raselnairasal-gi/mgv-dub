import Hls from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Trailer } from '../api';

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { trailer: Trailer; maxHeight?: number };

/** Видео из Steam: HLS через hls.js (Chrome/Firefox) или нативно (Safari), mp4 — напрямую */
export const HlsVideo = forwardRef<HTMLVideoElement, Props>(function HlsVideo({ trailer, maxHeight = 1080, ...rest }, ref) {
  const v = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => v.current!);

  useEffect(() => {
    const el = v.current!;
    let hls: Hls | null = null;
    if (trailer.mp4) {
      el.src = trailer.mp4;
    } else if (trailer.hls) {
      if (Hls.isSupported()) {
        hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 20 });
        hls.loadSource(trailer.hls);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!hls) return;
          // не грузим 1080p, если для фона хватит меньшего
          const idx = hls.levels.reduce((best, l, i) => (l.height <= maxHeight && l.height > (hls!.levels[best]?.height ?? 0) ? i : best), 0);
          hls.autoLevelCapping = idx;
        });
      } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = trailer.hls;
      }
    }
    if (rest.autoPlay) el.play().catch(() => {});
    return () => {
      hls?.destroy();
      el.removeAttribute('src');
      el.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailer.id]);

  return <video ref={v} playsInline {...rest} />;
});

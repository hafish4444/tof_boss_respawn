import { useState, useCallback } from 'react';
import Image from "next/image"

interface propsBossImage {
  bossName: string
  imageUrl: string
}

// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const triplet = (e1: number, e2: number, e3: number) =>
keyStr.charAt(e1 >> 2) +
keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
keyStr.charAt(e3 & 63)
const rgbDataURL = (r: number, g: number, b: number) => `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`

const BossImage = (bossImageProps: propsBossImage) => {
  const { bossName, imageUrl } = bossImageProps
  const [src, setSrc] = useState(imageUrl);

  const handleOnError = useCallback(() => {
    setSrc('/default.png');
  }, []);

  const renderImage = useCallback(() => (
    <Image
      src={src}
      alt={`Boss ${bossName} Image`}
      placeholder="blur"
      blurDataURL={rgbDataURL(55, 100, 160)}
      fill
      sizes="(max-width: 638px) 100vw,
            (max-width: 768px) 50vw,
            (max-width: 1280px) 33vw,
            (max-width: 1536px) 25vw,
            20vw"
      onError={handleOnError}
    />
  ), [src, bossName, handleOnError]);
  
  return renderImage();
};

export default BossImage
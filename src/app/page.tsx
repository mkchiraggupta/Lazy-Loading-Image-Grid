 "use client"

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ImageGrid.css";

interface ImageData {
  id: number;
  author: string;
}

const Home: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const loader = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const LIMIT = 9;

  const fetchImages = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=${LIMIT}`
      );

      if (!res.ok) {
        throw new Error("Failed to load images");
      }

      const data: ImageData[] = await res.json();

      setImages((prev) => {
        const existingIds = new Set(prev.map((img) => img.id));
        const newImages = data.filter((img) => !existingIds.has(img.id));
        return [...prev, ...newImages];
      });

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Could not load more images. Please try again.");
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (!loader.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(loader.current);
    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  return (
    <main className="page">
      <header className="hero">
        <h1>Lazy Loading Image Grid</h1>
        <p>Scroll to continuously load beautiful random images.</p>
      </header>

      <div className="grid">
        {images.map((img) => (
          <div className="image-card" key={img.id}>
            <Image
              src={`https://picsum.photos/id/${img.id}/800/600`}
              alt={img.author}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="image"
              unoptimized
            />
            <div className="overlay">{img.author}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="status-row" role="alert">
          <p>{error}</p>
          <button type="button" onClick={fetchImages}>
            Retry
          </button>
        </div>
      )}

      {isLoading && <p className="status-text">Loading more images...</p>}
      {!hasMore && !isLoading && (
        <p className="status-text">You have reached the end of the gallery.</p>
      )}

      <div ref={loader} className="loader-sentinel" aria-hidden />
    </main>
  );
};

export default Home;

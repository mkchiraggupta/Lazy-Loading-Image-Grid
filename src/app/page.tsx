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
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const loader = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const LIMIT = 9;
  const SKELETON_COUNT = 6;

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

      // Stop only when API returns no items.
      if (data.length === 0) {
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

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="page">
      <header className="hero">
        <h1>Lazy Loading Image Grid</h1>
        <p>Scroll to continuously load beautiful random images.</p>
      </header>

      <div className="grid">
        {images.map((img) => (
          <button
            type="button"
            className="image-card image-trigger"
            key={img.id}
            onClick={() => setSelectedImage(img)}
          >
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
          </button>
        ))}

        {isLoading &&
          Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div
              className="image-card skeleton-card"
              key={`skeleton-${page}-${index}`}
              aria-hidden
            />
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

      {!hasMore && !isLoading && (
        <p className="status-text">You have reached the end of the gallery.</p>
      )}

      {!error && hasMore && !isLoading && (
        <div className="status-row">
          <button type="button" onClick={handleLoadMore}>
            Load more
          </button>
        </div>
      )}

      <div ref={loader} className="loader-sentinel" aria-hidden />

      {showScrollTop && (
        <button
          type="button"
          className="scroll-top"
          onClick={handleScrollToTop}
          aria-label="Scroll back to top"
        >
          Top
        </button>
      )}

      {selectedImage && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview image by ${selectedImage.author}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image preview"
            >
              <span className="modal-close-icon" aria-hidden />
            </button>
            <div className="modal-image-wrap">
              <Image
                src={`https://picsum.photos/id/${selectedImage.id}/1200/900`}
                alt={selectedImage.author}
                fill
                className="modal-image"
                sizes="90vw"
                unoptimized
              />
            </div>
            <p className="modal-author">Photo by {selectedImage.author}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;

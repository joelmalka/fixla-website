'use client';

import Image from 'next/image';

const SERVICE_IMAGES = [
  '/services/cleaning.jpg',
  '/services/lawn.jpg',
  '/services/dog.jpg',
  '/services/window.jpg',
  '/services/tire.jpg',
  '/services/snow.jpg',
  '/services/fence-paint.jpg',
  '/services/furniture.jpg',
  '/services/carwash.jpg',
];

function buildColumns(): string[][] {
  const cols: string[][] = [[], [], []];
  SERVICE_IMAGES.forEach((src, i) => cols[i % 3].push(src));
  return cols;
}

export default function HomeHeroGrid({ variant }: { variant: 'mobile' | 'desktop' }) {
  const cols = buildColumns();
  if (variant === 'mobile') {
    return (
      <div className="relative h-44 w-full overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 items-start gap-2 px-3 pt-3">
          <Column images={cols[0]} direction="up" duration={28} heightClass="h-full" />
          <Column images={cols[1]} direction="down" duration={32} heightClass="h-[70%]" />
          <Column images={cols[2]} direction="up" duration={36} heightClass="h-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-[480px] w-full overflow-hidden lg:h-[560px]">
      <div className="absolute inset-0 grid grid-cols-3 items-start gap-3 p-3">
        <Column images={cols[0]} direction="up" duration={34} heightClass="h-full" />
        <Column images={cols[1]} direction="down" duration={42} heightClass="h-[78%]" />
        <Column images={cols[2]} direction="up" duration={38} heightClass="h-full" />
      </div>
    </div>
  );
}

function Column({
  images,
  direction,
  duration,
  heightClass,
}: {
  images: string[];
  direction: 'up' | 'down';
  duration: number;
  heightClass: string;
}) {
  const doubled = [...images, ...images];
  return (
    <div className={`relative overflow-hidden rounded-2xl ${heightClass}`}>
      <div
        className="flex flex-col"
        style={{
          animation: `${direction === 'up' ? 'fixlaGridUp' : 'fixlaGridDown'} ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl"
            style={{ marginBottom: 12 }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 768px) 240px, 33vw"
              className="object-cover"
              priority={i < 3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

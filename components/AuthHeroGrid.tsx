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

export default function AuthHeroGrid() {
  const cols = buildColumns();
  return (
    <div className="relative h-36 w-full overflow-hidden bg-white md:h-44">
      <div className="absolute inset-0 grid grid-cols-3 items-start gap-2 px-2 pt-2">
        <Column images={cols[0]} direction="up" duration={28} heightClass="h-full" />
        <Column images={cols[1]} direction="down" duration={32} heightClass="h-[70%]" />
        <Column images={cols[2]} direction="up" duration={36} heightClass="h-full" />
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
    <div className={`relative overflow-hidden rounded-xl ${heightClass}`}>
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
            className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl"
            style={{ marginBottom: 8 }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 200px, 33vw"
              className="object-cover"
              priority={i < 3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

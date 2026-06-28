export type ServicePricingType = 'instant-quote' | 'photo-estimate';

export interface ServiceMeta {
  slug: string;
  /** Internal English name matching the `services.name` row in Supabase */
  dbName: string;
  /** Finnish display name */
  name: string;
  description: string;
  /** Public path to the service photo, e.g. `/services/cleaning.jpg` */
  image: string;
  pricingType: ServicePricingType;
  featured?: boolean;
}

export const SERVICES: ServiceMeta[] = [
  {
    slug: 'siivous',
    dbName: 'Cleaning',
    name: 'Siivous',
    description: 'Kotisiivous luonasi',
    image: '/services/cleaning.jpg',
    pricingType: 'instant-quote',
    featured: true,
  },
  {
    slug: 'ikkunoiden-pesu',
    dbName: 'Window Washing',
    name: 'Ikkunoiden pesu',
    description: 'Ammattimainen ikkunoiden pesu',
    image: '/services/window.jpg',
    pricingType: 'instant-quote',
  },
  {
    slug: 'renkaiden-vaihto',
    dbName: 'Tire Change',
    name: 'Renkaiden vaihto',
    description: 'Renkaiden vaihto palvelu luonasi',
    image: '/services/tire.jpg',
    pricingType: 'instant-quote',
  },
  {
    slug: 'auton-sisapesu',
    dbName: 'Car Interior Cleaning',
    name: 'Auton sisäpesu',
    description: 'Ammattimainen auton sisäpesu luonasi',
    image: '/services/carwash.jpg',
    pricingType: 'instant-quote',
  },
  {
    slug: 'koiran-ulkoilutus',
    dbName: 'Dog Walking',
    name: 'Koiran ulkoilutus',
    description: 'Koiran ulkoilutus luotettavasti',
    image: '/services/dog.jpg',
    pricingType: 'instant-quote',
  },
  {
    slug: 'huonekalujen-kokoaminen',
    dbName: 'Furniture Assembly',
    name: 'Huonekalujen kokoaminen',
    description: 'Huonekalujen kokoaminen kotonasi',
    image: '/services/furniture.jpg',
    pricingType: 'instant-quote',
  },
  {
    slug: 'nurmikon-leikkaus',
    dbName: 'Lawn Mowing',
    name: 'Nurmikon leikkaus',
    description: 'Nurmikon leikkaus pihassasi',
    image: '/services/lawn.jpg',
    pricingType: 'photo-estimate',
  },
  {
    slug: 'aidan-pesu',
    dbName: 'Fence Washing',
    name: 'Aidan pesu',
    description: 'Aidan painepesu',
    image: '/services/fence-wash.jpg',
    pricingType: 'photo-estimate',
  },
  {
    slug: 'aidan-maalaus',
    dbName: 'Fence Painting',
    name: 'Aidan maalaus',
    description: 'Aidan maalaus ammattilaisilta',
    image: '/services/fence-paint.jpg',
    pricingType: 'photo-estimate',
  },
  {
    slug: 'lumityot',
    dbName: 'Snow Work',
    name: 'Lumityöt',
    description: 'Lumityöt pihassasi',
    image: '/services/snow.jpg',
    pricingType: 'photo-estimate',
  },
  {
    slug: 'muu-tyo',
    dbName: 'Other Work',
    name: 'Muu työ',
    description: 'Personoidut palveluratkaisut',
    image: '/services/other.jpg',
    pricingType: 'photo-estimate',
  },
];

export function getServiceBySlug(slug: string): ServiceMeta | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

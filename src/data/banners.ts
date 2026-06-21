 export interface Banner {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
}

// User can add their custom banners here
// If the array has only 1 item, it won't slide.
// If it's empty, it will fall back to dynamic food banners.
export const customBanners: Banner[] = [ 
  { id: '1', image_url: '/banners/Banner1.png' },
  { id: '2', image_url: '/banners/Banner2.png' },
  { id: '3', image_url: '/banners/Banner3.png' }
];

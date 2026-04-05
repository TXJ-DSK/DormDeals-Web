export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string; // URL or base64
  furnitureType: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  location: string;
  deliveryMethod: 'Pickup' | 'Delivery' | 'Both';
  createdAt: Date;
  userId?: string;
  sellerContact: string; // Email or phone for messaging seller
}

export class Offer {
    id: number;
    code: string;
    reward: string;
    type: string; //Options: percent, fixed_cart and fixed_product.
    data: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    description: string;
}
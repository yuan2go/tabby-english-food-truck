import { FOOD, foodAsset, type Product } from '../content/recipes';
import { assetUrl } from '../game/assets';
export function Food({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <img
      className={`food-art ${className}`}
      src={assetUrl(foodAsset(product))}
      alt={FOOD[product][0]}
      draggable={false}
    />
  );
}

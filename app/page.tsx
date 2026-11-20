import { StoreProvider } from "@/lib/store";
import { getLang } from "@/lib/lang";
import { readProducts } from "@/lib/products-store";
import Shop from "@/components/Shop";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, lang] = await Promise.all([readProducts(), getLang()]);
  return (
    <StoreProvider initialLang={lang} products={products}>
      <Shop />
    </StoreProvider>
  );
}

import { useState } from "react";
import { useAdminConnection } from "../components/AdminConnection";
import {
  ActionForm,
  Detail,
  Pager,
  ReadState,
  Table,
  useLiveData,
  can,
  type Field,
} from "../components/LiveData";
import {
  documents,
  mutate,
  money,
  minorUnits,
  wholeNumber,
  type Page,
  type Product,
  type Collection,
  type Asset,
  type ChannelInfo,
  type Variant,
} from "../lib/operations";
const boolOptions = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" },
];
export function LiveCatalogue() {
  const { api, channel } = useAdminConnection()!;
  const [tab, setTab] = useState<"products" | "collections">("products"),
    [skip, setSkip] = useState(0),
    [search, setSearch] = useState("");
  const [product, setProduct] = useState<Product | null>(null),
    [collection, setCollection] = useState<Collection | null>(null),
    [create, setCreate] = useState(false);
  const allowed = can(tab === "products" ? "ReadCatalog" : "ReadCatalog")(
    channel.permissions,
  );
  const list = useLiveData<{
    products?: Page<Product>;
    collections?: Page<Collection>;
  }>(
    documents[tab],
    {
      options: {
        skip,
        take: 20,
        sort: { createdAt: "DESC" },
        ...(search ? { filter: { name: { contains: search } } } : {}),
      },
    },
    allowed,
  );
  const info = useLiveData<{ activeChannel: ChannelInfo }>(documents.channel);
  const assets = useLiveData<{ assets: Page<Asset> }>(
    documents.assets,
    { options: { take: 100 } },
    can("ReadAsset")(channel.permissions),
  );
  const setup = useLiveData<{
    stockLocations: { items: { id: string; name: string }[] };
    taxCategories: { items: { id: string; name: string }[] };
  }>(
    documents.productSetup,
    {},
    can("UpdateCatalog")(channel.permissions) ||
      can("CreateCatalog")(channel.permissions),
  );
  const chooseProduct = useLiveData<{ products: Page<Product> }>(
    documents.products,
    { options: { take: 100 } },
    allowed && tab === "collections",
  );
  const language = info.data?.activeChannel.defaultLanguageCode;
  const currency = info.data?.activeChannel.defaultCurrencyCode;
  const reload = () => {
    setProduct(null);
    setCollection(null);
    setCreate(false);
    list.reload();
  };
  const image: Field = {
    name: "image",
    label: "Featured image",
    options: (assets.data?.assets.items ?? []).map((a) => ({
      value: a.id,
      label: a.name,
    })),
  };
  const base = (record?: Product | Collection): Field[] => [
    { name: "name", label: "Name", required: true, value: record?.name },
    { name: "slug", label: "URL slug", required: true, value: record?.slug },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      value: record?.description,
    },
    { ...image, value: record?.featuredAsset?.id },
  ];
  async function saveProduct(v: Record<string, string>, record?: Product) {
    if (!language) throw new Error("Channel settings have not loaded.");
    return mutate(
      api,
      channel.token,
      record ? "updateProduct" : "createProduct",
      {
        input: {
          ...(record ? { id: record.id } : {}),
          enabled: v.enabled === "true",
          translations: [
            {
              languageCode: language,
              name: v.name,
              slug: v.slug,
              description: v.description,
            },
          ],
          ...(v.image
            ? { featuredAssetId: v.image }
            : record?.featuredAsset
              ? { featuredAssetId: null }
              : {}),
        },
      },
    );
  }
  async function saveCollection(
    v: Record<string, string>,
    record?: Collection,
  ) {
    if (!language) throw new Error("Channel settings have not loaded.");
    const ids = v.productIds ? v.productIds.split(",").filter(Boolean) : [];
    const filter = [
      {
        code: "product-id-filter",
        arguments: [
          { name: "productIds", value: JSON.stringify(ids) },
          { name: "combineWithAnd", value: "true" },
        ],
      },
    ];
    return mutate(
      api,
      channel.token,
      record ? "updateCollection" : "createCollection",
      {
        input: {
          ...(record ? { id: record.id } : {}),
          isPrivate: v.visibility === "private",
          translations: [
            {
              languageCode: language,
              name: v.name,
              slug: v.slug,
              description: v.description,
            },
          ],
          ...(v.image ? { featuredAssetId: v.image } : {}),
          ...(!record || v.productIds
            ? { inheritFilters: false, filters: filter }
            : {}),
        },
      },
    );
  }
  const productIds: Field = {
    name: "productIds",
    label: "Product membership",
    type: "multiple",
    options: (chooseProduct.data?.products.items ?? []).map((p) => ({
      value: p.id,
      label: p.name,
    })),
    hint: "Select products to define membership. When editing, leave empty to preserve existing rules. More complex rules remain available in Vendure.",
  };
  if (!allowed)
    return (
      <p className="live-notice">
        Your channel permissions do not allow catalogue access.
      </p>
    );
  return (
    <>
      <div className="live-toolbar">
        <div className="segmented">
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => {
              setTab("products");
              setSkip(0);
              setProduct(null);
              setCollection(null);
              setCreate(false);
            }}
          >
            Products
          </button>
          <button
            className={tab === "collections" ? "active" : ""}
            onClick={() => {
              setTab("collections");
              setSkip(0);
              setProduct(null);
              setCollection(null);
              setCreate(false);
            }}
          >
            Collections
          </button>
        </div>
        <label className="live-search">
          Search name
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSkip(0);
            }}
          />
        </label>
        <button className="btn" onClick={reload}>
          Refresh
        </button>
        {can("CreateCatalog")(channel.permissions) && (
          <button className="btn primary" onClick={() => setCreate((v) => !v)}>
            New {tab === "products" ? "product" : "collection"}
          </button>
        )}
      </div>
      <ReadState loading={list.loading} error={list.error || info.error} />
      {create && (
        <Detail
          title={tab === "products" ? "New product" : "New collection"}
          onClose={() => setCreate(false)}
        >
          <ActionForm
            title="Details"
            fields={[
              ...base(),
              tab === "products"
                ? {
                    name: "enabled",
                    label: "Availability",
                    options: boolOptions,
                    value: "false",
                  }
                : {
                    name: "visibility",
                    label: "Visibility",
                    options: [
                      { value: "public", label: "Public" },
                      { value: "private", label: "Private" },
                    ],
                  },
              ...(tab === "collections" ? [productIds] : []),
            ]}
            onSave={(v) =>
              tab === "products" ? saveProduct(v) : saveCollection(v)
            }
            onDone={reload}
            submit="Create"
          />
        </Detail>
      )}
      {list.data?.products && (
        <>
          <div className="live-product-grid">
            {list.data.products.items.map((p) => (
              <button
                className="live-product-card"
                key={p.id}
                onClick={() => setProduct(p)}
              >
                {p.featuredAsset ? (
                  <img src={p.featuredAsset.preview} alt="" />
                ) : (
                  <div className="live-image-placeholder">No image</div>
                )}
                <div>
                  <span className="live-status">
                    {p.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.variants.length} variants</p>
                  {p.variants[0] && (
                    <strong>
                      {money(p.variants[0].price, p.variants[0].currencyCode)}
                    </strong>
                  )}
                </div>
              </button>
            ))}
          </div>
          {!list.data.products.items.length && (
            <p className="live-empty">No products in this channel.</p>
          )}
          <Pager
            skip={skip}
            total={list.data.products.totalItems}
            onPage={setSkip}
          />
        </>
      )}
      {list.data?.collections && (
        <>
          <Table
            rows={list.data.collections.items}
            columns={[
              { label: "Collection", render: (c) => c.name },
              {
                label: "Visibility",
                render: (c) => (c.isPrivate ? "Private" : "Public"),
              },
              { label: "Variants", render: (c) => c.productVariantCount },
            ]}
            onSelect={setCollection}
          />
          <Pager
            skip={skip}
            total={list.data.collections.totalItems}
            onPage={setSkip}
          />
        </>
      )}
      {product && (
        <Detail title={product.name} onClose={() => setProduct(null)}>
          {can("UpdateCatalog")(channel.permissions) ? (
            <ActionForm
              key={product.id}
              title="Product details"
              fields={[
                ...base(product),
                {
                  name: "enabled",
                  label: "Availability",
                  options: boolOptions,
                  value: String(product.enabled),
                },
              ]}
              onSave={(v) => saveProduct(v, product)}
              onDone={reload}
            />
          ) : (
            <p>{product.description.replace(/<[^>]*>/g, "")}</p>
          )}
          <h3>Variants and inventory</h3>
          {product.variants.map((v) => (
            <VariantEditor
              key={v.id}
              variant={v}
              locations={setup.data?.stockLocations.items ?? []}
              onDone={reload}
            />
          ))}
          {can("CreateCatalog")(channel.permissions) && (
            <ActionForm
              title="Add variant"
              fields={[
                { name: "name", label: "Variant name", required: true },
                { name: "sku", label: "SKU", required: true },
                {
                  name: "price",
                  label: `Price (${currency ?? "channel currency"})`,
                  required: true,
                },
                {
                  name: "taxCategoryId",
                  label: "Tax category",
                  required: true,
                  options:
                    setup.data?.taxCategories.items.map((t) => ({
                      value: t.id,
                      label: t.name,
                    })) ?? [],
                },
              ]}
              onSave={(v) => {
                if (!language)
                  throw new Error("Channel settings have not loaded.");
                return mutate(api, channel.token, "createProductVariants", {
                  input: [
                    {
                      productId: product.id,
                      sku: v.sku,
                      price: minorUnits(v.price),
                      taxCategoryId: v.taxCategoryId,
                      enabled: true,
                      translations: [{ languageCode: language, name: v.name }],
                    },
                  ],
                });
              }}
              onDone={reload}
              submit="Add variant"
            />
          )}
          <p className="live-hint">
            Variants control price and stock. Option groups and complex
            catalogue rules can be configured in Vendure.
          </p>
        </Detail>
      )}
      {collection && (
        <Detail title={collection.name} onClose={() => setCollection(null)}>
          <p>
            {collection.productVariantCount} variants · Membership is maintained
            by collection rules.
          </p>
          {can("UpdateCatalog")(channel.permissions) && (
            <ActionForm
              key={collection.id}
              title="Collection details"
              fields={[
                ...base(collection),
                {
                  name: "visibility",
                  label: "Visibility",
                  value: collection.isPrivate ? "private" : "public",
                  options: [
                    { value: "public", label: "Public" },
                    { value: "private", label: "Private" },
                  ],
                },
                productIds,
              ]}
              onSave={(v) => saveCollection(v, collection)}
              onDone={reload}
            />
          )}
        </Detail>
      )}
    </>
  );
}
function VariantEditor({
  variant: v,
  locations,
  onDone,
}: {
  variant: Variant;
  locations: { id: string; name: string }[];
  onDone: () => void;
}) {
  const { api, channel } = useAdminConnection()!;
  const [edit, setEdit] = useState(false);
  return (
    <div className="live-variant">
      <div>
        <strong>{v.name}</strong>
        <span>
          {v.sku} · {money(v.price, v.currencyCode)} ·{" "}
          {v.enabled ? "Enabled" : "Disabled"}
        </span>
        <p>
          Inventory: {v.trackInventory}.{" "}
          {v.stockLevels
            .map(
              (s) =>
                `${s.stockLocation.name}: ${s.stockOnHand} on hand, ${s.stockAllocated} allocated`,
            )
            .join(" · ") || "No stock levels"}
        </p>
      </div>
      {can("UpdateCatalog")(channel.permissions) && (
        <button className="btn" onClick={() => setEdit(!edit)}>
          Edit variant
        </button>
      )}
      {edit && (
        <ActionForm
          title="Price and stock"
          fields={[
            { name: "sku", label: "SKU", value: v.sku, required: true },
            {
              name: "price",
              label: `Price (${v.currencyCode})`,
              value: (v.price / 100).toFixed(2),
              required: true,
            },
            {
              name: "enabled",
              label: "Availability",
              value: String(v.enabled),
              options: boolOptions,
            },
            {
              name: "trackInventory",
              label: "Inventory tracking",
              value: v.trackInventory,
              options: [
                { value: "TRUE", label: "Track stock" },
                { value: "FALSE", label: "Do not track" },
                { value: "INHERIT", label: "Use global setting" },
              ],
            },
            ...locations.map((l) => ({
              name: `stock-${l.id}`,
              label: `Stock on hand · ${l.name}`,
              type: "number",
              value: String(
                v.stockLevels.find((s) => s.stockLocationId === l.id)
                  ?.stockOnHand ?? 0,
              ),
            })),
          ]}
          onSave={(values) =>
            mutate(api, channel.token, "updateProductVariants", {
              input: [
                {
                  id: v.id,
                  sku: values.sku,
                  price: minorUnits(values.price),
                  enabled: values.enabled === "true",
                  trackInventory: values.trackInventory,
                  stockLevels: locations.map((l) => ({
                    stockLocationId: l.id,
                    stockOnHand: wholeNumber(values[`stock-${l.id}`]),
                  })),
                },
              ],
            })
          }
          onDone={onDone}
        />
      )}
    </div>
  );
}

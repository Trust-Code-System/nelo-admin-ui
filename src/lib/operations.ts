import { AdminApi, AdminApiError } from "./admin-api.ts";
export interface Page<T> {
  items: T[];
  totalItems: number;
}
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string | null;
}
export interface Asset {
  id: string;
  name: string;
  preview: string;
  source: string;
  mimeType: string;
  fileSize: number;
}
export interface Variant {
  id: string;
  name: string;
  sku: string;
  enabled: boolean;
  price: number;
  currencyCode: string;
  trackInventory: string;
  taxCategory: { id: string; name: string };
  stockLevels: {
    stockLocationId: string;
    stockOnHand: number;
    stockAllocated: number;
    stockLocation: { name: string };
  }[];
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  featuredAsset: Asset | null;
  variants: Variant[];
}
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
  productVariantCount: number;
  featuredAsset: Asset | null;
  filters: { code: string; args: { name: string; value: string }[] }[];
}
export interface MeasurementProfile {
  id: string;
  name: string;
  isDefault: boolean;
  source: string;
  preferredDisplayUnit: string;
  measuredAt: string | null;
  measurements: { code: string; millimetres: string }[];
}
export interface Project {
  id: string;
  reference: string;
  context: string;
  stage: string;
  version: number;
  notes: string | null;
  targetCompletionDate: string | null;
  customer: Customer | null;
  items: {
    id: string;
    name: string;
    stage: string;
    version: number;
    targetCompletionDate: string | null;
    linkedOrderLines: { orderLineId: string; orderCode: string }[];
  }[];
  relatedOrderCodes: string[];
  measurements: {
    confirmedAt: string;
    measurements: { code: string; millimetres: string }[];
  } | null;
  appointments: {
    id: string;
    purpose: string;
    status: string;
    startsAt: string;
  }[];
}
export interface Order {
  id: string;
  code: string;
  state: string;
  currencyCode: string;
  totalWithTax: number;
  createdAt: string;
  customer: Customer | null;
  shippingAddress: {
    fullName: string | null;
    streetLine1: string | null;
    city: string | null;
    country: string | null;
  } | null;
  lines: {
    id: string;
    quantity: number;
    discountedLinePriceWithTax: number;
    productVariant: { name: string; sku: string };
  }[];
  payments:
    | {
        id: string;
        method: string;
        state: string;
        amount: number;
        refunds: {
          id: string;
          state: string;
          total: number;
          reason: string | null;
        }[];
      }[]
    | null;
  fulfillments:
    | {
        id: string;
        state: string;
        nextStates: string[];
        trackingCode: string | null;
        method: string;
        lines: { orderLineId: string; quantity: number }[];
      }[]
    | null;
}
export interface ChannelInfo {
  id: string;
  code: string;
  defaultCurrencyCode: string;
  defaultLanguageCode: string;
  pricesIncludeTax: boolean;
}
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  user: { identifier: string };
}
export const fields = {
  customer: `id firstName lastName emailAddress phoneNumber`,
  asset: `id name preview source mimeType fileSize`,
  variant: `id name sku enabled price currencyCode trackInventory taxCategory { id name } stockLevels { stockLocationId stockOnHand stockAllocated stockLocation { name } }`,
  project: `id reference context stage version notes targetCompletionDate customer { id firstName lastName emailAddress phoneNumber } items { id name stage version targetCompletionDate linkedOrderLines { orderLineId orderCode } } relatedOrderCodes measurements { confirmedAt measurements { code millimetres } } appointments { id purpose status startsAt }`,
  profile: `id name isDefault source preferredDisplayUnit measuredAt measurements { code millimetres }`,
  order: `id code state currencyCode totalWithTax createdAt customer { id firstName lastName emailAddress phoneNumber } shippingAddress { fullName streetLine1 city country } lines { id quantity discountedLinePriceWithTax productVariant { name sku } } payments { id method state amount refunds { id state total reason } } fulfillments { id state nextStates trackingCode method lines { orderLineId quantity } }`,
};
export const documents = {
  products: `query Products($options: ProductListOptions) { products(options: $options) { totalItems items { id name slug description enabled featuredAsset { ${fields.asset} } variants { ${fields.variant} } } } }`,
  collections: `query Collections($options: CollectionListOptions) { collections(options: $options) { totalItems items { id name slug description isPrivate productVariantCount featuredAsset { ${fields.asset} } filters { code args { name value } } } } }`,
  customers: `query Customers($options: CustomerListOptions) { customers(options: $options) { totalItems items { ${fields.customer} } } }`,
  assets: `query Assets($options: AssetListOptions) { assets(options: $options) { totalItems items { ${fields.asset} } } }`,
  commissions: `query Projects($options: BespokeProjectAdminListOptions) { bespokeProjects(options: $options) { totalItems items { ${fields.project} } } }`,
  orders: `query Orders($options: OrderListOptions) { orders(options: $options) { totalItems items { ${fields.order} } } }`,
  customerOrders: `query CustomerOrders($customerId: ID!) { customer(id: $customerId) { orders(options: {take: 100}) { items { id code lines { id productVariant { name } } } } } }`,
  appointments: `query CustomerAppointments($options: AtelierAppointmentAdminListOptions) { atelierAppointments(options: $options) { totalItems items { id purpose status startsAt } } }`,
  profiles: `query Profiles($customerId: ID!) { atelierMeasurementProfiles(customerId: $customerId) { ${fields.profile} } }`,
  channel: `query Channel { activeChannel { id code defaultCurrencyCode defaultLanguageCode pricesIncludeTax } }`,
  administrator: `query Administrator { activeAdministrator { id firstName lastName emailAddress user { identifier } } }`,
  productSetup: `query ProductSetup { stockLocations(options: {take: 100}) { items { id name } } taxCategories(options: {take: 100}) { items { id name } } }`,
  fulfillmentHandlers: `query FulfillmentHandlers { fulfillmentHandlers { code args { name type required defaultValue } } }`,
};
export const mutations = {
  createProduct: `mutation CreateProduct($input: CreateProductInput!) { createProduct(input: $input) { id } }`,
  updateProduct: `mutation UpdateProduct($input: UpdateProductInput!) { updateProduct(input: $input) { id } }`,
  createProductVariants: `mutation CreateVariants($input: [CreateProductVariantInput!]!) { createProductVariants(input: $input) { id } }`,
  updateProductVariants: `mutation UpdateVariants($input: [UpdateProductVariantInput!]!) { updateProductVariants(input: $input) { id } }`,
  createCollection: `mutation CreateCollection($input: CreateCollectionInput!) { createCollection(input: $input) { id } }`,
  updateCollection: `mutation UpdateCollection($input: UpdateCollectionInput!) { updateCollection(input: $input) { id } }`,
  createCustomer: `mutation CreateCustomer($input: CreateCustomerInput!) { createCustomer(input: $input) { __typename ... on Customer { id } ... on ErrorResult { errorCode message } } }`,
  updateCustomer: `mutation UpdateCustomer($input: UpdateCustomerInput!) { updateCustomer(input: $input) { __typename ... on Customer { id } ... on ErrorResult { errorCode message } } }`,
  createBespokeProject: `mutation CreateProject($input: CreateBespokeProjectInput!) { createBespokeProject(input: $input) { id } }`,
  updateBespokeProject: `mutation UpdateProject($input: UpdateBespokeProjectInput!) { updateBespokeProject(input: $input) { id } }`,
  transitionBespokeProject: `mutation TransitionProject($input: TransitionBespokeProjectInput!) { transitionBespokeProject(input: $input) { id } }`,
  addBespokeItem: `mutation AddItem($input: AddBespokeItemInput!) { addBespokeItem(input: $input) { id } }`,
  updateBespokeItem: `mutation UpdateItem($input: UpdateBespokeItemInput!) { updateBespokeItem(input: $input) { id } }`,
  transitionBespokeItem: `mutation TransitionItem($input: TransitionBespokeItemInput!) { transitionBespokeItem(input: $input) { id } }`,
  confirmBespokeProjectMeasurements: `mutation ConfirmMeasurements($input: ConfirmBespokeProjectMeasurementsInput!) { confirmBespokeProjectMeasurements(input: $input) { id } }`,
  associateAtelierAppointment: `mutation AssociateAppointment($input: AssociateAtelierAppointmentInput!) { associateAtelierAppointment(input: $input) { id } }`,
  linkBespokeItemOrderLine: `mutation LinkOrderLine($input: LinkBespokeItemOrderLineInput!) { linkBespokeItemOrderLine(input: $input) { id } }`,
  recordAtelierMeasurementProfile: `mutation RecordMeasurements($input: RecordAtelierMeasurementProfileInput!) { recordAtelierMeasurementProfile(input: $input) { __typename ... on MeasurementProfile { id } ... on MeasurementRangeError { errorCode message code } ... on MeasurementFormatError { errorCode message code } } }`,
  addFulfillmentToOrder: `mutation Fulfill($input: FulfillOrderInput!) { addFulfillmentToOrder(input: $input) { __typename ... on Fulfillment { id } ... on ErrorResult { errorCode message } } }`,
  transitionFulfillmentToState: `mutation Ship($id: ID!, $state: String!) { transitionFulfillmentToState(id: $id, state: $state) { __typename ... on Fulfillment { id } ... on ErrorResult { errorCode message } } }`,
  updateActiveAdministrator: `mutation Profile($input: UpdateActiveAdministratorInput!) { updateActiveAdministrator(input: $input) { id } }`,
};
export type MutationName = keyof typeof mutations;
export async function mutate(
  api: AdminApi,
  channel: string,
  name: MutationName,
  variables: Record<string, unknown>,
) {
  const data = await api.request<Record<string, unknown>>(
    mutations[name],
    variables,
    channel,
  );
  const result = data[name];
  if (
    !result ||
    (Array.isArray(result) &&
      (!result.length ||
        result.some((item) => !item || !item.id) ||
        (Array.isArray(variables.input) &&
          result.length !== variables.input.length)))
  )
    throw new AdminApiError(
      "The server returned an incomplete result. Refresh before another update.",
      "UNCERTAIN",
    );
  if (
    typeof result === "object" &&
    "errorCode" in result &&
    "message" in result
  )
    throw new AdminApiError(String(result.message), String(result.errorCode));
  return result;
}
export function minorUnits(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error(
      "Enter a non-negative price with at most two decimal places.",
    );
  const [whole, fraction = ""] = value.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (minor > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Price is too large.");
  return Number(minor);
}
export function wholeNumber(value: string): number {
  const number = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(number))
    throw new Error("Enter a non-negative whole number.");
  return number;
}
export const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    value / 100,
  );
export const customerName = (customer: Customer | null) =>
  customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : "Customer unavailable";

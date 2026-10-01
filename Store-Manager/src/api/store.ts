import { apiRequest } from "./client"

export type ApiProduct = { _id: string; sku: string; name: string; brand: string; orderTypes: string[]; unit: string }
export type StoreContext = { outlet: { outletId: string; displayName: string; brand: "Fresh" | "Style" | "Tech"; district: string; depot: string; windowOpenTime: string; windowCloseTime: string } }
export type StoreOrder = {
  _id: string
  orderNumber: string
  outletId: string
  brand: "Fresh" | "Style" | "Tech"
  orderType: "dry" | "chilled" | "products"
  requestedDate: string
  cutoffBucket: "before_cutoff" | "after_cutoff"
  status: "submitted" | "deferred" | "allocated" | "in_transit" | "delivered" | "cancelled"
  deferredTo?: string
  deferralReason?: string
  totalWeightKg: number
  totalVolumeM3: number
  version: number
  createdAt: string
  updatedAt: string
  items: Array<{ productId: string; sku: string; name: string; unit: string; quantity: number }>
  statusHistory: Array<{ status: string; at: string; actorId?: string; note?: string }>
}
export type CreatedOrder = StoreOrder
export type StoreDelivery = { _id: string; orderId: string; status: string; outcome?: string; version: number; arrivedAt?: string; completedAt?: string; receipt?: unknown; items: Array<{ sku: string; expected: number; delivered: number; short: number; damaged: number }> }

const brandName = { fresh: "Fresh", style: "Style", tech: "Tech" } as const
const orderTypeName = (business: keyof typeof brandName, type: string) => business === "fresh" ? type : "products"

export const getStoreContext = () => apiRequest<StoreContext>("/store/context")
export const listStoreOrders = () => apiRequest<StoreOrder[]>("/orders?pageSize=100")
export const getStoreOrder = (orderId: string) => apiRequest<StoreOrder>(`/orders/${encodeURIComponent(orderId)}`)

export function getCatalogue(business: keyof typeof brandName, type: string) {
  const query = new URLSearchParams({ brand: brandName[business], orderType: orderTypeName(business, type), pageSize: "100" })
  return apiRequest<ApiProduct[]>(`/catalog/products?${query}`)
}

export function submitStoreOrder(input: { business: keyof typeof brandName; type: string; items: Array<{ id: string; quantity: number }> }) {
  const serviceDate = import.meta.env.VITE_SERVICE_DATE ?? new Date().toISOString().slice(0, 10)
  return apiRequest<CreatedOrder>("/orders", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({ orderType: orderTypeName(input.business, input.type), requestedDate: serviceDate, items: input.items.map((item) => ({ productId: item.id, quantity: item.quantity })) }),
  })
}

export const storeDeliveryApi = {
  list: () => apiRequest<StoreDelivery[]>("/store/deliveries"),
  issuePin: (deliveryId: string) => apiRequest<{ pin: string; expiresAt: string }>(`/store/deliveries/${deliveryId}/pin`, { method: "POST" }),
  confirmFullReceipt: (delivery: StoreDelivery) => apiRequest<StoreDelivery>(`/store/deliveries/${delivery._id}/receipt`, {
    method: "POST",
    headers: { "If-Match": String(delivery.version) },
    body: JSON.stringify({ result: "full", expectedVersion: delivery.version, itemOutcomes: delivery.items.map((item) => ({ sku: item.sku, received: item.delivered })), evidenceFileIds: [] }),
  }),
}

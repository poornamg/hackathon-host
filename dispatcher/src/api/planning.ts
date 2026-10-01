import { apiRequest } from "./client"

export type PlanningOrder = { _id: string; orderNumber: string; outletId: string; brand: "Fresh" | "Style" | "Tech"; items: Array<{ quantity: number; unit: string }>; totalWeightKg: number; cutoffBucket: string; status: string; deferredTo?: string; outlet: { displayName: string; district: string; depot: string } | null }
export type FleetVehicle = { vehicleId: string; type: string; temperatureClass: string; weightCapacityKg: number; kmPerL: number; weeklyFuelQuotaL: number }
export type DriverReference = { _id: string; employeeId: string; name: string; depot?: string }
export type TripDraft = { _id: string; version: number; tripNumber: string; status: string }
export type TripInput = {
  serviceDate: string
  departureAt: string
  plannedEndAt: string
  vehicleId: string
  driverId: string
  distanceKm: number
  stops: Array<{ orderId: string; plannedArrivalAt: string }>
}
export type OperatingDay = { date: string; dayOfWeek: string; isOperating: boolean }

export const planningApi = {
  orders: (serviceDate: string) => apiRequest<PlanningOrder[]>(`/planning/orders?serviceDate=${encodeURIComponent(serviceDate)}&pageSize=100`),
  vehicles: (serviceDate: string) => apiRequest<FleetVehicle[]>(`/reference/vehicles?serviceDate=${encodeURIComponent(serviceDate)}`),
  drivers: () => apiRequest<DriverReference[]>("/reference/drivers"),
  operatingDays: (after: string) => apiRequest<OperatingDay[]>(`/calendar/operating-days/next?after=${encodeURIComponent(after)}&limit=4`),
  createTrip: (input: TripInput) => apiRequest<TripDraft>("/planning/trips", { method: "POST", body: JSON.stringify(input) }),
  validateTrip: (tripId: string) => apiRequest<{ valid: boolean; version: number; rules: Array<{ code: string; passed: boolean; message: string }> }>(`/planning/trips/${tripId}/validate`, { method: "POST" }),
  publishTrip: (tripId: string, version: number) => apiRequest<TripDraft>(`/planning/trips/${tripId}/publish`, { method: "POST", headers: { "If-Match": String(version) }, body: JSON.stringify({ expectedVersion: version }) }),
  deferBatch: (orderIds: string[], nextDate: string, reasonCode: string, note?: string) => apiRequest<Array<{ orderId: string; result: "deferred" | "conflict" }>>("/orders/defer-batch", { method: "POST", body: JSON.stringify({ orderIds, nextDate, reasonCode, note }) }),
}

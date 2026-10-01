import { forbidden } from "../../common/errors.js"
import { Outlet, User } from "../../database/models/index.js"

export async function storeManagerContext(userId: string) {
  const user = await User.findOne({ _id: userId, role: "store_manager", active: true }).lean()
  if (!user?.outletId) throw forbidden("The Store Manager is not assigned to an outlet.")
  const outlet = await Outlet.findOne({ outletId: user.outletId, active: true }).lean()
  if (!outlet) throw forbidden("The assigned outlet is unavailable.")
  return { user, outlet }
}

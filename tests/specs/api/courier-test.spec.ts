import { expect, test } from '@playwright/test'
import {
  assignOrderToCourier,
  createOrder,
  fetchCourierJwt,
  fetchJwt,
  getOrderById,
  updateOrderStatus,
} from '../../helpers/api-helper'
import { StatusDto } from '../../dto/status-dto'

test('create order, assign to courier, change status and verify final state', async ({
  request,
}) => {
  const courierJwt = await fetchCourierJwt(request)
  const jwt = await fetchJwt(request)
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
  await assignOrderToCourier(request, courierJwt, orderId)
  await updateOrderStatus(request, courierJwt, orderId, StatusDto.DELIVERED)
  const updatedOrder = await getOrderById(request, jwt, orderId)
  console.log('Final order data with new status:', updatedOrder)
  expect.soft(updatedOrder.id).toBe(orderId)
  expect.soft(updatedOrder.status).toBe(StatusDto.DELIVERED)
})

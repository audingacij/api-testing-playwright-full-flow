import { test, expect } from '@playwright/test'
import {
  fetchJwt,
  fetchCourierJwt,
  createOrder,
  getOrderById,
  deleteOrder,
  getDeletedOrderById,
  updateOrderStatus,
  assignOrderToCourier,
} from '../../helpers/api-helper'
import { StatusDto } from '../../dto/status-dto'
import { OrderDto } from '../../dto/order-dto'
import { StatusCodes } from 'http-status-codes'

let jwt: string
let courierJwt: string

test.beforeAll(async ({ request }) => {
  jwt = await fetchJwt(request) // student
  courierJwt = await fetchCourierJwt(request) // courier
})

test('login and create order with api-helper', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
})

test('create order and find order by id', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
  const order: OrderDto = await getOrderById(request, jwt, orderId)
  expect.soft(order.id).toBe(orderId)
  expect.soft(order.status).toBe(StatusDto.OPEN)
})

test('create order and delete order by id and get deleted order', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  console.log('orderid is ' + orderId)
  await deleteOrder(request, jwt, orderId)
  await getDeletedOrderById(request, jwt, orderId)
})

test('create order and change order status, then GET the order and console.log response', async ({
  request,
}) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
  await assignOrderToCourier(request, courierJwt, orderId)
  await updateOrderStatus(request, courierJwt, orderId, StatusDto.DELIVERED)
  const updatedOrder = await getOrderById(request, jwt, orderId)
  expect.soft(updatedOrder.status).toBe(StatusDto.DELIVERED)
  const response = await request.get(`https://backend.tallinn-learning.ee/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  console.log('Final order data with new status:', responseBody)
})

test('create two orders and get their ids', async ({ request }) => {
  const orderId1 = await createOrder(request, jwt)
  const orderId2 = await createOrder(request, jwt)
  expect(orderId1).toBeGreaterThan(0)
  expect(orderId2).toBeGreaterThan(0)
  const response = await request.get('https://backend.tallinn-learning.ee/orders', {
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  console.log('Created order IDs:', orderId1, orderId2)
})

test('delete order and verify it is gone from GET/ orders', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  await deleteOrder(request, jwt, orderId)
  const response = await request.get('https://backend.tallinn-learning.ee/orders', {
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  expect.soft(responseBody).not.toContain(orderId)
})

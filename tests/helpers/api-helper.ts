import { APIRequestContext, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { LoginDto } from '../dto/login-dto'
import { OrderDto } from '../dto/order-dto'
import { StatusDto } from '../dto/status-dto'

const serviceURL = 'https://backend.tallinn-learning.ee/'
const studentLoginPath = 'login/student'
const courierLoginPath = 'login/courier'
const orderPath = 'orders'

export async function fetchJwt(request: APIRequestContext): Promise<string> {
  const authResponse = await request.post(`${serviceURL}${studentLoginPath}`, {
    data: LoginDto.createLoginWithCorrectData(),
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return await authResponse.text()
}

export async function createOrder(request: APIRequestContext, jwt: string): Promise<number> {
  const response = await request.post(`${serviceURL}${orderPath}`, {
    data: OrderDto.createOrderWithRandomData(),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  return responseBody.id
}

export async function getOrderById(
  request: APIRequestContext,
  jwt: string,
  id: number,
): Promise<OrderDto> {
  const response = await request.get(`${serviceURL}${orderPath}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const data = await response.json()
  return new OrderDto(
    data.status,
    data.courierId,
    data.customerName,
    data.customerPhone,
    data.comment,
    data.id,
  )
}

export async function deleteOrder(
  request: APIRequestContext,
  jwt: string,
  orderId: number,
): Promise<void> {
  const response = await request.delete(`${serviceURL}${orderPath}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
}

export async function getDeletedOrderById(
  request: APIRequestContext,
  jwt: string,
  id: number,
): Promise<void> {
  const response = await request.get(`${serviceURL}${orderPath}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const data = await response.text()
  expect(data).toBe('')
}

export async function fetchCourierJwt(request: APIRequestContext): Promise<string> {
  const courierResponse = await request.post(`${serviceURL}${courierLoginPath}`, {
    data: {
      username: 'audingacij',
      password: 'Password123',
    },
  })

  if (courierResponse.status() !== StatusCodes.OK) {
    throw new Error(`Courier authorization failed. Status: ${courierResponse.status()}`)
  }
  return await courierResponse.text()
}

export async function assignOrderToCourier(
  request: APIRequestContext,
  jwt: string,
  orderId: number,
): Promise<void> {
  const response = await request.put(`${serviceURL}${orderPath}/${orderId}/assign`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
}

export async function updateOrderStatus(
  request: APIRequestContext,
  jwt: string,
  orderId: number,
  newStatus: StatusDto,
): Promise<void> {
  const response = await request.put(`${serviceURL}${orderPath}/${orderId}/status`, {
    data: { status: newStatus },
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
}

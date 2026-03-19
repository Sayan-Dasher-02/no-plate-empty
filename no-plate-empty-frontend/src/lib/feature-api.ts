import { API } from "@/lib/api";
import {
  getApiErrorMessage,
  getAuthHeaders,
  readApiResponse,
} from "@/lib/auth";

export interface DonorLocation {
  id?: string;
  latitude?: number;
  latitudeDelta?: number;
  longitude?: number;
  longitudeDelta?: number;
  address?: string;
  title?: string;
}

export interface UserSummary {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface DonorEntry {
  _id: string;
  owner?: string | UserSummary;
  title: string;
  imageUrl?: string;
  food?: string[];
  time?: string;
  pickup?: boolean;
  delivery?: boolean;
  isOpen?: boolean;
  rating?: number;
  ratingCount?: number;
  location?: DonorLocation;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  title: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodItem {
  _id: string;
  title: string;
  decription: string;
  imageUrl?: string;
  foodTags?: string;
  catagory?: string;
  code?: string;
  isAvailable?: boolean;
  owner?: string | UserSummary;
  Doner?:
    | string
    | Pick<
        DonorEntry,
        "_id" | "owner" | "title" | "imageUrl" | "time" | "pickup" | "delivery" | "isOpen" | "location"
      >;
  expireTime?: string;
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id: string;
  foods: FoodItem[];
  NGO?: string | { _id?: string; name?: string; email?: string; role?: string };
  donorProfile?:
    | string
    | Pick<
        DonorEntry,
        "_id" | "title" | "imageUrl" | "time" | "pickup" | "delivery" | "isOpen" | "location"
      >;
  donorLocation?: DonorLocation;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

const apiRequest = async <T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
) => {
  const { method = "GET", token, body } = options;
  const headers: HeadersInit = body
    ? {
        "Content-Type": "application/json",
      }
    : {};

  const response = await fetch(`${API}${path}`, {
    method,
    headers: token ? getAuthHeaders(token, headers) : headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const payload = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, "Request failed."));
  }

  return payload as T;
};

export const getCategories = () =>
  apiRequest<{ categories: Category[] }>("/api/v1/category/getAll");

export const createCategory = (
  token: string,
  body: { title: string; imageUrl?: string },
) => apiRequest<{ message: string; newCategory: Category }>("/api/v1/category/create", {
  method: "POST",
  token,
  body,
});

export const updateCategory = (
  token: string,
  id: string,
  body: { title: string; imageUrl?: string },
) =>
  apiRequest<{ message: string }>(`/api/v1/category/update/${id}`, {
    method: "PUT",
    token,
    body,
  });

export const deleteCategory = (token: string, id: string) =>
  apiRequest<{ message: string }>(`/api/v1/category/delete/${id}`, {
    method: "DELETE",
    token,
  });

export const getAllDonorEntries = () =>
  apiRequest<{ Doners: DonorEntry[] }>("/api/v1/Doner/get-all-Doners");

export const getMyDonorEntry = (token: string) =>
  apiRequest<{ doner: DonorEntry }>("/api/v1/Doner/me", {
    token,
  });

export const getMyDonorEntries = (token: string) =>
  apiRequest<{ Doners: DonorEntry[] }>("/api/v1/Doner/my-records", {
    token,
  });

export const getSingleDonorEntry = (id: string) =>
  apiRequest<{ Doner: DonorEntry }>(`/api/v1/Doner/get/${id}`);

export const createDonorEntry = (
  token: string,
  body: Omit<DonorEntry, "_id">,
) =>
  apiRequest<{ message: string; doner: DonorEntry }>("/api/v1/Doner/create", {
    method: "POST",
    token,
    body,
  });

export const updateDonorEntry = (
  token: string,
  id: string,
  body: Partial<Omit<DonorEntry, "_id">>,
) =>
  apiRequest<{ message: string; doner: DonorEntry }>(`/api/v1/Doner/update/${id}`, {
    method: "PUT",
    token,
    body,
  });

export const deleteDonorEntry = (token: string, id: string) =>
  apiRequest<{ message: string }>(`/api/v1/Doner/delete/${id}`, {
    method: "DELETE",
    token,
  });

export const getAllFoods = () =>
  apiRequest<{ foods: FoodItem[] }>("/api/v1/food/get-all-food");

export const getSingleFood = (id: string) =>
  apiRequest<{ food: FoodItem }>(`/api/v1/food/get/${id}`);

export const getFoodsByDonor = (donorOutletId: string) =>
  apiRequest<{ foods: FoodItem[] }>(`/api/v1/food/get-by-doner/${donorOutletId}`);

export const getMyFoods = (token: string) =>
  apiRequest<{ foods: FoodItem[] }>("/api/v1/food/my-foods", {
    token,
  });

export const createFood = (
  token: string,
  body: {
    title: string;
    description: string;
    imageUrl?: string;
    foodTags?: string;
    category: string;
    code: string;
    isAvailable?: boolean;
    outlet: string;
    expireTime?: string;
  },
) =>
  apiRequest<{ message: string; food: FoodItem }>("/api/v1/food/create", {
    method: "POST",
    token,
    body,
  });

export const updateFood = (
  token: string,
  id: string,
  body: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    foodTags: string;
    category: string;
    code: string;
    isAvailable: boolean;
    outlet: string;
    expireTime: string;
  }>,
) =>
  apiRequest<{ message: string; food: FoodItem }>(`/api/v1/food/update/${id}`, {
    method: "PUT",
    token,
    body,
  });

export const deleteFood = (token: string, id: string) =>
  apiRequest<{ message: string }>(`/api/v1/food/delete/${id}`, {
    method: "PUT",
    token,
  });

export const placeOrder = (token: string, cartItems: string[]) =>
  apiRequest<{ message: string; order: OrderItem; donorId: string }>(
    "/api/v1/food/place-order",
    {
      method: "POST",
      token,
      body: { cartItems },
    },
  );

export const getNgoOrders = (token: string) =>
  apiRequest<{ orders: OrderItem[] }>("/api/v1/food/my-orders", {
    token,
  });

export const getDonorOrders = (token: string) =>
  apiRequest<{ orders: OrderItem[] }>("/api/v1/food/donor-orders", {
    token,
  });

export const updateOrderStatus = (
  token: string,
  orderId: string,
  status: OrderItem["status"],
) =>
  apiRequest<{ message: string; order: OrderItem }>(
    `/api/v1/food/order-status/${orderId}`,
    {
      method: "PATCH",
      token,
      body: { status },
    },
  );

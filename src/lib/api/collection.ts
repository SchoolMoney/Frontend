import { api_middleware } from '$lib/api_middleware';
import { CollectionStatus, type Collection, type FormattedGetCollectionsParams, type GetCollectionsParams } from '$lib/models/collection';

const tempCollections: Collection[] = [
  {
    id: 1,
    logo_path: '/path/to/logo1.png',
    name: 'Spring Collection',
    description: 'A vibrant and fresh collection to welcome spring.',
    start_date: new Date('2025-03-01'),
    end_date: new Date('2025-03-31'),
    status: CollectionStatus.OPEN,
    price: 250.00,
    bank_account_id: 0,
    owner_id: 0,
    class_group_id: 0,
  },
  {
    id: 2,
    name: 'Summer Collection',
    description: 'Bright and breezy styles for summer.',
    start_date: new Date('2025-06-01'),
    end_date: new Date('2025-06-30'),
    status: CollectionStatus.FINISHED,
    price: 300.00,
    bank_account_id: 0,
    owner_id: 0,
    class_group_id: 0,
  },
  {
    id: 3,
    name: 'Autumn Collection',
    description: 'Warm and cozy options for autumn.',
    start_date: new Date('2025-09-01'),
    status: CollectionStatus.NOT_PAID_BEFORE_DEADLINE,
    price: 200.00,
    bank_account_id: 0,
    owner_id: 0,
    class_group_id: 0,
  },
  {
    id: 4,
    logo_path: '/path/to/logo4.png',
    name: 'Winter Collection',
    description: 'Stylish winter gear for the coldest months.',
    start_date: new Date('2025-12-01'),
    end_date: new Date('2026-01-31'),
    status: CollectionStatus.CANCELLED,
    price: 350.00,
    bank_account_id: 0,
    owner_id: 0,
    class_group_id: 0,
  }
];


export async function getCollections(params: FormattedGetCollectionsParams): Promise<Collection[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.name) queryParams.append('name', params.name);
    if (params?.start_date_from) queryParams.append('start_date_from', params.start_date_from);
    if (params?.start_date_to) queryParams.append('start_date_to', params.start_date_to);
    if (params?.end_date_from) queryParams.append('end_date_from', params.end_date_from);
    if (params?.end_date_to) queryParams.append('end_date_to', params.end_date_to);
    if (params?.status !== undefined) queryParams.append('collection_status', params.status.toString());

    const response = await api_middleware.get(`/api/collection?${queryParams.toString()}`);
    return response;
  } catch (e) {
    console.error("Error fetching collections: ", e);
    throw e;
  }
}

export async function getCollectionById(collectionId: number): Promise<Collection> {
  try {
    return await api_middleware.get(`/api/collection/${collectionId}`);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function createCollection(collection: Collection): Promise<Collection> {
  try {
    return await api_middleware.post(`/api/collection`, collection);
  } catch (e) {
    console.error("Error creating collection: ", e);
    throw e;
  }
}

export async function updateCollection(collection: Collection): Promise<Collection> {
  try {
    return await api_middleware.put(`/api/collection/${collection.id}`, collection);
  } catch (e) {
    console.error("Error updating collection: ", e);
    throw e;
  }
}

export async function cancelCollection(collection_id: number): Promise<void> {
  try {
    await api_middleware.put(`/api/collection/${collection_id}/cancel`, undefined);
  } catch(e) {
    console.error("Error cancelling collection: ", e);
    throw e;
  }
}

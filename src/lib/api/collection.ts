import { api_middleware } from '$lib/api_middleware';
import { Status, type Collection, type FormattedGetCollectionsParams, type GetCollectionsParams } from '$lib/models/collection';

const tempCollections: Collection[] = [
  {
    id: 1,
    logo_path: '/path/to/logo1.png',
    name: 'Spring Collection',
    description: 'A vibrant and fresh collection to welcome spring.',
    start_date: new Date('2025-03-01'),
    end_date: new Date('2025-03-31'),
    status: Status.OPEN,
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
    status: Status.FINISHED,
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
    status: Status.NOT_PAID_BEFORE_DEADLINE,
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
    status: Status.CANCELLED,
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
      if (params?.status !== undefined) queryParams.append('status', params.status.toString());

      const response = await api_middleware.get(`/api/collection?${queryParams.toString()}`);
      return response;
  } catch (error) {
      console.error("Error fetching collections: ", error);
      throw error;
  }
}

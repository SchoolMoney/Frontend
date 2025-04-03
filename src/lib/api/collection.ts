import { baseApiUrl } from '../../config';
import { Status, type Collection, type FormattedGetCollectionsParams, type GetCollectionsParams } from '../models/collection';
import { getToken } from './auth';

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
  },
  {
    id: 2,
    name: 'Summer Collection',
    description: 'Bright and breezy styles for summer.',
    start_date: new Date('2025-06-01'),
    end_date: new Date('2025-06-30'),
    status: Status.FINISHED,
    price: 300.00,
  },
  {
    id: 3,
    name: 'Autumn Collection',
    description: 'Warm and cozy options for autumn.',
    start_date: new Date('2025-09-01'),
    status: Status.NOT_PAID_BEFORE_DEADLINE,
    price: 200.00,
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
  }
];


export async function getCollections(params?: FormattedGetCollectionsParams): Promise<Collection[]> {
  console.log(params);
  return Promise.resolve(tempCollections.filter(c => 
    c.name.toLowerCase().includes(params?.name?.toLocaleLowerCase() ?? '')
    // && (!params?.start_date || params?.start_date?.getFullYear() === c.start_date.getFullYear())
    // && (!params?.end_date || params?.end_date?.getFullYear() === c.start_date.getFullYear())
    && (params?.status === undefined || params?.status === c.status)
  ));
  // const response = await fetch(`${baseApiUrl}/api/auth/login`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
	// 		Authorization: `Bearer ${getToken()}`,
  //   },
  // });

  // if (!response.ok) {
  //   const { detail } = await response.json();
  //   throw new Error(detail);
  // }

  // return await response.json();
}
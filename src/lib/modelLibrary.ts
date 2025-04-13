export interface Model {
  id: string;
  gender: 'male' | 'female';
  imageUrl: string;
  name: string;
}

export const maleModels: Model[] = [
  {
    id: 'male1',
    gender: 'male',
    imageUrl: '/models/male/male1.png',
    name: 'Male Model 1'
  },
  {
    id: 'male2',
    gender: 'male',
    imageUrl: '/models/male/male2.png',
    name: 'Male Model 2'
  },
  {
    id: 'male3',
    gender: 'male',
    imageUrl: '/models/male/male3.png',
    name: 'Male Model 3'
  },
  {
    id: 'male4',
    gender: 'male',
    imageUrl: '/models/male/male4.png',
    name: 'Male Model 4'
  }
];

export const femaleModels: Model[] = [
  {
    id: 'female1',
    gender: 'female',
    imageUrl: '/models/female/women1.png',
    name: 'Female Model 1'
  },
  {
    id: 'female2',
    gender: 'female',
    imageUrl: '/models/female/women2.png',
    name: 'Female Model 2'
  },
  {
    id: 'female3',
    gender: 'female',
    imageUrl: '/models/female/women3.png',
    name: 'Female Model 3'
  },
  {
    id: 'female4',
    gender: 'female',
    imageUrl: '/models/female/women4.png',
    name: 'Female Model 4'
  }
];

export const getAllModels = (): Model[] => [...maleModels, ...femaleModels];

export const getModelsByGender = (gender: 'male' | 'female'): Model[] => {
  return gender === 'male' ? maleModels : femaleModels;
};

export const getModelById = (id: string): Model | undefined => {
  return getAllModels().find(model => model.id === id);
}; 
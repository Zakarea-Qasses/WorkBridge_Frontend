export interface GovernorateItem {
  id: number;
  name: string;
}

export interface CityItem {
  id: number;
  governorateId: number;
  name: string;
}

export const governorates: GovernorateItem[] = [
  { id: 1, name: 'Damascus' },
  { id: 2, name: 'Rural Damascus' },
  { id: 3, name: 'Aleppo' },
  { id: 4, name: 'Homs' },
  { id: 5, name: 'Latakia' },
];

export const cities: CityItem[] = [
  { id: 101, governorateId: 1, name: 'Damascus' },
  { id: 201, governorateId: 2, name: 'Jaramana' },
  { id: 202, governorateId: 2, name: 'Douma' },
  { id: 301, governorateId: 3, name: 'Aleppo' },
  { id: 302, governorateId: 3, name: 'Azaz' },
  { id: 401, governorateId: 4, name: 'Homs' },
  { id: 402, governorateId: 4, name: 'Palmyra' },
  { id: 501, governorateId: 5, name: 'Latakia' },
  { id: 502, governorateId: 5, name: 'Jableh' },
];

export function getCitiesByGovernorate(governorateId: number) {
  return cities.filter((city) => city.governorateId === governorateId);
}

export function getLocationLabel(governorateId?: number, cityId?: number) {
  const governorate = governorates.find((item) => item.id === governorateId);
  const city = cities.find((item) => item.id === cityId);

  if (city && governorate) {
    return `${city.name} - ${governorate.name}`;
  }

  if (governorate) {
    return governorate.name;
  }

  return 'Not specified';
}

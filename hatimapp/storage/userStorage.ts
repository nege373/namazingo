import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  firstName: string;
  lastName: string;
  country?: string;
};

const USER_KEY = '@hatimapp_user';

export async function getUser(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}


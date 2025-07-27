import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useSessionState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = sessionStorage.getItem(key);
    return (storedValue ? JSON.parse(storedValue!) : defaultValue) as T;
  });
  useEffect(() => sessionStorage.setItem(key, JSON.stringify(value)), [value]);
  return [value, setValue];
}

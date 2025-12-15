import { useEffect, useState } from "react";

import { usernameKey } from "@/utils/constants";
import { generateUserName } from "@/utils/generate-user-name";

export const useUsername = () => {
  const [username, setUsername] = useState("Generating Username...");

  useEffect(() => {
    const fn = () => {
      // username
      const storedUserName = localStorage.getItem(usernameKey);
      if (storedUserName) {
        setUsername(storedUserName);
        return;
      }
      const newUsername = generateUserName();
      localStorage.setItem(usernameKey, newUsername);
      setUsername(newUsername);
    };
    fn();
  }, []);

  return { username };
};

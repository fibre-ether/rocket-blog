import { useEffect, useState } from "react";

function UseUsername() {
  const [userName, setUserName ] = useState<string>("anon")
  useEffect(() => {
    let localStorageUserName = localStorage.getItem("username")

    if (!localStorageUserName) {
      localStorageUserName = "anon-"+ Math.floor(Math.random()*100000+9999)
    }

    setUserName(localStorageUserName)
  }, []);

  return {userName}
}

export default UseUsername;

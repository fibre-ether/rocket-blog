function UseUsername() {
  let userName = "anon";
  // const [userName, setUserName] = useState<string>("anon");
  // useEffect(() => {
  let localStorageUserName = "anon-12345"; //localStorage.getItem("username")

  if (!localStorageUserName) {
    localStorageUserName = "anon-" + Math.floor(Math.random() * 100000 + 9999);
  }

  // setUserName(localStorageUserName);
  userName = localStorageUserName;
  // }, []);

  return { userName };
}

export default UseUsername;

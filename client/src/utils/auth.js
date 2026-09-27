export const getToken = () => {
  return localStorage.getItem(
    "intelliflow_token"
  );
};


export const getStoredUser = () => {

  const storedUser =
    localStorage.getItem(
      "intelliflow_user"
    );


  if (!storedUser) {
    return null;
  }


  try {

    return JSON.parse(
      storedUser
    );

  } catch (error) {

    return null;
  }
};


export const setSession = (
  token,
  user
) => {

  localStorage.setItem(
    "intelliflow_token",
    token
  );


  localStorage.setItem(
    "intelliflow_user",
    JSON.stringify(
      user
    )
  );
};


export const clearSession = () => {

  localStorage.removeItem(
    "intelliflow_token"
  );


  localStorage.removeItem(
    "intelliflow_user"
  );
};


export const isAuthenticated = () => {

  const token =
    getToken();

  const user =
    getStoredUser();


  return Boolean(
    token &&
    user
  );
};


export const logout = () => {

  clearSession();


  window.location.href =
    "/";
};
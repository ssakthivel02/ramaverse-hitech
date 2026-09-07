/**
 * Public Website mode does not require an identity provider.
 * Keep this adapter so optional account UI can remain provider-neutral.
 */
export const startLogin = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ramaverse:auth-optional"));
  }
};

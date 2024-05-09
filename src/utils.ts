export const jsScriptGenerator = () => `class AuthenticatorConsts {
    BASE_URL = "http://localhost:3000";
    DEFAULT_ADMIN_URL = this.BASE_URL + "/web/client/admin";
    LOGON_URL = this.BASE_URL + "/web/client/logon";
    DEFAULT_CLIENT_URL = this.LOGON_URL;
  }
  const AUTHENTICATOR_CONST = new AuthenticatorConsts();
  
  const authenticationSetup = function (
    id_authentication_screen_container,
    default_authenticated_url
  ) {
    document.getElementById(id_authentication_screen_container).innerHTML =
      '<iframe id="authenticator-iframe-logon" src="/web/logon/" frameborder="0" class="border-black h-[100vh]" width="300"></iframe>';
  
    window.addEventListener(
      "message",
      (event) => {
        console.log(event);
        if (event.origin !== AUTHENTICATOR_CONST.BASE_URL) return;
  
        const data = JSON.parse(event.data);
  
        if (!data) return;
  
        if (data.type == "logon" && data.success)
          return (window.location = default_authenticated_url);
      },
      true
    );
  };
  
  const logoutSetup = function (
    id_logout_screen_container,
    default_unauthenticated_url
  ) {
    document.getElementById(id_logout_screen_container).innerHTML =
      '<iframe src="/web/user-options/" frameborder="0"></iframe>';
  
    window.addEventListener(
      "message",
      (event) => {
        console.log(event);
        if (event.origin !== AUTHENTICATOR_CONST.BASE_URL) return;
  
        const data = JSON.parse(event.data);
  
        if (!data) return;
  
        if (data.type == "logout" && data.success)
          window.location = default_unauthenticated_url;
      },
      true
    );
  };`;

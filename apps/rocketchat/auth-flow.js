/*
 * Template for JavaScript based authenticator's.
 * See org.keycloak.authentication.authenticators.browser.ScriptBasedAuthenticatorFactory
 */

// import enum for error lookup
AuthenticationFlowError = Java.type("org.keycloak.authentication.AuthenticationFlowError");
Response = Java.type("javax.ws.rs.core.Response");
UriBuilder = Java.type("javax.ws.rs.core.UriBuilder");

/**
 * An example authenticate function.
 *
 * The following variables are available for convenience:
 * user - current user {@see org.keycloak.models.UserModel}
 * realm - current realm {@see org.keycloak.models.RealmModel}
 * session - current KeycloakSession {@see org.keycloak.models.KeycloakSession}
 * httpRequest - current HttpRequest {@see org.jboss.resteasy.spi.HttpRequest}
 * script - current script {@see org.keycloak.models.ScriptModel}
 * authenticationSession - current authentication session {@see org.keycloak.sessions.AuthenticationSessionModel}
 * LOG - current logger {@see org.jboss.logging.Logger}
 *
 * You one can extract current http request headers via:
 * httpRequest.getHttpHeaders().getHeaderString("Forwarded")
 *
 * @param context {@see org.keycloak.authentication.AuthenticationFlowContext}
 */
function authenticate(context) {
    var authShouldFail = false;
    var hasRole = user.hasRole(realm.getRole("rocketchat-users"));
    
    LOG.info("user:" + user.getUsername() + " client-d:"+authenticationSession.getClient().getClientId() + " has-role:"+hasRole)
    
    if (authenticationSession.getClient().getClientId().toLowerCase() == 'rocketchat' && !hasRole) {
        authShouldFail=true
    }

    if (authShouldFail) {
        uriBuilder = UriBuilder.fromUri("https://reggie-web-static-test-devhub-test.pathfinder.gov.bc.ca");
        responseBuilder = Response.temporaryRedirect(uriBuilder.build());
        context.failure(AuthenticationFlowError.INVALID_USER, responseBuilder.build());
        return;
    }

    context.success();
}
import os
from keycloak import KeycloakOpenID, KeycloakAdmin

def _get_keycloak_client():
    """
    Returns a Keycloak client configured for the hornet-finder realm.

    :return: A KeycloakOpenID instance for authentication and token management.
    :rtype: KeycloakOpenID
    """
    return KeycloakOpenID(
        server_url="http://hornet-finder-keycloak:8080/",
        client_id="hornet-api",
        realm_name="hornet-finder",
        client_secret_key=os.getenv("KC_CLIENT_SECRET")
    )

def _get_keycloak_admin():
    """
    Returns a Keycloak admin client configured for the hornet-finder realm.

    :return: A KeycloakAdmin instance for managing users and roles.
    :rtype: KeycloakAdmin
    """
    return KeycloakAdmin(
        server_url="http://hornet-finder-keycloak:8080/",
        realm_name="hornet-finder",
        client_id="hornet-api",
        client_secret_key=os.getenv("KC_CLIENT_SECRET")
    )

def get_realm_public_key():
    """
    Returns the public key of the hornet-finder realm.
    
    :return: The public key of the realm.
    :rtype: str
    """
    keycloak_openid = _get_keycloak_client()
    public_key = keycloak_openid.public_key()
    pem_public_key = "-----BEGIN PUBLIC KEY-----\n" + public_key + "\n-----END PUBLIC KEY-----"
    return pem_public_key

def user_exists(email: str) -> bool:
    """
    Checks if a user with the given email exists in the hornet-finder realm.

    :param email: The email of the user to check.
    :type email: str

    :return: True if the user exists, False otherwise.
    :rtype: bool
    """
    keycloak_admin = _get_keycloak_admin()
    return keycloak_admin.get_user_id(email) is not None

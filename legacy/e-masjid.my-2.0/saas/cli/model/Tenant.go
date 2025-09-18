package model

type Tenant struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Namespace        string `json:"namespace"`
	ManagerRole      string `json:"manager_role"`
	UserRole         string `json:"user_role"`
	KeycloakClientId string `json:"keycloak_client_id"`
	KeycloakServer   string `json:"keycloak_server"`
	KeycloakJwksUrl  string `json:"keycloak_jwks_url"`
	SeparateDb       bool   `json:"separate_db"`
	CreatedAt        int64  `json:"created_at"`
}
